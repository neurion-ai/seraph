export function Room() {
  return (
    <div className="absolute inset-0">
      {/* Wall */}
      <div
        className="absolute inset-x-0 top-0 h-[60%]"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
        }}
      />
      {/* Floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40%]"
        style={{
          background: "linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%)",
        }}
      />
      {/* Floor line */}
      <div className="absolute inset-x-0 top-[60%] h-[2px] bg-retro-border/30" />
      {/* Wall decoration - pixel dots */}
      <div className="absolute top-[15%] left-[10%] w-1 h-1 bg-retro-border/10" />
      <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-retro-border/10" />
      <div className="absolute top-[12%] left-[70%] w-1 h-1 bg-retro-border/10" />
      <div className="absolute top-[25%] left-[90%] w-1 h-1 bg-retro-border/10" />
    </div>
  );
}
