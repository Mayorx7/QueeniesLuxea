import { X, AlertTriangle, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

interface VendorConfirmDialogProps {
  /** "danger" = red destructive, "warning" = amber caution */
  variant?: "danger" | "warning";
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function VendorConfirmDialog({
  variant = "danger",
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: VendorConfirmDialogProps) {
  const isDanger = variant === "danger";

  return createPortal(
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      {/* Dialog */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-line bg-ivory p-6 shadow-xl animate-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "dialogIn 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-espresso-light hover:bg-cream hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isDanger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
          }`}
        >
          {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>

        {/* Content */}
        <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
        <p className="text-sm text-espresso-light leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-line bg-ivory py-2.5 text-sm font-medium text-espresso-light transition-colors hover:bg-cream hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
              isDanger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
