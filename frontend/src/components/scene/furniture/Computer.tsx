export function Computer() {
  return (
    <div
      className="absolute"
      style={{ left: "15%", bottom: "32%", transform: "translateX(-50%)" }}
    >
      {/* Computer desk */}
      <div className="w-14 h-2 bg-amber-800 border border-amber-900 relative">
        <div className="absolute inset-x-1 top-0 h-[1px] bg-amber-700" />
      </div>
      {/* Desk legs */}
      <div className="flex justify-between">
        <div className="w-1 h-3 bg-amber-900" />
        <div className="w-1 h-3 bg-amber-900" />
      </div>
      {/* Monitor */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2">
        <div className="w-10 h-7 bg-gray-800 border-2 border-gray-600 relative">
          {/* Screen */}
          <div className="absolute inset-[2px] bg-green-900/80">
            {/* Screen glow */}
            <div className="absolute inset-0 bg-green-500/10" />
            {/* Text lines */}
            <div className="absolute top-1 left-1 w-4 h-[1px] bg-green-400/60" />
            <div className="absolute top-2 left-1 w-3 h-[1px] bg-green-400/40" />
            <div className="absolute top-3 left-1 w-5 h-[1px] bg-green-400/50" />
          </div>
        </div>
        {/* Monitor stand */}
        <div className="w-2 h-1 bg-gray-600 mx-auto" />
        <div className="w-4 h-[2px] bg-gray-600 mx-auto" />
      </div>
      {/* Keyboard */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-gray-700 border border-gray-600">
        <div className="absolute top-0 left-[1px] w-1 h-[1px] bg-gray-500" />
        <div className="absolute top-0 left-[4px] w-1 h-[1px] bg-gray-500" />
        <div className="absolute top-[2px] left-[2px] w-1 h-[1px] bg-gray-500" />
      </div>
    </div>
  );
}
