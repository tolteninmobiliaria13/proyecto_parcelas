interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDanger = false,
    onConfirm,
    onCancel
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDanger ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
                    }`}>
                        <span className="material-symbols-outlined text-[24px]">
                            {isDanger ? "warning" : "help_outline"}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-on-surface">{title}</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">{message}</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/60">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer ${
                            isDanger
                                ? "bg-error text-on-error hover:bg-error/90"
                                : "bg-primary text-on-primary hover:bg-primary/90"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
