#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "env.h"
#include <time.h>
#include "HX711.h"
#include <LittleFS.h>

// WiFi
String ssid, password;
unsigned long ultimoIntentoWiFi = 0;
int reintentosWiFi = 0;
bool esperandoReconectar = false;
unsigned long ultimoParpadeo = 0;
bool estadoLED = false;

// Device & MQTT
const char THINGNAME[] = "KPCL0022";
const char MQTT_HOST[] = "a2fvfjwoybq3qw-ats.iot.us-east-2.amazonaws.com";
const char AWS_IOT_PUBLISH_TOPIC[] = "KPCL0022/pub";
const char AWS_IOT_SUBSCRIBE_TOPIC[] = "KPCL0022/sub";

// Tiempo
long interval = 5000; // Ahora modificable por MQTT
const int8_t TIME_ZONE = -4;
unsigned long lastMillis = 0;

// Cliente seguro
WiFiClientSecure net;
BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);
PubSubClient client(net);

// DHT11
#define DHTPIN D5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// HX711
const int LOADCELL_DOUT_PIN = 12;
const int LOADCELL_SCK_PIN = 13;
HX711 scale;

// Estado de lectura
const int LECTURAS_REQUERIDAS = 3;
int lecturasValidas = 0;

// === FUNCIONES ===
void leerCredencialesWiFi() {
  if (!LittleFS.exists("/wifi.txt")) {
    ssid = "Jeivos";
    password = "jdayne2121";
    return;
  }
  File file = LittleFS.open("/wifi.txt", "r");
  if (file) {
    ssid = file.readStringUntil('\n');
    ssid.trim();
    password = file.readStringUntil('\n');
    password.trim();
    file.close();
  }
}

void guardarCredencialesWiFi(String newSSID, String newPASS) {
  File file = LittleFS.open("/wifi.txt", "w");
  if (file) {
    file.println(newSSID);
    file.println(newPASS);
    file.close();
    Serial.println("Credenciales guardadas. Reiniciando...");
    delay(1000);
    ESP.restart();
  }
}

void guardarOffsetBalanza(long offset) {
  File file = LittleFS.open("/scale_offset.txt", "w");
  if (file) {
    file.print(offset);
    file.close();
    Serial.println("Offset de la balanza guardado: " + String(offset));
  } else {
    Serial.println("Error al guardar el offset de la balanza.");
  }
}

void conectarWiFi() {
  Serial.println("Conectando a: " + ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nNo se pudo conectar a WiFi");
  }
}

void NTPConnect() {
  configTime(TIME_ZONE * 3600, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = time(nullptr);
  while (now < 1510592825) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nHora sincronizada");
}

String getFormattedTime() {
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%d/%m/%Y, %H:%M:%S", timeinfo);
  return String(buffer);
}

bool internetConectado() {
  return WiFi.status() == WL_CONNECTED;
}

void publishMessage() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  int lightValue = analogRead(A0);
  float light = map(lightValue, 0, 1023, 0, 500);
  float weight = scale.get_units(10);
  String timestamp = getFormattedTime();

  if (!isnan(h) && !isnan(t)) {
    lecturasValidas++;
    if (lecturasValidas > LECTURAS_REQUERIDAS) {
      lecturasValidas = LECTURAS_REQUERIDAS;
    }
  }

  String status = (internetConectado() && lecturasValidas >= LECTURAS_REQUERIDAS) ? "online" : "offline";

  StaticJsonDocument<256> doc;
  doc["device_id"] = THINGNAME;
  doc["timestamp"] = timestamp;
  doc["humidity"] = h;
  doc["temperature"] = t;
  doc["light"] = light;
  doc["weight"] = weight;
  doc["status"] = status;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  // Enciende LED brevemente al publicar
  digitalWrite(LED_BUILTIN, LOW);
  delay(100);
  digitalWrite(LED_BUILTIN, HIGH);

  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);

  Serial.print("Device ID: " + String(THINGNAME));
  Serial.print(", Timestamp: " + timestamp);
  Serial.print(", Humidity: " + String(h) + " %");
  Serial.print(", Temperature: " + String(t) + " °C");
  Serial.print(", Light: " + String(light) + " lux");
  Serial.print(", Weight: " + String(weight) + " g");
  Serial.println(", Status: " + status);
}

