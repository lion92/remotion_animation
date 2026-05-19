// LittleGuy.jsx

import { useCurrentFrame } from "remotion";

export default function LittleGuy({ lookingUp = false }) {
    const frame = useCurrentFrame();

    // cycle de marche
    const walkCycle = frame * 0.06;

    // bras
    const armAngle =
        Math.sin(walkCycle) * 18;

    // jambes
    const legAngle =
        Math.sin(walkCycle) * 18;

    // rotation tête
    const headRotation =
        lookingUp ? -20 : 0;

    return (
        <div
            style={{
                position: "relative",
                width: 200,
                height: 320,
            }}
        >
            {/* tête */}
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "#FFD166",
                    position: "absolute",
                    top: 0,
                    left: 60,

                    transform: `rotate(${headRotation}deg)`,
                    transformOrigin: "bottom center",
                }}
            >
                {/* œil gauche */}
                <div
                    style={{
                        position: "absolute",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "black",
                        top: lookingUp ? 20 : 30,
                        left: 25,
                    }}
                />

                {/* œil droit */}
                <div
                    style={{
                        position: "absolute",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "black",
                        top: lookingUp ? 20 : 30,
                        left: 50,
                    }}
                />
            </div>

            {/* corps */}
            <div
                style={{
                    width: 20,
                    height: 100,
                    background: "#222",
                    position: "absolute",
                    top: 80,
                    left: 90,
                }}
            />

            {/* bras gauche */}
            <div
                style={{
                    width: 70,
                    height: 10,
                    background: "#222",
                    position: "absolute",
                    top: 100,
                    left: 30,
                    transformOrigin: "right center",
                    transform: `rotate(${armAngle}deg)`,
                }}
            />

            {/* bras droit */}
            <div
                style={{
                    width: 70,
                    height: 10,
                    background: "#222",
                    position: "absolute",
                    top: 100,
                    left: 100,
                    transformOrigin: "left center",
                    transform: `rotate(${-armAngle}deg)`,
                }}
            />

            {/* jambe gauche + pied */}
            <div
                style={{
                    position: "absolute",
                    top: 180,
                    left: 70,
                    transformOrigin: "top center",
                    transform: `rotate(${legAngle}deg)`,
                }}
            >
                {/* jambe */}
                <div
                    style={{
                        width: 10,
                        height: 100,
                        background: "#222",
                    }}
                />

                {/* pied */}
                <div
                    style={{
                        width: 35,
                        height: 8,
                        background: "#222",
                        marginTop: -2,
                        marginLeft: -10,
                        borderRadius: 4,
                    }}
                />
            </div>

            {/* jambe droite + pied */}
            <div
                style={{
                    position: "absolute",
                    top: 180,
                    left: 110,
                    transformOrigin: "top center",
                    transform: `rotate(${-legAngle}deg)`,
                }}
            >
                {/* jambe */}
                <div
                    style={{
                        width: 10,
                        height: 100,
                        background: "#222",
                    }}
                />

                {/* pied */}
                <div
                    style={{
                        width: 35,
                        height: 8,
                        background: "#222",
                        marginTop: -2,
                        marginLeft: -10,
                        borderRadius: 4,
                    }}
                />
            </div>
        </div>
    );
}