"use client";

export function MetaPreview({
  title,
  description,
  logo,
}: {
  title: string;
  description: string;
  logo?: string;
}) {
  return (
    <div className="border rounded-xl p-4 flex items-center gap-4 bg-gray-50">
      {logo && (
        <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
      )}
      <div>
        <p className="font-semibold text-lg">{title || "Site title"}</p>
        <p className="text-sm text-gray-500 line-clamp-2">
          {description || "Short description will appear here"}
        </p>
      </div>
    </div>
  );
}
