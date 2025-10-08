import { Button } from "@/components/ui/button";

interface QRScannerPlaceholderProps {
  onScanSuccess: (scannedId: string) => void;
}

export default function QRScannerPlaceholder({ onScanSuccess }: QRScannerPlaceholderProps) {
  const FAKE_DEVICE_ID = `KP-C01-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="w-full p-4 border-dashed border-2 rounded-lg flex flex-col items-center justify-center bg-gray-50 text-center">
      <p className="text-gray-500 mb-4">Simulación de cámara para escanear QR</p>
      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
        <div className="w-full h-0.5 bg-red-500 absolute animate-scan-line"></div>
        <span className="material-icons text-6xl text-gray-400">qr_code_scanner</span>
      </div>
      <Button className="mt-4" onClick={() => onScanSuccess(FAKE_DEVICE_ID)}>
        Simular Escaneo Exitoso
      </Button>
      <p className="text-xs text-gray-400 mt-2">Se usará el ID: {FAKE_DEVICE_ID}</p>
    </div>
  );
}

// You would need to add this animation to your global CSS file (e.g., index.css)
/*
@keyframes scan-line {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

.animate-scan-line {
  animation: scan-line 2s linear infinite;
}
*/
