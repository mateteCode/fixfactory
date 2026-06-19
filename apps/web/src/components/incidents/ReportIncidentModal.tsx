import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import { useIncidents } from "../../hooks/useIncidents";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  machineName: string;
  onSuccess: () => void;
}

const ReportIncidentModal = ({
  isOpen,
  onClose,
  machineId,
  machineName,
  onSuccess,
}: Props) => {
  const { createIncident } = useIncidents();
  const [isLoading, setIsLoading] = useState(false);

  // Separamos la previsualización del archivo físico y añadimos estado de subida
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [formData, setFormData] = useState({
    description: "",
    priority: "Media",
    type: "Mecánico",
  });

  if (!isOpen) return null;

  // Creamos una URL local súper rápida para visualizar sin convertir a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Guardamos el archivo original para Cloudinary
      setImagePreview(URL.createObjectURL(file)); // Creamos una vista previa temporal
    }
  };

  // Subida a Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    const cloudUrl = import.meta.env.VITE_API_CLOUD_URL;
    const cloudName = import.meta.env.VITE_API_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_API_CLOUD_UPLOAD_PRESET;

    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const response = await fetch(`${cloudUrl}/${cloudName}/auto/upload`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) throw new Error("Error al subir la imagen");
    const result = await response.json();
    return result.secure_url;
  };

  const cleanAndClose = () => {
    setImagePreview(null);
    setSelectedFile(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = "";

      // 1. Si hay una foto seleccionada, la subimos a Cloudinary primero
      if (selectedFile) {
        setUploadStatus("Subiendo foto al servidor...");
        finalImageUrl = await uploadToCloudinary(selectedFile);
      }

      setUploadStatus("Registrando falla...");

      // 2. Enviamos los datos con la URL limpia al backend
      await createIncident({
        ...formData,
        machine: machineId,
        imageUrl: finalImageUrl || undefined,
      } as any);

      onSuccess();
      cleanAndClose();
    } catch (error) {
      console.log(error);
      alert("No se pudo registrar la incidencia.");
    } finally {
      setIsLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-red-700 font-bold flex items-center text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reportar Falla: {machineName}
          </h3>
          <button
            onClick={cleanAndClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Tipo de Falla
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-red-400"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="Mecánico">Mecánico</option>
              <option value="Eléctrico">Eléctrico</option>
              <option value="Software">Software</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Prioridad
            </label>
            <div className="flex space-x-2">
              {["Baja", "Media", "Alta", "Crítica"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-2 rounded text-[10px] font-bold uppercase border transition-all ${
                    formData.priority === p
                      ? "bg-gray-700 text-white border-gray-700"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Descripción del Problema
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describa brevemente qué sucede..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-red-400"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Sección para adjuntar imagen */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Evidencia Fotográfica (Opcional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-red-400 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 px-1">
                        <span>Sube un archivo</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hasta 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest transition-colors mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {uploadStatus || "Procesando..."}
              </>
            ) : (
              "ENVIAR REPORTE"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIncidentModal;
