// Scene1.jsx

import Walker from "../Walker";
import LittleGuy from "../LittleGuy";
import Bubble from "../Bubble";

export default function Scene1() {
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
                    fontSize: 100,
                }}
            >
                ☁️
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 180,
                    right: 350,
                    fontSize: 80,
                }}
            >
                ☁️
            </div>

            {/* montagne */}
            <div
                style={{
                    position: "absolute",
                    bottom: 180,
                    left: 0,
                    width: "100%",
                    height: 250,
                    background:
                        "linear-gradient(to top, #5c7c46, #7ca65d)",
                    clipPath:
                        "polygon(0% 100%, 20% 40%, 40% 100%, 60% 30%, 80% 100%, 100% 50%, 100% 100%)",
                }}
            />

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

            <Walker>
                <>
                    <Bubble text="Je veux voyager ✈️" />

                    <LittleGuy />
                </>
            </Walker>
        </div>
    );
}