"use client";

import type React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { WordRotate } from "./WordRotate";
import { handleFirebaseImageUpload } from "@/lib/Firebase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type cutsomFileType = {
  file: File;
  preview: string;
  progress: number;
  loading: boolean;
};
export default function ImageUpload() {
  const [open, setOpen] = useState(false);
  const [finalUploading, setFinalUploading] = useState(false);
  const router = useRouter()
  const [images, setImages] = useState<
    { file: File; preview: string; progress: number; loading: boolean }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        loading: true,
      }));

      setImages((prev) => [...prev, ...newFiles]);

      // Simulate upload progress for each new file
      newFiles.forEach((fileObj, index) => {
        simulateUpload(images.length + index);
      });
    }
  };

  const simulateUpload = (index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setImages((prev) =>
          prev.map((img, i) =>
            i === index ? { ...img, progress: 100, loading: false } : img
          )
        );
      } else {
        setImages((prev) =>
          prev.map((img, i) => (i === index ? { ...img, progress } : img))
        );
      }
    }, 50);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const handleImageUpload = async(images: Array<cutsomFileType>) => {
    try {
      setFinalUploading(true);
      const readyImages = images.map((imgs) => imgs.file)
      const uploading = await handleFirebaseImageUpload(readyImages[0]);
        if (uploading.success === true) {
          toast.success("Image Uploaded successfully");
          router.refresh()
        } else {
          toast.error("Internal server error");
        }
    } catch (error) {
      toast.error("Failed To Upload Images." + error);
    } finally {
      setFinalUploading(false);
      setOpen(false);
      setImages([])
    }
  };
  return (
    <>
      <button onClick={() => setOpen(true)}>
        <WordRotate
          className="text-xl font-bold text-primary font-mono dark:text-white cursor-pointer"
          words={["ISHANA", "PARWEEN", "💖💖💖"]}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload ishana images</DialogTitle>
            <DialogDescription>
              Upload your images here. Click the add button to upload more
              images.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                images.length === 0
                  ? "border-primary/20 hover:border-primary/50"
                  : "border-border"
              }`}
            >
              {images.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag and drop your images here or click to browse
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="relative w-full h-full rounded-md overflow-hidden border">
                        <Image
                          src={image.preview || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          fill
                          className="object-cover"
                        />
                        {image.loading && (
                          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                            <Progress
                              value={image.progress}
                              className="w-4/5 h-2"
                            />
                            <p className="text-xs mt-2">{image.progress}%</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div
                    className="border-2 border-dashed rounded-md flex items-center justify-center aspect-square cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={triggerFileInput}
                  >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                images.some((img) => img.loading) || images.length === 0
              }
              onClick={() => handleImageUpload(images)}
            >
              {images.some((img) => img.loading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  getting ready...
                </>
              ) : finalUploading ? (
                "uploading..."
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
