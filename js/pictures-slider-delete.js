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
  if (e.target.classList.contains("pictures-slider-delete")) {
    const slide = e.target.closest(".swiper-slide");
    const img = slide.querySelector("img");
    const imgUrl = img.src;

    const fileName = decodeURIComponent(
      imgUrl.split("%2F").pop().split("?")[0]
    );

    if (!confirm(`Delete image ${fileName}?`)) return;

    try {
      const imageRef = ref(storage, `pictures_slider/${fileName}`);
      await deleteObject(imageRef);

      await deleteDoc(doc(db, "pictures_slider", fileName));

      alert("🗑️ Deleted successfully!");
      slide.remove();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("❌ Failed to delete. See console.");
    }
  }
});
