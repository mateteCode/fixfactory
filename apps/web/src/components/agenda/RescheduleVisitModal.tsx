import { useState, useEffect } from "react";
import { X, CalendarClock, Loader2 } from "lucide-react";
import {
    fromDateTimeLocalValue,
    toDateTimeLocalValue,
} from "../../hooks/useAgenda";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    currentScheduledAt?: string | null;
    onSubmit: (scheduledAt: string) => Promise<void>;
}

const RescheduleVisitModal = ({
    isOpen,
    onClose,
    title,
    currentScheduledAt,
    onSubmit,
    }: Props) => {
    const [scheduledAt, setScheduledAt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
        setScheduledAt(toDateTimeLocalValue(currentScheduledAt));
        }
    }, [isOpen, currentScheduledAt]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduledAt) return;

        setIsSubmitting(true);
        try {
        await onSubmit(fromDateTimeLocalValue(scheduledAt));
        onClose();
        } catch (error: any) {
        alert(
            error?.response?.data?.message || "No se pudo reprogramar la visita.",
        );
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
            <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
                <CalendarClock className="w-4 h-4 mr-2 text-gray-600" />
                {title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Nueva fecha y hora de visita
                </label>
                <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                />
            </div>

            <p className="text-[10px] text-gray-400">
                Podés reprogramar hasta 2 horas antes. Si la visita ya venció, podés
                cambiarla en cualquier momento.
            </p>

            <div className="flex space-x-3 pt-2">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded text-xs font-bold uppercase"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={isSubmitting || !scheduledAt}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase disabled:bg-gray-400"
                >
                {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                    "Reprogramar"
                )}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default RescheduleVisitModal;