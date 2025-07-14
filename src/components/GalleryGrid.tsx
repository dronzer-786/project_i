import { Play } from "lucide-react";
import { FileDataTypes } from "../../types/gallery";
import { formatFileDate } from "@/lib/utils";

interface GalleryGridProps {
  items: FileDataTypes[];
  onItemClick: (item: FileDataTypes) => void;
}

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  const sortedItems = items.sort(
    (a, b) =>
      new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sortedItems.map((item, index) => (
        <div
          key={index}
          className="cursor-pointer hover:opacity-80 transition-opacity relative"
          onClick={() => onItemClick(item)}
        >
          {item.name.includes(".png") ||
          item.name.includes(".jpg") ||
          item.name.includes(".jpeg") ||
          item.name.includes(".JPG") ? (
            <img
              src={item.url}
              alt={item.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="relative w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="p-2 rounded-full flex items-center justify-center bg-muted-foreground border border-black">
                <Play size={32} className="text-white" />
              </div>

              <video
                src={item.url}
                className="w-full h-full object-cover rounded-lg absolute inset-0 opacity-50"
              />
            </div>
          )}
          <span className="p-1 rounded-md absolute bg-muted-foreground text-white top-3 text-xs right-3">
            {" "}
            {formatSize(item.size)}
          </span>
          <div className="w-full mt-2 flex items-center justify-between">
            <p className=" font-sans text-sm font-medium truncate">
              {item.name.length > 12
                ? `${item.name.slice(0, 12)}...`
                : item.name}
            </p>

            <p className=" text-sm font-medium text-muted-foreground">
              {formatFileDate(item.timeCreated).relative}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatSize(bytes: number) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(0)} MB`;
}
