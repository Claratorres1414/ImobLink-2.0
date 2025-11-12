<div className="relative w-full h-48 bg-gray-100 overflow-hidden">

  {/* SLIDE SUAVE */}
  <div className="relative w-full h-full">
    {urls.map((u, i) => (
      <img
        key={i}
        src={u}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out
          ${i === idx ? "opacity-100" : "opacity-0"}`}
      />
    ))}
  </div>

  {/* SETINHA ESQUERDA */}
  {urls.length > 1 && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setCarouselIndex((prev) => {
          const current = prev[id] ?? 0;
          const next = (current - 1 + urls.length) % urls.length;
          return { ...prev, [id]: next };
        });
      }}
      className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/40 text-white rounded-full px-2 py-1 text-sm"
    >
      ❮
    </button>
  )}

  {/* SETINHA DIREITA */}
  {urls.length > 1 && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setCarouselIndex((prev) => {
          const current = prev[id] ?? 0;
          const next = (current + 1) % urls.length;
          return { ...prev, [id]: next };
        });
      }}
      className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/40 text-white rounded-full px-2 py-1 text-sm"
    >
      ❯
    </button>
  )}

  {/* BOLINHAS */}
  {urls.length > 1 && (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
      {urls.map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full cursor-pointer transition
            ${i === idx ? "bg-white" : "bg-white/50"}`}
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex((prev) => ({ ...prev, [id]: i }));
          }}
        ></div>
      ))}
    </div>
  )}
</div>
