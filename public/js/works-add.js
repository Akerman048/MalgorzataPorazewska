import { db, storage } from "./firebase-config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const uploadBtn = document.getElementById("uploadWorkBtn");
const loader = document.getElementById("upload_loader");
const coverPositionRange = document.getElementById("workCoverPositionRange");
const coverPositionValue = document.getElementById("workCoverPositionValue");

if (coverPositionRange && coverPositionValue) {
  coverPositionValue.textContent = `${coverPositionRange.value}%`;

  coverPositionRange.addEventListener("input", (e) => {
    coverPositionValue.textContent = `${e.target.value}%`;
  });
}

if (uploadBtn) {
  uploadBtn.addEventListener("click", async () => {
    const files = document.getElementById("uploadImage")?.files;
    const title = document.getElementById("uploadTitle")?.value.trim();
    const year = document.getElementById("uploadYear")?.value.trim();
    const slug = document.getElementById("uploadSlug")?.value.trim();
    const categoryRadio = document.querySelector(
      'input[name="uploadCategory"]:checked',
    );
    const category = categoryRadio ? categoryRadio.value : "";
    const description = document
      .getElementById("uploadDescription")
      ?.value.trim();
    const coverPosition = coverPositionRange ? coverPositionRange.value : "50";

    if (!files?.length || !title || !slug || !category) {
      alert("Please fill all required fields and select images.");
      return;
    }

    try {
      loader?.classList.remove("hidden");

      const imageUrls = [];

      for (const file of files) {
        const storageRef = ref(storage, `works/${slug}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      await setDoc(doc(db, "works", slug), {
        title,
        slug,
        year,
        category: category.toLowerCase(),
        description,
        images: imageUrls,
        coverObjectPosition: `center ${coverPosition}%`,
        createdAt: Date.now(),
      });

      document.getElementById("uploadImage").value = "";
      document.getElementById("uploadTitle").value = "";
      document.getElementById("uploadYear").value = "";
      document.getElementById("uploadSlug").value = "";
      document.getElementById("uploadDescription").value = "";

      if (coverPositionRange && coverPositionValue) {
        coverPositionRange.value = "50";
        coverPositionValue.textContent = "50%";
      }

      alert("✅ Work uploaded!");
      await window.loadWorks();
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Failed to upload.");
    } finally {
      loader?.classList.add("hidden");
    }
  });
}
