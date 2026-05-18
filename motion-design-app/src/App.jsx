import Walker from "./Walker";
import LittleGuy from "./LittleGuy";
import Bubble from "./Bubble.jsx";

function App() {
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                position: "relative",
                overflow: "hidden",
                background: "#87CEEB",
            }}
        >
            <Walker>
                <LittleGuy />
                <Bubble/>
            </Walker>
        </div>
    );
}

export default App;