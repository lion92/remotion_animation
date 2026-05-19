// Plane.jsx

import { useCurrentFrame } from "remotion";

export default function Plane() {
    const frame = useCurrentFrame();

    // déplacement horizontal
    const x = frame * 6 - 400;

    // mouvement vertical léger
    const y =
        Math.sin(frame * 0.04) * 15;

    return (
        <div
            style={{
                position: "absolute",
                top: 150 + y,
                left: x,
                fontSize: 120,
            }}
        >
            ✈️
        </div>
    );
}