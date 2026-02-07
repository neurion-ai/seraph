export function FilingCabinet() {
  return (
    <div
      className="absolute"
      style={{ left: "85%", bottom: "32%", transform: "translateX(-50%)" }}
    >
      {/* Cabinet body */}
      <div className="w-10 h-14 bg-gray-600 border border-gray-500 relative">
        {/* Top drawer */}
        <div className="absolute top-1 inset-x-1 h-3 bg-gray-500 border border-gray-400">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-[2px] bg-gray-300" />
        </div>
        {/* Middle drawer */}
        <div className="absolute top-5 inset-x-1 h-3 bg-gray-500 border border-gray-400">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-[2px] bg-gray-300" />
        </div>
        {/* Bottom drawer */}
        <div className="absolute top-9 inset-x-1 h-3 bg-gray-500 border border-gray-400">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-[2px] bg-gray-300" />
        </div>
      </div>
      {/* Cabinet feet */}
      <div className="flex justify-between">
        <div className="w-1 h-1 bg-gray-700" />
        <div className="w-1 h-1 bg-gray-700" />
      </div>
    </div>
  );
}
