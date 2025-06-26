import { storage, db } from "./firebase-config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("videoUploadInput");
  const uploadBtn = document.getElementById("uploadVideoBtn");
  const videoElement = document.getElementById("heroVideo");
  const videoSource = document.getElementById("heroSource");

  const VIDEO_STORAGE_PATH = "hero_video/testvideo.mp4";

  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert("Please select a video file.");
      return;
    }

    try {
      const videoRef = ref(storage, VIDEO_STORAGE_PATH);
      await uploadBytes(videoRef, file);

      const downloadURL = await getDownloadURL(videoRef);

      await setDoc(doc(db, "hero", "video"), {
        url: downloadURL,
        updatedAt: Date.now(),
      });

      alert("🎥 Video uploaded!");
      loadHeroVideo();
    } catch (error) {
      console.error("Video upload error:", error);
      alert("❌ Failed to upload video.");
    }
  });

  async function loadHeroVideo() {

    const cachedURL = localStorage.getItem("heroVideoURL");

  if (cachedURL) {
    videoSource.src = cachedURL;
    videoElement.load();
  }
  
    try {
      const videoDoc = await getDoc(doc(db, "hero", "video"));
      if (videoDoc.exists()) {
        const { url } = videoDoc.data();
        videoSource.src = `${url}?t=${Date.now()}`; // уникаємо кешування
        videoElement.load();
      } else {
        console.warn("Video document not found.");
      }
    } catch (error) {
      console.error("Failed to load video:", error);
    }
  }

  loadHeroVideo();
});
