import * as mqtt from 'mqtt';
import * as fs from 'fs';
import * as path from 'path';

const EVENTS_TOPIC = 'kittypaw/events';
// Definimos la ruta del archivo de log en la raíz de la carpeta del backend
const LOG_FILE_PATH = path.join(__dirname, '../../events.log');

export class MqttHandler {
  private client: mqtt.MqttClient;
  private options: mqtt.IClientOptions;

  constructor(options: mqtt.IClientOptions) {
    this.options = options;
  }

  public connect() {
    this.client = mqtt.connect(this.options);

    this.client.on('connect', () => {
      console.log('Conectado exitosamente a AWS IoT Core!');
      
      // Nos suscribimos al topic donde los dispositivos publican eventos
      this.client.subscribe(EVENTS_TOPIC, (err) => {
        if (!err) {
          console.log(`Suscrito correctamente al topic: ${EVENTS_TOPIC}`);
        } else {
          console.error('Error al suscribirse:', err);
        }
      });
    });

    this.client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload);
    });

    this.client.on('error', (error) => {
      console.error('Error de conexión MQTT:', error);
    });

    this.client.on('close', () => {
      console.log('Conexión MQTT cerrada.');
    });

    this.client.on('reconnect', () => {
      console.log('Intentando reconectar a AWS IoT...');
    });
  }

  private handleMessage(topic: string, payload: Buffer) {
    console.log(`Mensaje recibido en el topic: ${topic}`);
    try {
      const message = JSON.parse(payload.toString());

      // --- Aquí iría la lógica de negocio ---
      // 1. Validar el payload.
      if (!this.isValidConsumptionEvent(message)) {
        console.warn('Mensaje con formato inválido descartado:', message);
        return; // Detener el procesamiento si el mensaje no es válido
      }

      console.log('Payload (válido):', message);

      // 2. Extraer los datos del evento (deviceId, duración, cantidad).
      // 3. Guardar los datos en una base de datos (MongoDB, PostgreSQL, etc.).
      // 4. Opcionalmente, realizar alguna otra acción (enviar una notificación, etc.).
      const logEntry = `${new Date().toISOString()}: ${payload.toString()}\n`;

      fs.appendFile(LOG_FILE_PATH, logEntry, (err) => {
        if (err) {
          console.error('Error al escribir en el archivo de log:', err);
        }
      });
    } catch (error) {
      console.error('Error al procesar el mensaje JSON:', error);
    }
  }

  /**
   * Valida que el objeto del mensaje tenga la estructura de un evento de consumo.
   * @param data El objeto parseado desde el payload JSON.
   * @returns `true` si el formato es válido, `false` en caso contrario.
   */
  private isValidConsumptionEvent(data: any): boolean {
    if (
      !data ||
      typeof data.deviceId !== 'string' ||
      typeof data.timestamp !== 'string' ||
      data.eventType !== 'consumo' ||
      typeof data.payload !== 'object' ||
      data.payload === null ||
      (data.payload.mode !== 'comedero' && data.payload.mode !== 'bebedero') ||
      typeof data.payload.duration_seconds !== 'number' ||
      typeof data.payload.amount_consumed_grams !== 'number'
    ) {
      return false;
    }
    return true;
  }
}