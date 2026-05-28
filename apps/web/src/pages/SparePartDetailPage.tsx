// src/pages/SparePartDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSparePartDetail } from "../hooks/useSparePartDetail";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Package,
  MapPin,
  Tag,
  AlertTriangle,
  Layers,
  Wrench,
  DollarSign,
  Settings2,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Boxes,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";

const SparePartDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { part, isLoading } = useSparePartDetail(id);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (part) {
      if (part.customImageUrl) {
        setActiveImage(part.customImageUrl);
      } else if (part.images && part.images.length > 0) {
        setActiveImage(part.images[0]);
      }
    }
  }, [part]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Cargando ficha del repuesto...
          </div>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="p-10 text-center text-sm font-semibold text-gray-500">
        Repuesto no encontrado o sin permisos de acceso.
      </div>
    );
  }

  // Lógica de colores y estados súper segura (por si vienen datos nulos de DB viejas)
  const safeStock = part.stockQuantity || 0;
  const safeMinStock = part.minStock || 1;
  const safePrice = part.price || 0;

  const isOutOfStock = safeStock === 0;
  const isLowStock = !isOutOfStock && safeStock <= safeMinStock;
  const stockBadgeConfig = isOutOfStock
    ? "bg-red-100 text-red-800 border-red-200"
    : isLowStock
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-green-100 text-green-800 border-green-200";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fadeIn">
      {/* 1. CABECERA MAESTRA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="space-y-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Inventario
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gray-800 text-white rounded-lg hidden sm:block shadow-sm">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {part.internalCode} - {part.name || "Repuesto Sin Nombre"}
                </h1>
                <span
                  className={`px-2.5 py-0.5 border text-[10px] font-extrabold uppercase rounded-full flex items-center ${stockBadgeConfig}`}
                >
                  {isOutOfStock ? (
                    <AlertOctagon className="w-3 h-3 mr-1" />
                  ) : isLowStock ? (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {isOutOfStock
                    ? "AGOTADO"
                    : isLowStock
                      ? "STOCK CRÍTICO"
                      : "STOCK SALUDABLE"}
                </span>
              </div>

              <p className="text-sm font-medium text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Settings2 className="w-3.5 h-3.5" /> {part.brand || "S/M"}
                <span className="text-gray-300">•</span>
                <Tag className="w-3.5 h-3.5" /> PN: {part.partNumber || "S/N"}
                <span className="text-gray-300 ml-2">•</span>
                {part.isVerified ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ✓ Catálogo Global
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ⚠ Catálogo Comunitario
                  </span>
                )}
                {part.isPrivate && (
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 ml-1">
                    🔒 Diseño Interno
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: Galería y QR */}
        <div className="space-y-6 lg:col-span-1">
          {/* Visor de Imágenes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
              Registro Visual
            </p>
            <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center p-2 relative">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={part.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-center flex flex-col items-center gap-1">
                  <ImageIcon size={40} className="opacity-40" />
                  <span className="text-xs">Sin imagen en catálogo</span>
                </div>
              )}
            </div>

            {/* Carrusel de Miniaturas */}
            {((part.images && part.images.length > 0) ||
              part.customImageUrl) && (
              <div className="grid grid-cols-4 gap-2">
                {part.customImageUrl && (
                  <button
                    onClick={() => setActiveImage(part.customImageUrl || "")}
                    className={`aspect-square border rounded overflow-hidden p-0.5 bg-gray-50 ${activeImage === part.customImageUrl ? "border-gray-800 ring-2 ring-gray-800/10" : "border-gray-200"}`}
                  >
                    <img
                      src={part.customImageUrl}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
                {part.images &&
                  part.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`aspect-square border rounded overflow-hidden p-0.5 bg-gray-50 ${activeImage === imgUrl ? "border-gray-800 ring-2 ring-gray-800/10" : "border-gray-200"}`}
                    >
                      <img
                        src={imgUrl}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* QR de Pañol */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm text-center flex flex-col items-center gap-4">
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-gray-500" /> Etiqueta de Pañol
            </h3>
            <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <QRCodeSVG value={part._id} size={140} />
            </div>
            <div className="w-full bg-gray-50 border rounded py-2 px-3 font-mono text-sm font-bold text-gray-800 uppercase tracking-wide">
              {part.internalCode || "SIN SKU INTERNO"}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Inventario, Docs y Compatibilidad */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bloque Financiero y de Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Panel de Stock */}
            <div
              className={`p-4 rounded-lg border shadow-sm flex items-center justify-between ${isOutOfStock ? "bg-red-50 border-red-200" : isLowStock ? "bg-amber-50 border-amber-200" : "bg-gray-900 border-gray-800 text-white"}`}
            >
              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-700" : "text-gray-400"}`}
                >
                  Cantidad en Pañol
                </p>
                <p
                  className={`text-3xl font-black font-mono mt-1 flex items-baseline gap-2 ${isOutOfStock ? "text-red-700" : isLowStock ? "text-amber-800" : "text-white"}`}
                >
                  {safeStock}{" "}
                  <span className="text-sm font-medium opacity-70">
                    unidades
                  </span>
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${isOutOfStock ? "bg-red-200/50 text-red-600" : isLowStock ? "bg-amber-200/50 text-amber-700" : "bg-white/10 text-white"}`}
              >
                <Boxes size={24} />
              </div>
            </div>

            {/* Panel Financiero */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Costo Unitario (USD)
                </p>
                <p className="text-2xl font-black text-gray-800 font-mono mt-1 flex items-baseline gap-2">
                  ${safePrice.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Capital inmovilizado: ${(safePrice * safeStock).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* Tarjetas de Datos Secundarios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Ubicación Física
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {part.location || "Estante no asignado"}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded">
                <AlertOctagon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Stock Mínimo Alerta
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {safeMinStock} unidades
                </p>
              </div>
            </div>
          </div>

          {/* Especificaciones y Manuales */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-gray-500" /> Ingeniería y
                Documentación
              </h3>
            </div>
            <div className="p-5 space-y-5 split-y divide-y divide-gray-100">
              <div className="pb-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Especificaciones de Fábrica
                </h4>
                {part.technicalSpecs ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100">
                    {part.technicalSpecs}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No hay especificaciones técnicas cargadas para este
                    componente.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Datasheets y Planos (PDF)
                </h4>
                {part.manuals && part.manuals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {part.manuals.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 border rounded bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 group transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText
                            size={14}
                            className="text-red-500 shrink-0"
                          />
                          <span className="text-xs font-bold truncate">
                            Datasheet Técnico {idx + 1}
                          </span>
                        </div>
                        <ExternalLink
                          size={12}
                          className="text-gray-400 shrink-0"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No hay documentos técnicos adjuntos.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* LISTA DE MÁQUINAS COMPATIBLES */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-500" /> Máquinas
                Compatibles
              </h3>
            </div>
            <div className="p-5">
              {part.compatibleMachines && part.compatibleMachines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {part.compatibleMachines.map((machine, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/maquinas/${machine._id}`)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-800 group-hover:text-blue-700">
                          {machine.internalTag || "Máquina"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {machine.brand} {machine.modelCode}
                        </p>
                      </div>
                      <ExternalLink
                        size={14}
                        className="text-gray-300 group-hover:text-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500">
                    Este repuesto aún no ha sido vinculado a ninguna máquina
                    específica de la planta.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Es un repuesto universal o de uso general.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartDetailPage;
