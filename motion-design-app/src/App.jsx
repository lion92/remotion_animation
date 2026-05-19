// App.jsx

import { Sequence } from "remotion";

import Scene1 from "./scenes/Scene1";
import Scene2 from "./scenes/Scene2";
import Scene3 from "./scenes/Scene3";
import Scene4 from "./scenes/Scene4";

export default function App() {
    return (
        <>
            {/* scène 1 */}
            <Sequence from={0} durationInFrames={240} premountFor={1}>
                <Scene1 />
            </Sequence>
            {/* scène 2 */}
            <Sequence
                from={240}
                durationInFrames={240}
            >
                <Scene2 />
            </Sequence>
            {/* scène 3 */}
            <Sequence
                from={480}
                durationInFrames={240}
            >
                <Scene3 />
            </Sequence>
            {/* scène 4 */}
            <Sequence from={720} durationInFrames={240}>
                <Scene4 />
            </Sequence>
        </>
    );
}