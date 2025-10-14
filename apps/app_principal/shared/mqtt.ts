import mqtt from 'mqtt';
import { db } from '../db/drizzle';
import { devices, deviceHealthReports } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://test.mosquitto.org';
const HEALTH_REPORT_TOPIC = 'kittypaw/reports/health';

interface HealthReportPayload {
  deviceId: string; // El ID físico, ej: "KP-AABBCC"
  timestamp: string;
  firmwareVersion: string;
  overallStatus: 'PASS' | 'FAIL';
  // 'results' no se usa directamente pero es parte del payload
}

export function initializeMqttListener() {
  const client = mqtt.connect(MQTT_BROKER_URL);

  client.on('connect', () => {
    console.log('🔌 Conectado al Broker MQTT.');

    // Suscripción al tópico de reportes de salud
    client.subscribe(HEALTH_REPORT_TOPIC, (err) => {
      if (!err) {
        console.log(`👂 Suscrito exitosamente al tópico: ${HEALTH_REPORT_TOPIC}`);
      } else {
        console.error('❌ Error al suscribirse al tópico de salud:', err);
      }
    });
  });

  client.on('message', async (topic, message) => {
    console.log(`📬 Mensaje recibido en el tópico: ${topic}`);

    if (topic === HEALTH_REPORT_TOPIC) {
      await handleHealthReport(message);
    }
    // Aquí se podrían añadir más `if` para manejar otros tópicos en el futuro
  });

  client.on('error', (error) => {
    console.error('❌ Error en el cliente MQTT:', error);
  });

  client.on('close', () => {
    console.log('🔌 Cliente MQTT desconectado.');
  });
}

async function handleHealthReport(message: Buffer) {
  try {
    const messageString = message.toString();
    const payload: HealthReportPayload = JSON.parse(messageString);

    console.log('🩺 Procesando reporte de salud para el dispositivo:', payload.deviceId);

    // 1. Buscar el ID interno del dispositivo usando su ID físico (del reporte)
    const deviceRecord = await db.query.devices.findFirst({
      where: eq(devices.deviceId, payload.deviceId),
      columns: { id: true },
    });

    if (!deviceRecord) {
      console.warn(`⚠️ Reporte de salud recibido para un dispositivo no registrado: ${payload.deviceId}`);
      return;
    }

    // 2. Insertar el reporte en la base de datos
    await db.insert(deviceHealthReports).values({
      deviceId: deviceRecord.id, // Usamos el ID numérico de la tabla
      timestamp: new Date(payload.timestamp),
      firmwareVersion: payload.firmwareVersion,
      report: messageString, // Guardamos el JSON completo
      overallStatus: payload.overallStatus,
    });

    console.log(`✅ Reporte de salud para ${payload.deviceId} guardado en la base de datos.`);

  } catch (error) {
    console.error('❌ Error procesando el mensaje de reporte de salud:', error);
  }
}