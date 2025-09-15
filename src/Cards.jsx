export default function Cards({ card, isFlipped, onClick, isWrong }) {
  return (
<div
  onClick={onClick}
  className={`w-24 h-32 flex items-center justify-center rounded-lg cursor-pointer transition-transform duration-500 transform
    ${isFlipped ? "bg-green-200 shadow-lg rotate-3" : "bg-purple-400"} 
    ${isWrong ? "bg-red-400" : ""}
  `}
>
  {isFlipped ? (
    <span className="text-lg font-bold text-black">{card.text}</span>
  ) : (
    <span className="text-2xl">💭</span>
  )}
</div>


  );
}


