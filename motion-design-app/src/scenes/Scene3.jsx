// Scene3.jsx

import { useCurrentFrame } from "remotion";

import LittleGuy from "../LittleGuy";
import Bubble from "../Bubble";

export default function Scene3() {
    const frame = useCurrentFrame();

    const planeY =
        Math.min(frame * 1.5, 350);

    const characterX =
        Math.min(frame * 1.2, 420);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background:
                    "linear-gradient(to bottom, #87CEEB, #dff6ff)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* piste */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: 220,
                    background: "#444",
                }}
            />

            {/* lignes piste */}
            <div
                style={{
                    position: "absolute",
                    bottom: 100,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-around",
                }}
            >
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 60,
                            height: 10,
                            background: "white",
                        }}
                    />
                ))}
            </div>

            {/* tour de contrôle */}
            <div
                style={{
                    position: "absolute",
                    bottom: 220,
                    right: 100,
                    width: 100,
                    height: 220,
                    background: "#999",
                }}
            />

            {/* avion */}
            <div
                style={{
                    position: "absolute",
                    top: planeY,
                    right: 250,
                    fontSize: 160,
                    transform: "scaleX(-1)",
                }}
            >
                ✈️
            </div>

            {/* personnage */}
            <div
                style={{
                    position: "absolute",
                    bottom: 120,
                    left: characterX,
                }}
            >
                <>
                    <Bubble
                        text="Viens me prendre ✈️"
                    />

                    <LittleGuy lookingUp />
                </>
            </div>
        </div>
    );
}