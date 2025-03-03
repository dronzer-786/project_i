import React, { useEffect, useState } from "react";
import { FileDataTypes } from "../../types/gallery";
import GalleryGrid from "./GalleryGrid";
import FullScreenView from "./FullScreenView";
import { getFilesFromTi } from "@/lib/Firebase";

import { Mogra } from "next/font/google";

import ImageUpload from "./customComponents/ImageUpload";
import { SparklesText } from "./customComponents/SparkleText";
type GalleryPageProps = {
  isLocked: boolean;
};
export const mogra = Mogra({ subsets: ["latin"], weight: ["400"] });

function GalleryPage({ isLocked }: GalleryPageProps) {
  const [selectedItem, setSelectedItem] = useState<FileDataTypes | null>(null);
  const [files, setFiles] = useState<FileDataTypes[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const filesData = await getFilesFromTi();

        setFiles(filesData);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (isLocked) return <div>Gallery is locked</div>;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="aspect-video rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gray-200 animate-pulse">
                <div className="h-full w-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.5 12c0-1.232-.046-2.453-.134-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.332 0 4.006 4.006 0 00-3.7 3.7c-.088 1.209-.134 2.43-.134 3.662C4.5 13.232 4.546 14.453 4.634 15.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.332 0 4.006 4.006 0 003.7-3.7c.088-1.209.134-2.43.134-3.662zM10.5 8.25a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0v-1.5zM7.5 15a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V15zm9 0a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V15z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 py-8 z-50">
        <div className="flex items-center justify-between mb-8">
        <SparklesText text="Project - i" className=" text-3xl sm:text-4xl" sparklesCount={8}/>
        <ImageUpload/>
        </div>
        <GalleryGrid items={files} onItemClick={setSelectedItem} />
        {selectedItem && (
          <FullScreenView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            open={!!selectedItem}
          />
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
