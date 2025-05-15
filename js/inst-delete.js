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
  if (e.target.classList.contains("inst-block__delete")) {
    e.preventDefault();
    e.stopPropagation();
    const li = e.target.closest(".inst-block__item");
    const img = li.querySelector("img");
    const imageUrl = img.src;

    const fileName = imageUrl.split("%2F").pop().split("?")[0];

    if (!confirm(`Delete image ${fileName}?`)) return;

    try {
      const imageRef = ref(storage, `inst_photos/${fileName}`);
      await deleteObject(imageRef);

      await deleteDoc(doc(db, "inst_photos", fileName));

      alert("🗑️ Image deleted!");
      li.remove();
    } catch (error) {
      console.error("Error while deleting:", error);
      alert("❌ Error while deleting. Check the console.");
    }
  }
});
