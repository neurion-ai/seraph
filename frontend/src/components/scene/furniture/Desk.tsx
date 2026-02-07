export function Desk() {
  return (
    <div
      className="absolute"
      style={{ left: "50%", bottom: "32%", transform: "translateX(-50%)" }}
    >
      {/* Desk surface */}
      <div className="w-16 h-3 bg-amber-800 border border-amber-900 relative">
        {/* Desk detail */}
        <div className="absolute inset-x-1 top-0 h-[1px] bg-amber-700" />
      </div>
      {/* Desk legs */}
      <div className="flex justify-between">
        <div className="w-1 h-4 bg-amber-900" />
        <div className="w-1 h-4 bg-amber-900" />
      </div>
      {/* Items on desk */}
      <div className="absolute -top-2 left-2 w-3 h-2 bg-slate-300 border border-slate-400">
        {/* Paper */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-500" />
      </div>
      <div className="absolute -top-1 right-2 w-1 h-1 bg-yellow-600">
        {/* Pen */}
      </div>
    </div>
  );
}
