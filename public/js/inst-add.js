import { storage, db, auth } from "./firebase-config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import {
  doc,
  setDoc,
  query,
  orderBy,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const fileInput = document.getElementById("inst__file-upload");
const uploadBtn = document.getElementById("inst__upload-btn");
const positionRange = document.getElementById("instPositionRange");
const positionValue = document.getElementById("instPositionValue");

console.log("inst-add.js loaded");
console.log({ fileInput, uploadBtn, positionRange, positionValue });

if (positionRange && positionValue) {
  positionValue.textContent = `${positionRange.value}%`;

  positionRange.addEventListener("input", (e) => {
    const value = e.target.value;
    positionValue.textContent = `${value}%`;
    console.log("slider value:", value);
  });
}

if (uploadBtn) {
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
      alert("Please select a file");
      return;
    }

    const position = positionRange ? positionRange.value : "50";

    try {
      const storageRef = ref(storage, `inst_photos/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const link = prompt("Enter link for this image:") || "";

      const payload = {
        image: url,
        link,
        fileName: file.name,
        objectPosition: `center ${position}%`,
        timestamp: Date.now(),
      };

      console.log("saving payload:", payload);

      await setDoc(doc(db, "inst_photos", file.name), payload);

      alert("✅ Image uploaded and saved!");
      location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload failed");
    }
  });
}

async function loadGallery() {
  const container = document.querySelector(".inst-block__grid");
  if (!container) return;

  container.innerHTML = "";

  try {
    const q = query(
      collection(db, "inst_photos"),
      orderBy("timestamp", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const user = auth.currentUser;
    const isAdmin = user !== null;

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      const li = document.createElement("li");
      li.classList.add("inst-block__item");

      li.innerHTML = `
        <a href="${data.link || "#"}" class="inst-block__link" target="_blank">
          <div class="inst-block__img-wrapper">
            <img
              src="${data.image}"
              loading="lazy"
              alt="Instagram image"
              style="object-position: ${data.objectPosition || "center 50%"};"
            />
          </div>
        </a>
        <span
          class="inst-block__delete"
          data-file-name="${data.fileName || docSnapshot.id}"
          style="display: ${isAdmin ? "flex" : "none"}"
        ></span>
      `;

      container.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

loadGallery();
