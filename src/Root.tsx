import { Composition } from "remotion";
import { Ad } from "./Ad";
import { AdImage } from "./AdImage";

const FPS = 30;
const DURATION = 45 * FPS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BytePOS-Landscape" component={Ad} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="BytePOS-Vertical" component={Ad} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="AdImage-Square-Dark" component={AdImage} defaultProps={{ theme: "dark" as const }} durationInFrames={90} fps={FPS} width={1080} height={1080} />
    <Composition id="AdImage-Square-Light" component={AdImage} defaultProps={{ theme: "light" as const }} durationInFrames={90} fps={FPS} width={1080} height={1080} />
    <Composition id="AdImage-Wide-Dark" component={AdImage} defaultProps={{ theme: "dark" as const }} durationInFrames={90} fps={FPS} width={1920} height={1080} />
    <Composition id="AdImage-Wide-Light" component={AdImage} defaultProps={{ theme: "light" as const }} durationInFrames={90} fps={FPS} width={1920} height={1080} />
    <Composition id="AdImage-Story-Dark" component={AdImage} defaultProps={{ theme: "dark" as const }} durationInFrames={90} fps={FPS} width={1080} height={1920} />
    <Composition id="AdImage-Story-Light" component={AdImage} defaultProps={{ theme: "light" as const }} durationInFrames={90} fps={FPS} width={1080} height={1920} />
    <Composition id="BytePOS-Landscape-UR" component={Ad} defaultProps={{ lang: "ur" as const }} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="BytePOS-Vertical-UR" component={Ad} defaultProps={{ lang: "ur" as const }} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="AdImage-Square-Dark-UR" component={AdImage} defaultProps={{ theme: "dark" as const, lang: "ur" as const }} durationInFrames={90} fps={FPS} width={1080} height={1080} />
    <Composition id="AdImage-Square-Light-UR" component={AdImage} defaultProps={{ theme: "light" as const, lang: "ur" as const }} durationInFrames={90} fps={FPS} width={1080} height={1080} />
    <Composition id="AdImage-Wide-Dark-UR" component={AdImage} defaultProps={{ theme: "dark" as const, lang: "ur" as const }} durationInFrames={90} fps={FPS} width={1920} height={1080} />
    <Composition id="AdImage-Wide-Light-UR" component={AdImage} defaultProps={{ theme: "light" as const, lang: "ur" as const }} durationInFrames={90} fps={FPS} width={1920} height={1080} />
    <Composition id="AdImage-Story-Dark-UR" component={AdImage} defaultProps={{ theme: "dark" as const, lang: "ur" as const }} durationInFrames={90} fps={FPS} width={1080} height={1920} />
    <Composition id="AdImage-Story-Light-UR" component={AdImage} defaultProps={{ theme: "light" as const, lang: "ur" as const }} durationInFrames={90} fps={FPS} width={1080} height={1920} />
  </>
);
