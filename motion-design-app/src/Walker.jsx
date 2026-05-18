import { useCurrentFrame } from "remotion";

export default function Walker({ children }) {
    const frame = useCurrentFrame();

    // vitesse plus naturelle
    const x = frame * 1.4;

    // rebond léger
    const bounce =
        Math.abs(Math.sin(frame * 0.06)) * -5;

    // légère rotation du corps
    const tilt =
        Math.sin(frame * 0.06) * 1.5;

    return (
        <div
            style={{
                position: "absolute",
                bottom: 120,
                transform: `
                    translateX(${x}px)
                    translateY(${bounce}px)
                    rotate(${tilt}deg)
                `,
                willChange: "transform",
            }}
        >
            {children}
        </div>
    );
}