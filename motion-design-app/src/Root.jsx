// Root.jsx

import { Composition } from "remotion";
import App from "./App";

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="Cartoon"
                component={App}
                durationInFrames={720}
                fps={28}
                width={1920}
                height={1080}
            />
        </>
    );
};