import { Composition } from "remotion";
import { Ad } from "./Ad";

const FPS = 30;
const DURATION = 45 * FPS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BytePOS-Landscape" component={Ad} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="BytePOS-Vertical" component={Ad} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
