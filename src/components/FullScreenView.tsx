"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileDataTypes } from "../../types/gallery";
import VideoPlayer from "./VideoPlayer";
import { Maximize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletePhotoBtn from "./customComponents/DeletePhotoBtn";

interface FullScreenViewProps {
  item: FileDataTypes;
  onClose: () => void;
  open: boolean;
}

export default function FullScreenView({
  item,
  onClose,
  open,
}: FullScreenViewProps) {
  const handleDownload = async () => {
    try {
      // Try fetch method first with appropriate options
      const response = await fetch(item.url, {
        credentials: "include", // Include credentials if needed
        headers: {
          Accept: "application/json, text/plain, */*",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.name;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Fetch download failed, trying direct download:", error);
      // Fallback to direct download
      const link = document.createElement("a");
      link.href = item.url;
      link.download = item.name;
      link.target = "_blank"; // Open in new tab if download fails
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    }
  };

  const handleFullScreen = () => {
    const element = document.querySelector(".media-container");
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        element.requestFullscreen();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {item.name.length > 20 ? `${item.name.slice(0, 20)}...` : item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-video media-container">
          {item.name.includes(".png") ||
          item.name.includes(".jpg") ||
          item.name.includes(".jpeg") || item.name.includes(".JPG") ? (
            <img
              src={item.url || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <VideoPlayer src={item.url} />
          )}
        </div>

        <div className="flex justify-center sm:justify-end gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="sm:flex hidden"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleFullScreen} variant="default" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>

          <DeletePhotoBtn />
        </div>
      </DialogContent>
    </Dialog>
  );
}
