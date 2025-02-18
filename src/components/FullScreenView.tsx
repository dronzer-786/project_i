
import VideoPlayer from "./VideoPlayer";
import { FileDataTypes } from "../../types/gallery";

interface FullScreenViewProps {
  item: FileDataTypes;
  onClose: () => void;
}

export default function FullScreenView({ item, onClose }: FullScreenViewProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full p-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">{item.name}</h2>
            <button onClick={onClose} className="text-2xl">
              &times;
            </button>
          </div>
          <div className="relative aspect-video">
            {item.name.includes(".png") ||
            item.name.includes(".jpg") ||
            item.name.includes(".jpeg") ? (
              <img
                src={item.url || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <VideoPlayer src={item.url} />
            )}
          </div>
          <div className="p-4">
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
