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
  const posterInput = document.getElementById("posterUploadInput");
  const uploadBtn = document.getElementById("uploadVideoBtn");
  const videoElement = document.getElementById("heroVideo");
  const videoSource = document.getElementById("heroSource");

  const VIDEO_STORAGE_PATH = "hero_video/testvideo.mp4";
  const POSTER_STORAGE_PATH = "hero_video/poster.jpg";

  const modal = document.getElementById("uploadModal");

  function showModal() {
    modal.classList.remove("hidden");
  }

  function hideModal() {
    modal.classList.add("hidden");
  }

  uploadBtn.addEventListener("click", async () => {
    const videoFile = fileInput.files[0];
    const posterFile = posterInput.files[0];

    if (!videoFile || !posterFile) {
      alert("Please select a video file.");
      return;
    }

    showModal();

    try {
      const videoRef = ref(storage, VIDEO_STORAGE_PATH);
      await uploadBytes(videoRef, videoFile);
      const videoURL = await getDownloadURL(videoRef);

      let posterURL = "";
      if (posterFile) {
        console.log("Selected poster file:", posterFile);
        const posterRef = ref(storage, POSTER_STORAGE_PATH);
        await uploadBytes(posterRef, posterFile);
        posterURL = await getDownloadURL(posterRef);
      } else {
        console.warn("⚠️ No poster file selected.");
      }

      await setDoc(doc(db, "hero", "video"), {
        url: videoURL,
        poster: posterURL,
        updatedAt: Date.now(),
      });
      localStorage.removeItem("heroVideoURL");
      alert("🎥 Video uploaded!");
      loadHeroVideo();
    } catch (error) {
      console.error("Video upload error:", error);
      alert("❌ Failed to upload video.");
    } finally {
      hideModal();
    }
  });

  async function loadHeroVideo() {
    try {
      const videoDoc = await getDoc(doc(db, "hero", "video"));
      if (videoDoc.exists()) {
        const { url, poster } = videoDoc.data();

        const videoURL = `${url}?t=${Date.now()}`;
        const posterURL = `${poster}?t=${Date.now()}`;

        videoSource.src = videoURL;
        videoElement.removeAttribute("poster");
        videoElement.poster = posterURL;
        videoElement.load();

        localStorage.setItem("heroVideoURL", videoURL);
      } else {
        console.warn("Video document not found.");
      }
    } catch (error) {
      console.error("Failed to load video:", error);
    }
  }

  loadHeroVideo();
});
