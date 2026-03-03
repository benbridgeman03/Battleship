interface PopupProps {
    text: string;
    highlight?: string;
    color?: string;
    requiresAck: boolean;
    onClose: () => void;
}

function Popup({ text, highlight, color, requiresAck, onClose }: PopupProps) {
    return (
        <div className="popup-overlay">
            <div className="popup-modal">
                {text && <p className="popup-text">{text}</p>}
                {highlight && (
                    <div className="popup-highlight" style={{ color: color || "var(--text-bright)" }}>
                        {highlight}
                    </div>
                )}
                {requiresAck && (
                    <button onClick={onClose} style={{ marginTop: "1.25rem" }}>
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}

export default Popup;
