import { storage, db } from "./firebase-config.js";
import {
  ref,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import {
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("slider__delete")) {
    const slide = e.target.closest(".swiper-slide");
    const img = slide.querySelector("img");
    const imageUrl = img.src;

    const fileName = decodeURIComponent(
      imageUrl.split("%2F").pop().split("?")[0]
    );

    if (!confirm(`Delete image "${fileName}"?`)) return;

    try {
      const imageRef = ref(storage, `slider_photos/${fileName}`);
      await deleteObject(imageRef);

      await deleteDoc(doc(db, "slider_photos", fileName));

      alert("🗑️ Deleted successfully!");
      slide.remove();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("❌ Failed to delete. See console.");
    }
  }
});
