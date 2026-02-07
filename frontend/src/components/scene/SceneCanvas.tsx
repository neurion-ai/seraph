import { Room } from "./Room";
import { Avatar } from "./Avatar";
import { SpeechBubble } from "./SpeechBubble";
import { Computer } from "./furniture/Computer";
import { Desk } from "./furniture/Desk";
import { FilingCabinet } from "./furniture/FilingCabinet";

export function SceneCanvas() {
  return (
    <div className="relative h-[45vh] min-h-[200px] overflow-hidden pixel-border">
      <Room />
      <Computer />
      <Desk />
      <FilingCabinet />
      <Avatar />
      <SpeechBubble />

      {/* Scene label */}
      <div className="absolute top-2 right-3 text-[7px] text-retro-border/40 uppercase tracking-widest">
        Seraph&apos;s Study
      </div>
    </div>
  );
}
