import { useCurrentFrame, useVideoConfig } from "remotion";

export default function Bubble() {
    const messages = [
        "Bonjour 👋",
        "Je marche !",
        "React est génial 😎",
        "Je suis un personnage animé 🎬",
        "Je peux parler aussi 💬",
    ];

    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // change de message toutes les 2 secondes
    const index = Math.floor(frame / (fps * 2)) % messages.length;
    const floatY = Math.sin(frame * 0.1) * 5;

    return (
        <div
            style={{
                position: "absolute",
                top: -120 + floatY,
                left: 120,
                background: "white",
                padding: "20px",
                borderRadius: "20px",
                maxWidth: "280px",
                fontSize: "24px",
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
        >
            {messages[index]}

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