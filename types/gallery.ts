export interface GalleryItem {
  id: string
  name: string
  type: "image" | "video"
  src: string
}

export type FileDataTypes = {
  name: string;
  url: string;
  fullPath: string;
}