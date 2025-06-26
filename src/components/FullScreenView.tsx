"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileDataTypes } from "../../types/gallery";
import VideoPlayer from "./VideoPlayer";
import { Maximize2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletePhotoBtn from "./customComponents/DeletePhotoBtn";
import { useState } from "react";
import { toast } from "sonner";
import { formatFileDate } from "@/lib/utils";

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
  const [downloading, setDownloading] = useState(false);
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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch("/api/download-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: item.url }),
      });

      if (!response.ok) throw new Error("API request failed");

      const blob = await response.blob();

      // Download the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.name || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
      toast.success("Image is downloaded.");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            <div className="flex items-center justify-between">
              {item.name.length > 15
                ? `${item.name.slice(0, 15)}...`
                : item.name}
              <p className=" text-sm font-medium text-muted-foreground">
                {formatFileDate(item.timeCreated).full}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-video media-container">
          {item.name.includes(".png") ||
          item.name.includes(".jpg") ||
          item.name.includes(".jpeg") ||
          item.name.includes(".JPG") ? (
            <img
              src={item.url || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <VideoPlayer src={item.url} />
          )}
        </div>

        <div className="flex justify-center sm:justify-end gap-4 md:gap-2 ">
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            className="border"
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="size-4 md:mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 md:mr-2" />
            )}
            <span className="hidden md:block">Download</span>
          </Button>
          <Button onClick={handleFullScreen} variant="default" size="sm">
            <Maximize2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:block">Fullscreen</span>
          </Button>

          <DeletePhotoBtn />
        </div>
      </DialogContent>
    </Dialog>
  );
}
