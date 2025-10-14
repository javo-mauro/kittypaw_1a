import { MqttHandler } from './mqtt_handler';
import { config } from './config';

console.log('Iniciando Backend de KittyPaw...');

// Crear una instancia del manejador de MQTT con la configuración importada
const mqttHandler = new MqttHandler(config.mqtt);

// Iniciar la conexión
mqttHandler.connect();