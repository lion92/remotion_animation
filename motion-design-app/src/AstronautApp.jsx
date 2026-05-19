import { Sequence } from 'remotion';
import { AstroScene1Dream }    from './scenes/astronaut/Scene1Dream';
import { AstroScene2Science }  from './scenes/astronaut/Scene2Science';
import { AstroScene3Training } from './scenes/astronaut/Scene3Training';
import { AstroScene4Selection } from './scenes/astronaut/Scene4Selection';
import { AstroScene5Space }    from './scenes/astronaut/Scene5Space';
import { AstroScene6Return }   from './scenes/astronaut/Scene6Return';

// 6 scènes × 1200 frames @ 24 fps = 300 s = 5 minutes
const D = 1200;

export const AstronautApp = () => (
  <div style={{ width: 1920, height: 1080, overflow: 'hidden', background: '#000' }}>
    <Sequence from={0}      durationInFrames={D}><AstroScene1Dream    /></Sequence>
    <Sequence from={D}      durationInFrames={D}><AstroScene2Science  /></Sequence>
    <Sequence from={D * 2}  durationInFrames={D}><AstroScene3Training /></Sequence>
    <Sequence from={D * 3}  durationInFrames={D}><AstroScene4Selection /></Sequence>
    <Sequence from={D * 4}  durationInFrames={D}><AstroScene5Space    /></Sequence>
    <Sequence from={D * 5}  durationInFrames={D}><AstroScene6Return   /></Sequence>
  </div>
);
