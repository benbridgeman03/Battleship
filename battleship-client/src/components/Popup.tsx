interface PopupType {
    type: "timeout" | "dismiss" | "confirm";
}

interface PopupProps {
    text: string;
    highlight?: string;
    color?: string;
    requiresAck: PopupType;
    onClose: () => void;
    onConfirm?: () => void;
}

function Popup({ text, highlight, color, requiresAck, onClose, onConfirm }: PopupProps) {
    return (
        <div className="popup-overlay">
            <div className="popup-modal">
                {text && <p className="popup-text">{text}</p>}
                {highlight && (
                    <div className="popup-highlight" style={{ color: color || "var(--text-bright)" }}>
                        {highlight}
                    </div>
                )}
                {requiresAck.type === "dismiss" && (
                    <button onClick={onClose} style={{ marginTop: "1.25rem" }}>
                        Dismiss
                    </button>
                )}
                {requiresAck.type === "confirm" && (
                    <div
                        style={{
                            marginTop: "1.25rem",
                            display: "flex",
                            gap: "0.75rem",
                            justifyContent: "center",
                        }}>
                        <button onClick={onClose}>
                            Cancel
                        </button>

                        <button className="btn-primary" onClick={() => { onConfirm?.(); onClose(); }}>
                            Confirm
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Popup;
export type { PopupType };
