// Scene4.jsx

import { useCurrentFrame } from "remotion";

import LittleGuy from "../LittleGuy";
import Bubble from "../Bubble";

export default function Scene4() {
    const frame = useCurrentFrame();

    const planeX = frame * 3 - 400;

    const planeY =
        Math.sin(frame * 0.03) * 15;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background:
                    "linear-gradient(to bottom, #4facfe, #dff6ff)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* soleil */}
            <div
                style={{
                    position: "absolute",
                    top: 60,
                    right: 80,
                    fontSize: 120,
                }}
            >
                ☀️
            </div>

            {/* nuages */}
            <div
                style={{
                    position: "absolute",
                    top: 120,
                    left: 150,
                    fontSize: 120,
                }}
            >
                ☁️
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 200,
                    right: 300,
                    fontSize: 100,
                }}
            >
                ☁️
            </div>

            {/* océan */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: 250,
                    background:
                        "linear-gradient(to top, #0077b6, #00b4d8)",
                }}
            />

            {/* île */}
            <div
                style={{
                    position: "absolute",
                    bottom: 180,
                    right: 200,
                    fontSize: 150,
                }}
            >
                🏝️
            </div>

            {/* avion */}
            <div
                style={{
                    position: "absolute",
                    top: 280 + planeY,
                    left: planeX,
                    fontSize: 160,
                }}
            >
                ✈️
            </div>

            {/* personnage */}
            <div
                style={{
                    position: "absolute",
                    top: 180 + planeY,
                    left: planeX + 180,
                }}
            >
                <>
                    <Bubble
                        text="Je veux aller sur une île paradisiaque 🏝️"
                    />

                    <LittleGuy lookingUp />
                </>
            </div>
        </div>
    );
}