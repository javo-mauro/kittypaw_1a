import * as fs from 'fs';
import * as path from 'path';

// Este archivo centraliza la configuración de la aplicación.
// Lee las credenciales de AWS IoT desde archivos, lo cual es una buena práctica.

export const config = {
  mqtt: {
    host: 'a2fvfjwoybq3qw-ats.iot.us-east-2.amazonaws.com', // Tu endpoint de AWS IoT
    port: 8883,
    protocol: 'mqtts',
    clientId: `kittypaw_backend_${Date.now()}`,
    
    // Período de reconexión en milisegundos. 0 deshabilita la reconexión automática.
    // La librería MQTT.js se encargará de reintentar la conexión.
    reconnectPeriod: 5000, // 5 segundos
    
    // Rutas a tus certificados. Asegúrate de que estos archivos existan.
    // Deberás descargar el 'AmazonRootCA1.pem' y tener los certificados
    // que creaste para tu "thing" o un usuario con permisos.
    key: fs.readFileSync(path.join(__dirname, '../certs/private.pem.key')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/certificate.pem.crt')),
    ca: fs.readFileSync(path.join(__dirname, '../certs/AmazonRootCA1.pem')),
  }
};