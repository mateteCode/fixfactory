import { useParams, useNavigate } from "react-router-dom";
import { useMachineDetail } from "../hooks/useMachineDetail";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  History,
  AlertTriangle,
  Layers,
  Activity,
  Wrench,
  DollarSign,
  PackageCheck,
  Tablet,
  Cpu,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Factory,
} from "lucide-react";
import { useState, useEffect } from "react";
import ReportIncidentModal from "../components/incidents/ReportIncidentModal";

const MachineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { machine, history, totalMaintenanceCost, isLoading, refetch } =
    useMachineDetail(id);

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (machine) {
      if (machine.imageUrl) {
        setActiveImage(machine.imageUrl);
      } else if (machine.images && machine.images.length > 0) {
        setActiveImage(machine.images[0]);
      }
    }
  }, [machine]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Cargando expediente del activo...
          </div>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-10 text-center text-sm font-semibold text-gray-500">
        Máquina no encontrada o sin permisos de acceso.
      </div>
    );
  }

  const priorityStyles: Record<string, string> = {
    Crítica: "bg-red-50 text-red-700 border-red-200",
    Alta: "bg-orange-50 text-orange-700 border-orange-200",
    Media: "bg-blue-50 text-blue-700 border-blue-200",
    Baja: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      Operativa: "bg-green-100 text-green-800 border-green-200",
      "En Falla": "bg-red-100 text-red-800 border-red-200",
      Mantenimiento: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Apagada: "bg-gray-100 text-gray-800 border-gray-200",
      "No Instalada": "bg-blue-100 text-blue-800 border-blue-200",
    };
    return config[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. CABECERA MAESTRA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="space-y-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver atrás
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gray-800 text-white rounded-lg hidden sm:block shadow-sm">
              <Tablet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {machine.internalTag} - {machine.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 border text-[10px] font-extrabold uppercase rounded-full ${getStatusBadge(machine.status)}`}
                >
                  {machine.status}
                </span>
              </div>

              {/* Metadatos de los 3 Modelos */}
              <p className="text-sm font-medium text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Cpu className="w-3.5 h-3.5" /> {machine.brand}
                <span className="text-gray-300">•</span>
                <Layers className="w-3.5 h-3.5" /> Modelo {machine.modelCode}
                <span className="text-gray-300 ml-2">•</span>
                {machine.isVerified ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    ✓ Catálogo Verificado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    ⚠ Catálogo Comunitario
                  </span>
                )}
                {machine.isPrivate && (
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    🔒 Diseño Interno
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-sm transition-colors"
          >
            <AlertTriangle size={14} /> Reportar Falla
          </button>
        </div>
      </div>

      {/* 2. GRID SUPERIOR: Multimedia, QR, Specs y Manuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Galería y Trazabilidad */}
        <div className="space-y-6 lg:col-span-1">
          {/* Visor de Imágenes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
              Registro Fotográfico
            </p>
            <div className="w-full aspect-video sm:aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center p-2">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={machine.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-center flex flex-col items-center gap-1">
                  <ImageIcon size={40} className="opacity-40" />
                  <span className="text-xs">Sin imagen</span>
                </div>
              )}
            </div>
            {/* Miniaturas de Galería */}
            {((machine.images && machine.images.length > 0) ||
              machine.imageUrl) && (
              <div className="grid grid-cols-4 gap-2">
                {machine.imageUrl && (
                  <button
                    onClick={() => setActiveImage(machine.imageUrl || "")}
                    className={`aspect-square border rounded overflow-hidden p-0.5 bg-gray-50 ${activeImage === machine.imageUrl ? "border-gray-800 ring-2 ring-gray-800/10" : "border-gray-200"}`}
                  >
                    <img
                      src={machine.imageUrl}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
                {machine.images &&
                  machine.images.map((imgUrl, index) => (
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

          {/* QR de Planta */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm text-center flex flex-col items-center gap-4">
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-500" /> Código de Planta
            </h3>
            <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <QRCodeSVG value={machine._id} size={140} />
            </div>
            {machine.createdAt && (
              <p className="text-[10px] text-gray-400">
                Registrada el {new Date(machine.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha: Datos Técnicos y Financieros */}
        <div className="space-y-6 lg:col-span-2">
          {/* Métricas de Planta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <Factory size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Línea Prod.
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {machine.productionLine || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Ubicación
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {machine.location || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Instalación
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {machine.installationDate
                    ? new Date(machine.installationDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Bloque Financiero: Compra vs Mantenimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Valor Adquisición
                </p>
                <p className="text-lg font-black text-emerald-900 font-mono mt-1">
                  {machine.purchasePrice
                    ? `USD ${machine.purchasePrice.toLocaleString("es-AR")}`
                    : "N/D"}
                </p>
              </div>
              <div className="p-2 bg-emerald-200/50 rounded-full text-emerald-700">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Costo Mantenimiento
                </p>
                <p className="text-lg font-black text-white font-mono mt-1">
                  USD{" "}
                  {totalMaintenanceCost.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="p-2 bg-white/10 rounded-full text-green-400">
                <Wrench size={20} />
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
              <div className="pb-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Especificaciones Técnicas
                </h4>
                {machine.technicalSpecs ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100">
                    {machine.technicalSpecs}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Sin especificaciones cargadas.
                  </p>
                )}
              </div>

              {machine.operationalNotes && (
                <div className="pt-4">
                  <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    ⚠️ Notas Operativas y de Seguridad
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-amber-50/30 border border-amber-100 p-3 rounded">
                    {machine.operationalNotes}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Manuales y Planos (PDF)
                </h4>
                {machine.manuals && machine.manuals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {machine.manuals.map((url, idx) => (
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
                            Documento Técnico {idx + 1}
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
        </div>
      </div>

      {/* 3. GRID INFERIOR: HISTORIALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Historial Incidentes */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-700 text-sm flex items-center uppercase tracking-wider border-b pb-2">
            <History className="w-4 h-4 mr-2 text-gray-500" /> Fallas Recientes
          </h3>
          {history.issues.length === 0 ? (
            <p className="text-gray-400 text-xs italic text-center py-2">
              Sin fallas reportadas.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1 space-y-3">
              {history.issues.map((issue) => (
                <div
                  key={issue._id}
                  className="pt-3 flex justify-between items-start text-xs"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <p className="font-medium text-gray-800">
                      {issue.description}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${priorityStyles[issue.priority]}`}
                    >
                      {issue.priority}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial Preventivo */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-700 text-sm flex items-center uppercase tracking-wider border-b pb-2">
            <Activity className="w-4 h-4 mr-2 text-gray-500" /> Preventivo
          </h3>
          {history.preventiveTasks.length === 0 ? (
            <p className="text-gray-400 text-xs italic text-center py-2">
              Sin tareas programadas.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {history.preventiveTasks.map((task) => (
                <div
                  key={task._id}
                  className="py-3 flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-800">{task.taskName}</p>
                    <p className="text-[10px] text-gray-400">
                      Cada {task.frequencyDays} días
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-gray-500">
                      Próx: {new Date(task.nextDate).toLocaleDateString()}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${task.status === "Programado" ? "bg-blue-100 text-blue-700" : task.status === "Vencido" ? "bg-red-100 text-red-700 animate-pulse" : "bg-green-100 text-green-700"}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repuestos Utilizados */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-700 text-sm flex items-center uppercase tracking-wider border-b pb-2">
            <PackageCheck className="w-4 h-4 mr-2 text-gray-500" /> Repuestos
            Históricos
          </h3>
          {history.spareParts.length === 0 ? (
            <p className="text-gray-400 text-xs italic text-center py-2">
              Sin recambios registrados.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1 space-y-2">
              {Object.values(
                history.spareParts.reduce(
                  (acc, sp: any) => {
                    const partId = sp.sparePart?._id || "unknown";

                    // Extraemos los datos cruzando al catálogo de forma segura
                    const catalog = sp.sparePart?.catalogRef;
                    const partName = catalog?.name || "Repuesto no indexado";
                    const partBrand = catalog?.brand || "S/M";
                    const partPN = catalog?.partNumber || "S/N";

                    const quantity = sp.quantity || 1;
                    const cost =
                      (sp.estimatedCost || sp.sparePart?.price || 0) * quantity;

                    if (!acc[partId]) {
                      acc[partId] = {
                        id: partId,
                        name: partName,
                        brand: partBrand,
                        partNumber: partPN,
                        totalQuantity: 0,
                        totalCost: 0,
                      };
                    }
                    acc[partId].totalQuantity += quantity;
                    acc[partId].totalCost += cost;
                    return acc;
                  },
                  {} as Record<
                    string,
                    {
                      id: string;
                      name: string;
                      brand: string;
                      partNumber: string;
                      totalQuantity: number;
                      totalCost: number;
                    }
                  >,
                ),
              ).map((groupedPart) => (
                <div
                  key={groupedPart.id}
                  className="pt-2 flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-800">
                      {groupedPart.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {groupedPart.brand} (PN: {groupedPart.partNumber}) • Cant:{" "}
                      {groupedPart.totalQuantity} unid.
                    </p>
                  </div>
                  <span className="font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded text-[11px]">
                    ${groupedPart.totalCost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        machineId={machine._id}
        machineName={machine.name}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default MachineDetailPage;
