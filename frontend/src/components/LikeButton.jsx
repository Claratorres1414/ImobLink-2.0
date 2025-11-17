export default function LikeButton({ liked, likes, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition
        ${liked
          ? "bg-blue-600 border-blue-700 text-white"
          : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
        }
      `}
    >
      <span className="text-xl">👍</span>
      <span className="font-semibold">{likes}</span>
    </button>
  );
}
