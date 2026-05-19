// Scene2.jsx

import Plane from "../Plane";
import LittleGuy from "../LittleGuy";
import Bubble from "../Bubble";

export default function Scene2() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background:
                    "linear-gradient(to bottom, #6ec6ff, #dff6ff)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* soleil */}
            <div
                style={{
                    position: "absolute",
                    top: 50,
                    right: 100,
                    fontSize: 100,
                }}
            >
                ☀️
            </div>

            {/* nuages */}
            <div
                style={{
                    position: "absolute",
                    top: 80,
                    left: 100,
                    fontSize: 120,
                }}
            >
                ☁️
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 180,
                    right: 250,
                    fontSize: 90,
                }}
            >
                ☁️
            </div>

            {/* avion */}
            <Plane />

            {/* sol */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: 180,
                    background: "#4CAF50",
                }}
            />

            {/* personnage */}
            <div
                style={{
                    position: "absolute",
                    bottom: 120,
                    left: 300,
                }}
            >
                <>
                    <Bubble
                        text="Ah ! Je vois un avion ✈️"
                    />

                    <LittleGuy lookingUp />
                </>
            </div>
        </div>
    );
}