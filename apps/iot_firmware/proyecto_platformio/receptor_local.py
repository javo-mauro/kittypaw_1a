import paho.mqtt.client as mqtt
from datetime import datetime

# --- Configuracion ---
BROKER_IP = "127.0.0.1"  # Escuchar en la maquina local
BROKER_PORT = 1883
TOPIC_EVENTS = "kittypaw/events"
TOPIC_REPORTS = "kittypaw/reports/health"
OUTPUT_FILE = "datos_sensores.txt"

# --- Funciones ---

def on_connect(client, userdata, flags, rc):
    """Callback que se ejecuta al conectar al broker."""
    if rc == 0:
        print(f"Conectado exitosamente al broker en {BROKER_IP}")
        client.subscribe([(TOPIC_EVENTS, 0), (TOPIC_REPORTS, 0)])
        print(f"Suscrito a los temas: '{TOPIC_EVENTS}' y '{TOPIC_REPORTS}'")
    else:
        print(f"Fallo al conectar, codigo de error: {rc}")

def on_message(client, userdata, msg):
    """Callback que se ejecuta al recibir un mensaje."""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        payload = msg.payload.decode("utf-8")
        log_entry = f"[{timestamp}] | Tema: {msg.topic} | Datos: {payload}\n"
        
        print(log_entry, end='') # Mostrar en consola
        
        # Guardar en archivo
        with open(OUTPUT_FILE, "a") as f:
            f.write(log_entry)
            
    except Exception as e:
        print(f"Error procesando el mensaje: {e}")

# --- Programa Principal ---

if __name__ == "__main__":
    # Crear y configurar el cliente
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    print("Iniciando receptor local...")
    try:
        client.connect(BROKER_IP, BROKER_PORT, 60)
        print(f"Intentando conectar a {BROKER_IP}...")
        
        # Bucle infinito para mantener el script escuchando
        client.loop_forever()
        
    except KeyboardInterrupt:
        print("\nReceptor detenido por el usuario.")
    except Exception as e:
        print(f"Ocurrio un error: {e}")
    finally:
        client.disconnect()
        print("Desconectado del broker.")
