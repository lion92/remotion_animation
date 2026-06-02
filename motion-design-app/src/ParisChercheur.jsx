import { Sequence } from 'remotion';
import { ParisScene1Arrivee }    from './scenes/paris/Scene1Arrivee';
import { ParisScene2Decouverte } from './scenes/paris/Scene2Decouverte';
import { ParisScene3Sorbonne }   from './scenes/paris/Scene3Sorbonne';
import { ParisScene4Laboratoire } from './scenes/paris/Scene4Laboratoire';
import { ParisScene5Reve }       from './scenes/paris/Scene5Reve';
import { ParisScene6Decision }   from './scenes/paris/Scene6Decision';

// 6 scènes × 1200 frames @ 24 fps = 300 s = 5 minutes
const D = 1200;

export const PARIS_CHERCHEUR_DURATION = D * 6;

export const ParisChercheur = () => (
  <div style={{ width: 1920, height: 1080, overflow: 'hidden', background: '#000' }}>
    <Sequence from={0}     durationInFrames={D}><ParisScene1Arrivee    /></Sequence>
    <Sequence from={D}     durationInFrames={D}><ParisScene2Decouverte /></Sequence>
    <Sequence from={D * 2} durationInFrames={D}><ParisScene3Sorbonne   /></Sequence>
    <Sequence from={D * 3} durationInFrames={D}><ParisScene4Laboratoire /></Sequence>
    <Sequence from={D * 4} durationInFrames={D}><ParisScene5Reve       /></Sequence>
    <Sequence from={D * 5} durationInFrames={D}><ParisScene6Decision   /></Sequence>
  </div>
);
