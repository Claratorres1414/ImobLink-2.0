function PostTags({ tags, onTagClick }) {
if (!Array.isArray(tags) || tags.length === 0) return null;

return (
    <div className="flex flex-wrap gap-2 mt-2">
    {tags.map((tag) => {
        const nome = tag.name || tag;

        return (
        <button
            key={tag.id || nome}
            type="button"
            onClick={() => onTagClick && onTagClick(nome)}
            className={`px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium ${
            onTagClick ? "hover:bg-blue-100 cursor-pointer" : "cursor-default"
            }`}
        >
            #{nome}
        </button>
        );
    })}
    </div>
);
}

export default PostTags;
