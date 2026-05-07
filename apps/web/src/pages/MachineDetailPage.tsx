// src/pages/MachineDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useMachineDetail } from "../hooks/useMachineDetail";
import { QRCodeSVG } from "qrcode.react"; // Librería recomendada
import {
  ArrowLeft,
  Wrench,
  Calendar,
  MapPin,
  Tag,
  History,
} from "lucide-react";

const MachineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machine, isLoading } = useMachineDetail(id);

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse">
        Cargando detalles del activo...
      </div>
    );
  if (!machine)
    return <div className="p-10 text-center">Máquina no encontrada.</div>;

  return (
    <div className="space-y-6">
      {/* Header con retorno */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{machine.name}</h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            machine.status === "Operativa"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {machine.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Info Técnica */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center">
              <Tag className="w-4 h-4 mr-2" /> Datos del Activo
            </h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Código</p>
                <p className="font-semibold">{machine.code}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Tipo</p>
                <p className="font-semibold">{machine.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Ubicación</p>
                <p className="font-semibold">
                  {machine.location || "No definida"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Línea</p>
                <p className="font-semibold">
                  {(machine as any).productionLine}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center">
              <History className="w-4 h-4 mr-2" /> Historial Reciente
            </h3>
            <p className="text-gray-400 text-sm text-center py-10 italic">
              No hay intervenciones registradas para esta máquina.
            </p>
          </div>
        </div>

        {/* Columna Derecha: QR y Acciones */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-700 mb-4 text-sm">
              Código de Identificación
            </h3>
            <div className="p-4 border-2 border-gray-100 rounded-lg">
              <QRCodeSVG value={machine._id} size={150} />
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-mono">
              {machine._id}
            </p>
            <button className="mt-6 w-full py-2 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200 uppercase">
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetailPage;
