const isCapacitor = () => {
  // Esta función detectaría si la app corre en un entorno nativo (móvil)
  return false; // Por ahora, asumimos que no
};

export function getApiUrl(): string {
  // En un futuro, podría diferenciar entre dev y prod
  return window.location.origin;
}

export function getWebSocketUrl(): string {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = window.location.host;
  return `${wsProtocol}//${wsHost}/ws`;
}