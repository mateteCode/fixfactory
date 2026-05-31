import React, { useState } from "react";
import { X, Loader2, UploadCloud, Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, images: string[]) => Promise<void>;
  title: string;
  placeholder: string;
  submitText: string;
}

const TaskActionModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder,
  submitText,
}: Props) => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  if (!isOpen) return null;

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_API_CLOUD_UPLOAD_PRESET);
    const response = await fetch(
      `${import.meta.env.VITE_API_CLOUD_URL}/${import.meta.env.VITE_API_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: data,
      },
    );
    if (!response.ok) throw new Error("Error upload");
    const result = await response.json();
    return result.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return alert("El texto es obligatorio.");

    setIsLoading(true);
    try {
      const uploadedUrls: string[] = [];
      if (images.length > 0) {
        setUploadStatus(`Subiendo ${images.length} fotos...`);
        for (const file of images) {
          uploadedUrls.push(await uploadToCloudinary(file));
        }
      }
      setUploadStatus("Guardando reporte...");
      await onSubmit(description, uploadedUrls);
      onClose();
      setDescription("");
      setImages([]);
    } catch (error) {
      alert("Error al guardar el reporte.");
    } finally {
      setIsLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <textarea
            required
            rows={4}
            placeholder={placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />

          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleImagesChange(e.target.files)}
            />
            <UploadCloud className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            <span className="text-xs font-bold text-gray-600">
              Adjuntar fotos (opcional)
            </span>
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto p-2 bg-gray-50 rounded">
              {images.map((file, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-12 h-12 object-cover rounded border border-gray-300"
                    alt="foto"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((p) => p.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase disabled:bg-gray-400 flex justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> {uploadStatus}
              </>
            ) : (
              submitText
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default TaskActionModal;
