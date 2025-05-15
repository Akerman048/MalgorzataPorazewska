import { db, storage } from "./firebase-config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const uploadBtn = document.getElementById("uploadWorkBtn");

uploadBtn.addEventListener("click", async () => {
  const files = document.getElementById("uploadImage").files;
  const title = document.getElementById("uploadTitle").value.trim();
  const year = document.getElementById("uploadYear").value.trim();
  const slug = document.getElementById("uploadSlug").value.trim();
  const category = document.getElementById("uploadCategory").value.trim();
  const description = document.getElementById("uploadDescription").value.trim();

  if (!files.length || !title || !slug || !category) {
    alert("Please fill all required fields and select images.");
    return;
  }
 
  try {
    const imageUrls = [];

    for (let file of files) {
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
      createdAt: Date.now(),
    });

    alert("✅ Work uploaded!");
    window.loadWorks(); // reload gallery
  } catch (err) {
    console.error(err);
    alert("❌ Failed to upload.");
  }
});


