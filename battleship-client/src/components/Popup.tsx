interface PopupProps {
    text: string;
    highlight?: string;
    color?: string;
    requiresAck: boolean;
    onClose: () => void;
}

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "2rem 3rem",
    textAlign: "center",
    minWidth: "280px",
};

function Popup({ text, highlight, color, requiresAck, onClose }: PopupProps) {
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                {text && <p style={{ margin: "0 0 0.5rem" }}>{text}</p>}
                {highlight && (
                    <h3 style={{ color: color || "white", margin: "0.5rem 0" }}>{highlight}</h3>
                )}
                {requiresAck && (
                    <button onClick={onClose} style={{ marginTop: "1rem" }}>
                        OK
                    </button>
                )}
            </div>
        </div>
    );
}

export default Popup;