void messageReceived(char *topic, byte *payload, unsigned int length) {
  payload[length] = '\0';
  String mensaje = String((char *)payload);
  Serial.println("Mensaje recibido: " + mensaje);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, mensaje);
  if (!error) {
    if (doc.containsKey("ssid") && doc.containsKey("password")) {
      guardarCredencialesWiFi(doc["ssid"], doc["password"]);
    }

    // Opción de TARA remota
    if (doc.containsKey("tare") && doc["tare"] == true) {
      Serial.println("Ejecutando tara del sensor de peso...");
      scale.tare();
      Serial.println("Tara completada.");
      guardarOffsetBalanza(scale.get_offset());
    }

    // Actualizar intervalo de muestreo si viene un nuevo valor
    if (doc.containsKey("interval")) {
      long nuevoInterval = doc["interval"];
      if (nuevoInterval > 0) {
        interval = nuevoInterval;
        Serial.println("Nuevo intervalo de muestreo: " + String(interval) + " ms");
      }
    }

  } else {
    Serial.println("Error al parsear JSON recibido.");
  }
}

void conectarAWS() {
  NTPConnect();
  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &key);
  client.setServer(MQTT_HOST, 8883);
  client.setCallback(messageReceived);

  Serial.println("Conectando a AWS IoT Core...\n");
  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(1000);
  }

  if (client.connected()) {
    Serial.println(String(THINGNAME) + " Conectado a AWS IoT Core");
    client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
  }
}

void gestionarReconexiónWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    esperandoReconectar = false;
    reintentosWiFi = 0;
    digitalWrite(LED_BUILTIN, HIGH); // Apaga LED
    return;
  }

  unsigned long ahora = millis();
  unsigned long tiempoEspera;

  switch (reintentosWiFi) {
    case 0: tiempoEspera = 1000; break;
    case 1: tiempoEspera = 3000; break;
    default: tiempoEspera = 6000; break;
  }

  // LED parpadeo
  if (ahora - ultimoParpadeo >= 500) {
    estadoLED = !estadoLED;
    digitalWrite(LED_BUILTIN, estadoLED ? LOW : HIGH);
    ultimoParpadeo = ahora;
  }

  if (!esperandoReconectar) {
    esperandoReconectar = true;
    ultimoIntentoWiFi = ahora;
  }

  if (ahora - ultimoIntentoWiFi >= tiempoEspera) {
    Serial.println("Intentando reconectar WiFi...");
    conectarWiFi();
    esperandoReconectar = false;
    reintentosWiFi++;
    if (WiFi.status() == WL_CONNECTED) {
      conectarAWS();
    }
  }
}

void setup() {
  Serial.begin(115200);
  LittleFS.begin();
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);  // Apagado por defecto (activo LOW)
  leerCredencialesWiFi();
  conectarWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    conectarAWS();
  }

  dht.begin();
  pinMode(A0, INPUT);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(4198);

  if (LittleFS.exists("/scale_offset.txt")) {
    File file = LittleFS.open("/scale_offset.txt", "r");
    if (file) {
      String offsetStr = file.readString();
      file.close();
      long offset = offsetStr.toInt();
      scale.set_offset(offset);
      Serial.println("Offset de balanza cargado desde archivo: " + String(offset));
    }
  } else {
    Serial.println("No se encontró archivo de offset. Realizando tara inicial...");
    scale.tare();
    guardarOffsetBalanza(scale.get_offset());
  }
}

void loop() {
  if (millis() - lastMillis > interval) {
    lastMillis = millis();
    if (client.connected()) {
      publishMessage();
    }
  }

  if (WiFi.status() != WL_CONNECTED) {
    gestionarReconexiónWiFi();
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    conectarAWS();
  }

  client.loop();
}
