import React from 'react';

const AddDevice: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Añadir Dispositivo</h1>

      <div className="bg-gray-200 aspect-square max-w-md mx-auto mb-4 flex items-center justify-center">
        {/* Placeholder for QR Code Scanner */}
        <p className="text-gray-500">Cargando escáner de QR...</p>
      </div>

      <p className="text-center text-gray-600 mb-4">
        Escanea el código QR en tu dispositivo KittyPaw para vincularlo a tu cuenta.
      </p>

      <div className="max-w-md mx-auto">
        <p className="text-center mb-2">¿Problemas con la cámara?</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingresa el código manualmente"
            className="flex-grow p-2 border rounded"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Vincular
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDevice;
