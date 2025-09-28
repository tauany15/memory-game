import { memo, useMemo } from "react";

/** Compact font sizing so long names don't overflow. */
function sizeClassFor(label) {
  const len = label.length;
  if (len > 14) return "text-[10px]";
  if (len > 10) return "text-xs";
  return "text-sm sm:text-base md:text-lg";
}

function CardBase({ card, isFlipped, isWrong, onClick, disabled }) {
  const label = card.text || card.country || card.capital || "";
  const sizeClass = useMemo(() => sizeClassFor(label), [label]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || card.matched}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? label : "Hidden card"}
      className={[
        "aspect-[4/4] w-full rounded-lg select-none",
        "flex items-center justify-center p-2 sm:p-3",
        "transition-transform duration-500",
        isFlipped
          ? "bg-green-200 text-black shadow-lg rotate-3"
          : "bg-purple-400 text-white hover:scale-[1.02] hover:rotate-[1deg]",
        isWrong ? "shake ring-4 ring-red-400" : "",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ring-offset-2 ring-offset-white",
        disabled ? "opacity-90 pointer-events-none" : "",
      ].join(" ")}
    >
      {isFlipped ? (
        <span className={`${sizeClass} font-bold text-current text-center leading-tight break-words break-all hyphenate max-w-full`}>
          {label}
        </span>
      ) : (
        <span className="text-xl sm:text-2xl text-current">💭</span>
      )}
    </button>
  );
}

export default memo(CardBase);
