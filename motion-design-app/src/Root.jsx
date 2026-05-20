// Root.jsx

import { Composition } from "remotion";
import App from "./App";
import CodePresentation from "./presentation/CodePresentation";
import TutorialVideo from "./presentation/TutorialVideo";
import { StoryApp } from "./StoryApp";
import { AstronautApp } from "./AstronautApp";
import { HtmlCssJsStory, HTML_CSS_JS_STORY_DURATION } from "./HtmlCssJsStory";
import { JavaExplainer, JAVA_EXPLAINER_DURATION } from "./JavaExplainer";
import { RpgCodingStory, RPG_CODING_STORY_DURATION } from "./RpgCodingStory";
import { MiniRpgCodeurV2, MINI_RPG_V2_DURATION } from "./MiniRpgCodeurV2";
import { JavaRpgTutoriel, JAVA_RPG_DURATION } from "./JavaRpgTutoriel";
import { GeoEspaceTerminal, GEO_ESPACE_DURATION } from "./GeoEspaceTerminal";
import { JavaRpgTutoriel2, JAVA_RPG2_DURATION } from "./JavaRpgTutoriel2";
import GeoEspaceTerminal3, { GEO_ESPACE3_DURATION } from "./GeoEspaceTerminal3";
import PhysiqueTerminale, { PHYSIQUE_TERMINALE_DURATION } from "./PhysiqueTerminale";
import ListesChainees, { LISTES_CHAINEES_DURATION } from "./ListesChainees";

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

            <Composition
                id="HtmlCssJsStory"
                component={HtmlCssJsStory}

                // 6 scenes x 900 frames = 3 min 45 s
                durationInFrames={HTML_CSS_JS_STORY_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="JavaExplainer"
                component={JavaExplainer}

                // 10 scenes x 720 frames = 5 minutes exactement (30s par scene)
                durationInFrames={JAVA_EXPLAINER_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />
            <Composition
                id="RpgCodingStory"
                component={RpgCodingStory}

                // 12 scenes x 960 frames = 8 minutes exactes (40s par scène)
                durationInFrames={RPG_CODING_STORY_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="MiniRpgCodeurV2"
                component={MiniRpgCodeurV2}

                // 8 min: intro + 6 scenes code + demo + 3 améliorations + outro
                durationInFrames={MINI_RPG_V2_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="JavaRpgTutoriel"
                component={JavaRpgTutoriel}

                // 8 min: intro + 6 scènes Java + demo terminal + 3 améliorations POO + outro
                durationInFrames={JAVA_RPG_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="GeoEspaceTerminal"
                component={GeoEspaceTerminal}

                // 8 min: intro + 6 scènes géométrie 3D + demo pyramide + 3 améliorations + outro
                durationInFrames={GEO_ESPACE_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />
            <Composition
                id="JavaRpgTutoriel2"
                component={JavaRpgTutoriel2}

                // 8 min : intro + 6 scènes Java avancé + demo + 3 patterns + outro
                durationInFrames={JAVA_RPG2_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="GeoEspaceTerminal3"
                component={GeoEspaceTerminal3}

                // 15 min : symétrie, distance droite, plan 3pts, sections, tétraèdre, optimisation, barycentre, plan médiateur, lieux géo
                durationInFrames={GEO_ESPACE3_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />

            <Composition
                id="PhysiqueTerminale"
                component={PhysiqueTerminale}

                // ~15min 30s : Newton, Projectile, Énergie, Oscillateur, RC, Optique, Ondes, Young, Quantique, Relativité
                durationInFrames={PHYSIQUE_TERMINALE_DURATION}

                fps={24}
                width={1920}
                height={1080}
            />
            <Composition
                id="ListesChainees"
                component={ListesChainees}
                durationInFrames={LISTES_CHAINEES_DURATION}
                fps={24}
                width={1920}
                height={1080}
            />
        </>
    );
};
