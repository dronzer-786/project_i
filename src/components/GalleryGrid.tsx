

import { FileDataTypes } from "../../types/gallery"

interface GalleryGridProps {
  items: FileDataTypes[]
  onItemClick: (item: FileDataTypes) => void
}

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onItemClick(item)}
        >
          {item.name.includes(".png") || item.name.includes(".jpg") || item.name.includes(".jpeg") ? (
            <img
              src={item.url}
              alt={item.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="relative w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">▶️</span>
            
              <video src={item.url} className="w-full h-full object-cover rounded-lg absolute inset-0 opacity-50" />
            </div>
          )}
          <p className="mt-2 text-sm font-medium">{item.name}</p>
        </div>
      ))}
    </div>
  )
}

