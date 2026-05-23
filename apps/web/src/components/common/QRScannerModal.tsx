// src/components/common/QRScannerModal.tsx
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X, QrCode, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const QRScannerModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setScanError(""); // Limpiamos errores al abrir

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false,
    );

    const onScanSuccess = (decodedText: string) => {
      // 1. Validar que el texto sea exactamente un ID de MongoDB (24 caracteres hex)
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(decodedText);

      if (!isMongoId) {
        setScanError(
          "Código QR no reconocido. Asegurate de escanear la etiqueta de la máquina.",
        );
        return; // Cortamos la ejecución, la cámara sigue leyendo
      }

      // 2. Si es válido, limpiamos, cerramos y navegamos
      setScanError("");
      scanner
        .clear()
        .then(() => {
          onClose();
          navigate(`/maquinas/${decodedText}`);
        })
        .catch(console.error);
    };

    const onScanError = () => {
      // Ignoramos los errores continuos mientras la cámara busca un QR
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner
        .clear()
        .catch((error) => console.error("Error limpiando escáner", error));
    };
  }, [isOpen, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden relative shadow-2xl">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <QrCode className="w-4 h-4 mr-2 text-gray-600" />
            Escanear Activo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <p className="text-xs text-gray-500 mb-4 text-center">
            Enfocá el código QR de la máquina dentro del recuadro para acceder a
            su expediente.
          </p>

          {/* Bloque de Error Dinámico */}
          {scanError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center w-full animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {scanError}
            </div>
          )}

          <div
            id="qr-reader"
            className="w-full rounded overflow-hidden border border-gray-200 shadow-inner bg-black"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
