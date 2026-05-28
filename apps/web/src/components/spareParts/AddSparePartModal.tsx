import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  DollarSign,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Tag,
  MapPin,
  Trash2,
  Zap,
  CloudCheck,
  Package,
  Wrench,
  Settings2,
  Boxes,
  AlertOctagon,
} from "lucide-react";
import api from "../../api/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSparePartModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const initialFormState = {
    brand: "",
    partNumber: "",
    name: "",
    internalCode: "",
    stockQuantity: 0,
    minStock: 1,
    price: 0,
    location: "",
    technicalSpecs: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const [patterns, setPatterns] = useState<any[]>([]);
  const [isPatternMatched, setIsPatternMatched] = useState(false);

  // Archivos NUEVOS
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [serviceManuals, setServiceManuals] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);

  // Archivos HEREDADOS
  const [inheritedImageUrl, setInheritedImageUrl] = useState("");
  const [inheritedManuals, setInheritedManuals] = useState<string[]>([]);
  const [inheritedImages, setInheritedImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      api
        .get("/spare-parts/catalog/patterns")
        .then((res) => setPatterns(res.data))
        .catch((err) =>
          console.error("Error cargando patrones de repuestos", err),
        );
    } else {
      setFormData(initialFormState);
      setCustomImage(null);
      setServiceManuals([]);
      setImages([]);
      setInheritedImageUrl("");
      setInheritedManuals([]);
      setInheritedImages([]);
      setIsPatternMatched(false);
      setUploadStatus("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePartNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPart = e.target.value;

    const matched = patterns.find(
      (p) =>
        p.brand.toLowerCase() === formData.brand.toLowerCase() &&
        p.partNumber.toLowerCase() === newPart.toLowerCase(),
    );

    if (matched) {
      setFormData((prev) => ({
        ...prev,
        partNumber: newPart,
        name: matched.name,
        technicalSpecs: matched.technicalSpecs || "",
      }));
      setInheritedImageUrl(matched.customImageUrl || "");
      setInheritedManuals(matched.manuals || []);
      setInheritedImages(matched.images || []);
      setIsPatternMatched(true);
    } else {
      setFormData((prev) => ({ ...prev, partNumber: newPart }));
      setInheritedImageUrl("");
      setInheritedManuals([]);
      setInheritedImages([]);
      setIsPatternMatched(false);
    }
  };

  const uniqueBrands = Array.from(new Set(patterns.map((p) => p.brand)));
  const availablePartNumbers = patterns
    .filter((p) => p.brand.toLowerCase() === formData.brand.toLowerCase())
    .map((p) => p.partNumber);

  // Acumuladores de archivos
  const handleManualsChange = (files: FileList | null) => {
    if (!files) return;
    setServiceManuals((prev) => [...prev, ...Array.from(files)]);
  };

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  // Remoción de archivos
  const removeManual = (idx: number) =>
    setServiceManuals((prev) => prev.filter((_, i) => i !== idx));
  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeInheritedManual = (url: string) =>
    setInheritedManuals((prev) => prev.filter((u) => u !== url));
  const removeInheritedImage = (url: string) =>
    setInheritedImages((prev) => prev.filter((u) => u !== url));

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

    if (!response.ok) throw new Error(`Error al subir el archivo ${file.name}`);
    const result = await response.json();
    return result.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let mainImageUrl = inheritedImageUrl;
      if (customImage) {
        setUploadStatus("Subiendo foto del repuesto...");
        mainImageUrl = await uploadToCloudinary(customImage);
      }

      const finalManuals = [...inheritedManuals];
      if (serviceManuals.length > 0) {
        setUploadStatus(`Subiendo datasheets (${serviceManuals.length})...`);
        for (const file of serviceManuals) {
          const url = await uploadToCloudinary(file);
          finalManuals.push(url);
        }
      }

      const finalImages = [...inheritedImages];
      if (images.length > 0) {
        setUploadStatus(`Subiendo galería técnica (${images.length})...`);
        for (const file of images) {
          const url = await uploadToCloudinary(file);
          finalImages.push(url);
        }
      }

      setUploadStatus("Guardando repuesto en el inventario...");
      const finalPayload = {
        ...formData,
        customImageUrl: mainImageUrl,
        manuals: finalManuals,
        images: finalImages,
      };

      console.log(finalPayload);

      await api.post("/spare-parts/catalog", finalPayload);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Error al procesar la solicitud.",
      );
    } finally {
      setIsLoading(false);
      setUploadStatus("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* CABECERA */}
        <div className="bg-[#F5F5F5] px-6 py-4 border-b flex justify-between items-center shrink-0">
          <h3 className="text-gray-700 font-bold flex items-center text-sm uppercase tracking-wider">
            <Package className="w-4 h-4 mr-2 text-gray-500" /> Ingresar Nuevo
            Repuesto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* COLUMNA IZQUIERDA: Formulario Unificado Compacto */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 relative overflow-hidden flex flex-col shadow-sm">
              <div className="flex justify-between items-end border-b border-gray-200 pb-3 mb-4 shrink-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center">
                  <Wrench className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  Datos del Componente e Inventario
                </p>
                {isPatternMatched && (
                  <span className="flex items-center text-[9px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full animate-fadeIn border border-green-200">
                    <Zap className="w-3 h-3 mr-1 fill-green-600" />
                    CATÁLOGO ENCONTRADO
                  </span>
                )}
              </div>

              <datalist id="sp-brands-list">
                {uniqueBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              <datalist id="sp-parts-list">
                {availablePartNumbers.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>

              <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 pb-2">
                {/* 1. Catálogo */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Marca *
                  </label>
                  <div className="relative">
                    <Settings2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      required
                      list="sp-brands-list"
                      type="text"
                      placeholder="Ej: SKF, Festo"
                      value={formData.brand}
                      className={`w-full pl-9 pr-3 py-2 border rounded text-sm bg-white outline-none transition-colors ${isPatternMatched ? "border-green-400 bg-green-50/30" : "focus:border-gray-500"}`}
                      onChange={(e) => {
                        setFormData({ ...formData, brand: e.target.value });
                        setIsPatternMatched(false);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Nº de Parte / Modelo *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      required
                      list="sp-parts-list"
                      type="text"
                      placeholder="Ej: 6204-2Z"
                      value={formData.partNumber}
                      className={`w-full pl-9 pr-3 py-2 border rounded text-sm bg-white outline-none transition-colors ${isPatternMatched ? "border-green-400 bg-green-50/30" : "focus:border-gray-500"}`}
                      onChange={handlePartNumberChange}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Nombre Descriptivo *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Rodamiento de bolas de ranura profunda"
                    value={formData.name}
                    className={`w-full px-3 py-2 border rounded text-sm bg-white outline-none transition-colors ${isPatternMatched ? "border-green-400 bg-green-50/30" : "focus:border-gray-500"}`}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2 border-t border-gray-100 my-1"></div>

                {/* 2. Inventario */}
                <div>
                  <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                    SKU Interno
                  </label>
                  <div className="relative">
                    <Boxes className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                    <input
                      type="text"
                      placeholder="Ej: REP-001"
                      className="w-full pl-9 pr-3 py-2 border border-blue-300 rounded text-sm bg-blue-50/30 outline-none focus:border-blue-500 font-mono font-bold uppercase"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          internalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Ubicación Pañol
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ej: Estante A3"
                      className="w-full pl-9 pr-3 py-2 border rounded text-sm bg-white outline-none focus:border-gray-500"
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Stock Inicial
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    className="w-full px-3 py-2 border rounded text-sm bg-white outline-none focus:border-gray-500"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center">
                    <AlertOctagon className="w-3 h-3 mr-1" /> Stock Mínimo
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.minStock}
                    className="w-full px-3 py-2 border rounded text-sm bg-white outline-none focus:border-amber-500"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStock: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Costo Unitario (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      className="w-full pl-9 pr-3 py-2 border rounded text-sm bg-white outline-none focus:border-gray-500"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="col-span-2 border-t border-gray-100 my-1"></div>

                {/* 3. Specs */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Especificaciones Técnicas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dimensiones, tolerancias, materiales..."
                    value={formData.technicalSpecs}
                    className="w-full px-3 py-2 border rounded text-sm bg-white resize-none outline-none focus:border-gray-500"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        technicalSpecs: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Gestor Multimedia Combinado */}
            <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-200 flex flex-col shadow-sm">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 pb-3 shrink-0">
                Archivos y Documentación
              </p>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {/* IMAGEN PRINCIPAL */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">
                    Fotografía del Repuesto
                  </label>
                  {customImage ? (
                    <div className="flex items-center justify-between p-2 border bg-white rounded-lg border-gray-200 shadow-sm animate-fadeIn">
                      <div className="flex items-center space-x-3">
                        <img
                          src={URL.createObjectURL(customImage)}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                          alt="preview"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-700 truncate max-w-[180px]">
                            {customImage.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatFileSize(customImage.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomImage(null)}
                        className="text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : inheritedImageUrl ? (
                    <div className="flex items-center justify-between p-2 border border-green-200 bg-green-50/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={inheritedImageUrl}
                          className="w-12 h-12 object-cover rounded border border-green-300"
                          alt="heredada"
                        />
                        <div>
                          <p className="text-xs font-bold text-green-800">
                            Imagen heredada
                          </p>
                          <p className="text-[10px] text-green-600/70 flex items-center">
                            <CloudCheck className="w-3 h-3 mr-0.5" /> Ya alojada
                            en la nube
                          </p>
                        </div>
                      </div>
                      <div className="relative group p-1.5 border border-gray-300 rounded bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 overflow-hidden cursor-pointer shadow-sm transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) =>
                            setCustomImage(
                              e.target.files ? e.target.files[0] : null,
                            )
                          }
                        />
                        Reemplazar
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-100 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) =>
                          setCustomImage(
                            e.target.files ? e.target.files[0] : null,
                          )
                        }
                      />
                      <UploadCloud className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-gray-600 block">
                        Subir Fotografía
                      </span>
                    </div>
                  )}
                </div>

                {/* MANUALES PDFs */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">
                    Datasheets y Planos (PDF)
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-100 cursor-pointer mb-2 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleManualsChange(e.target.files)}
                    />
                    <UploadCloud className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-600 block">
                      Añadir Datasheets / PDFs
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {inheritedManuals.map((url, i) => (
                      <div
                        key={`inh-${i}`}
                        className="flex items-center justify-between p-2 border bg-green-50/30 border-green-200 text-xs rounded"
                      >
                        <div className="flex items-center space-x-2 truncate font-medium text-green-800">
                          <CloudCheck className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="truncate max-w-[220px]">
                            Datasheet Heredado {i + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInheritedManual(url)}
                          className="text-green-700 hover:text-red-500 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {serviceManuals.map((file, i) => (
                      <div
                        key={`new-${i}`}
                        className="flex items-center justify-between p-2 border bg-white border-gray-200 text-xs rounded shadow-sm"
                      >
                        <div className="flex items-center space-x-2 truncate font-medium text-gray-700">
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="truncate max-w-[220px]">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeManual(i)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GALERÍA DE FOTOS */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">
                    Imágenes Adicionales
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-100 cursor-pointer mb-2 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleImagesChange(e.target.files)}
                    />
                    <UploadCloud className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-600 block">
                      Añadir capturas extra
                    </span>
                  </div>

                  {(inheritedImages.length > 0 || images.length > 0) && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 bg-white border border-gray-200 rounded max-h-[120px] overflow-y-auto shadow-inner">
                      {inheritedImages.map((url, i) => (
                        <div
                          key={`inh-img-${i}`}
                          className="relative group aspect-square rounded border border-green-300 overflow-hidden bg-green-50"
                        >
                          <img
                            src={url}
                            className="w-full h-full object-cover"
                            alt="heredada"
                          />
                          <span className="absolute top-0 left-0 bg-green-500/90 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-br">
                            Nube
                          </span>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button
                              type="button"
                              onClick={() => removeInheritedImage(url)}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {images.map((file, i) => (
                        <div
                          key={`new-img-${i}`}
                          className="relative group aspect-square rounded border border-gray-200 overflow-hidden bg-gray-50"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            alt="nueva"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES ACCION */}
          <div className="flex space-x-3 pt-4 border-t items-center bg-white mt-2">
            {isLoading ? (
              <div className="flex items-center text-xs font-bold text-blue-600 flex-1 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                <span>{uploadStatus}</span>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border text-gray-600 rounded text-xs font-bold uppercase hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gray-800 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:bg-gray-400 flex items-center shadow-sm"
            >
              {isLoading ? "Procesando..." : "Ingresar a Inventario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSparePartModal;
