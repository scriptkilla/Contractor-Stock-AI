
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Maximize, Zap, Camera, RefreshCw, X } from 'lucide-react';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [isFlashOn, setIsFlashOn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    scanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // Validation errors are normal during scanning
      }
    ).catch(err => {
      console.error("Scanner start error:", err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(e => console.error("Scanner stop error:", e));
      }
    };
  }, [onScan]);

  const toggleFlash = async () => {
    if (scannerRef.current) {
      try {
        const state = !isFlashOn;
        await scannerRef.current.applyVideoConstraints({
          // @ts-ignore - torch is not in standard types but supported by html5-qrcode/browsers
          advanced: [{ torch: state }]
        });
        setIsFlashOn(state);
      } catch (e) {
        console.warn("Torch not supported on this device/browser");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center text-white bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">Scan Barcode</h2>
        <div className="flex gap-2">
          <button onClick={toggleFlash} className={`p-2 rounded-full transition-colors ${isFlashOn ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            <Zap className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div id={containerId} className="flex-1 w-full bg-black relative">
        {/* Visual Overlay - Mirroring the Flutter CustomPaint UI */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="relative w-[250px] h-[250px]">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-sm" />
            
            {/* Animated scanning line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
