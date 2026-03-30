type UploadResult =
  | {
      success: true;
      file: { url: string; name: string; fullPath?: string };
      fileIndex: number;
    }
  | {
      success: false;
      error: string;
      fileName: string;
      fileIndex: number;
    };

async function getFilesFromTi() {
  const response = await fetch("/api/storage/ti", { method: "GET" });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || "Failed to fetch files");
  }

  return response.json();
}

function uploadSingleFileWithProgress(
  file: File,
  fileIndex: number,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const progress = (event.loaded / event.total) * 100;
      onProgress?.(fileIndex, progress);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as {
            success: true;
            file: { url: string; name: string; fullPath?: string };
          };
          resolve({
            success: true,
            file: payload.file,
            fileIndex,
          });
        } catch {
          reject(new Error("Invalid upload response"));
        }
      } else {
        let errorMessage = "Upload failed";
        try {
          const payload = JSON.parse(xhr.responseText) as { error?: string };
          if (payload.error) {
            errorMessage = payload.error;
          }
        } catch {
          // Ignore JSON parse errors here and keep default message.
        }
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.open("POST", "/api/storage/upload");
    xhr.send(formData);
  }).catch((error: unknown) => ({
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
    fileName: file.name,
    fileIndex,
  }));
}

async function handleFirebaseImageUpload(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void,
  onOverallProgress?: (overall: number) => void
) {
  if (files.length === 0) {
    return [];
  }

  const progressArray = new Array(files.length).fill(0);

  const updateOverallProgress = () => {
    const overall = progressArray.reduce((sum, p) => sum + p, 0) / files.length;
    onOverallProgress?.(overall);
  };

  const uploadPromises = files.map((file, index) =>
    uploadSingleFileWithProgress(file, index, (fileIndex, progress) => {
      onProgress?.(fileIndex, progress);
      progressArray[fileIndex] = progress;
      updateOverallProgress();
    }).then((result) => {
      if (result.success) {
        progressArray[index] = 100;
      } else {
        progressArray[index] = 0;
      }
      updateOverallProgress();
      return result;
    })
  );

  return Promise.all(uploadPromises);
}

export { getFilesFromTi, handleFirebaseImageUpload };
