import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  getMetadata,
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

        console.log({ itemRef, metadata });

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

async function handleFirebaseImageUpload(file: File) {
  const storageRef = ref(storage, `ti/${file.name}`);
  await uploadBytes(storageRef, file);
  const res = await getDownloadURL(storageRef);
  return {
    success: true,
    file: {
      url: res,
    },
  };
}
export { storage, getFilesFromTi, handleFirebaseImageUpload };
