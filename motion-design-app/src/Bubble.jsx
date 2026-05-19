export default function Bubble({ text }) {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 180,
                background: "white",
                padding: "20px",
                borderRadius: "20px",
                maxWidth: "320px",
                fontSize: "24px",
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                zIndex: 1000,
            }}
        >
            {text}

            {/* flèche */}
            <div
                style={{
                    position: "absolute",
                    bottom: "-20px",
                    left: "40px",
                    width: 0,
                    height: 0,
                    borderLeft: "20px solid transparent",
                    borderRight: "20px solid transparent",
                    borderTop: "20px solid white",
                }}
            />
        </div>
    );
}