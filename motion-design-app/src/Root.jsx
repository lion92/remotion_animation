// Root.jsx

import { Composition } from "remotion";
import App from "./App";
import CodePresentation from "./presentation/CodePresentation";
import TutorialVideo from "./presentation/TutorialVideo";
import { StoryApp } from "./StoryApp";
import { AstronautApp } from "./AstronautApp";

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="Cartoon"
                component={App}

                // durée totale du film
                durationInFrames={960}

                // rendu cinéma
                fps={24}

                // Full HD
                width={1920}
                height={1080}
            />

            <Composition
                id="CodePresentation"
                component={CodePresentation}

                // 1920 frames = 80 secondes de présentation
                durationInFrames={1920}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="TutorialVideo"
                component={TutorialVideo}

                // 4660 frames = ~3 min 14s avec narration voix Paul
                durationInFrames={4660}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="DevStory"
                component={StoryApp}

                // 7200 frames = 5 minutes exactement (6 scènes × 1200 frames)
                durationInFrames={7200}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="AstronautStory"
                component={AstronautApp}

                // 7200 frames = 5 minutes (6 scènes × 1200 frames)
                durationInFrames={7200}

                fps={24}
                width={1920}
                height={1080}
            />
        </>
    );
};