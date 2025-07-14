import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "chatmedia786.firebaseapp.com",
  projectId: "chatmedia786",
  storageBucket: "chatmedia786.appspot.com",
  messagingSenderId: "982442102270",
  appId: "1:982442102270:web:10f10383c7138ae355c4af",
  measurementId: "G-N0Q8JFYFVE",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function getFilesFromTi() {
  try {
    const tiRef = ref(storage, "ti");
    const result = await listAll(tiRef);

    // Get download URLs and metadata for all items
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const [url, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef),
        ]);

        return {
          name: itemRef.name,
          url: url,
          fullPath: itemRef.fullPath,
          // Upload time and date info
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          // File size
          size: metadata.size,
          // Content type (mime type)
          contentType: metadata.contentType,
        };
      })
    );

    return files;
  } catch (error) {
    console.error("Error getting files from /ti:", error);
    throw error;
  }
}

async function handleFirebaseImageUpload(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void,
  onOverallProgress?: (overall: number) => void
) {
  const progressArray = new Array(files.length).fill(0);
  
  // Helper function to update overall progress
  const updateOverallProgress = () => {
    const overall = progressArray.reduce((sum, p) => sum + p, 0) / files.length;
    onOverallProgress?.(overall);
  };

  const uploadPromises = files.map((file, index) => {
    const storageRef = ref(storage, `ti/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          // Update individual progress
          onProgress?.(index, progress);
          
          // Update overall progress in real-time
          progressArray[index] = progress;
          updateOverallProgress();
        },
        (error) => {
          progressArray[index] = 0;
          updateOverallProgress();
          
          reject({
            success: false,
            error: error.message,
            fileName: file.name,
            fileIndex: index,
          });
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            
            progressArray[index] = 100;
            updateOverallProgress();
            
            resolve({
              success: true,
              file: {
                url,
                name: file.name,
              },
              fileIndex: index,
            });
          } catch (error) {
            progressArray[index] = 0;
            updateOverallProgress();
            
            reject({
              success: false,
              error: error,
              fileName: file.name,
              fileIndex: index,
            });
          }
        }
      );
    });
  });

  return Promise.allSettled(uploadPromises).then(results => 
    results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason.error || result.reason.message || 'Unknown error',
          fileName: files[index].name,
          fileIndex: index,
        };
      }
    })
  );
}

export { storage, getFilesFromTi, handleFirebaseImageUpload };
