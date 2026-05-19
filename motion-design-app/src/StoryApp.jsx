import { Sequence } from 'remotion';
import { Scene1Dream } from './scenes/story/Scene1Dream';
import { Scene2Awakening } from './scenes/story/Scene2Awakening';
import { Scene3HelloWorld } from './scenes/story/Scene3HelloWorld';
import { Scene4Bugs } from './scenes/story/Scene4Bugs';
import { Scene5NightCode } from './scenes/story/Scene5NightCode';
import { Scene6Triumph } from './scenes/story/Scene6Triumph';

// 6 scenes × 1200 frames @ 24 fps = 300 s = 5 minutes exactly
const SCENE_DURATION = 1200;

export const StoryApp = () => (
  <div style={{ width: 1920, height: 1080, overflow: 'hidden', background: '#000' }}>
    <Sequence from={0} durationInFrames={SCENE_DURATION}>
      <Scene1Dream />
    </Sequence>

    <Sequence from={SCENE_DURATION} durationInFrames={SCENE_DURATION}>
      <Scene2Awakening />
    </Sequence>

    <Sequence from={SCENE_DURATION * 2} durationInFrames={SCENE_DURATION}>
      <Scene3HelloWorld />
    </Sequence>

    <Sequence from={SCENE_DURATION * 3} durationInFrames={SCENE_DURATION}>
      <Scene4Bugs />
    </Sequence>

    <Sequence from={SCENE_DURATION * 4} durationInFrames={SCENE_DURATION}>
      <Scene5NightCode />
    </Sequence>

    <Sequence from={SCENE_DURATION * 5} durationInFrames={SCENE_DURATION}>
      <Scene6Triumph />
    </Sequence>
  </div>
);
