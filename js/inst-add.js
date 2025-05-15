import { storage, db } from "./firebase-config.js";
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

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file");

  const storageRef = ref(storage, "inst_photos/" + file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const link = prompt("Enter link for this image:");

  await setDoc(doc(db, "inst_photos", file.name), {
    image: url,
    link: link,
    timestamp:Date.now(),
  });

  alert("✅ Image uploaded and saved!");
  location.reload();
});

async function loadGallery() {
  const container = document.querySelector(".inst-block__grid");
  container.innerHTML = "";

  const q = query(collection(db, 'inst_photos'), orderBy('timestamp', 'desc'))
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();

    const li = document.createElement("li");
    li.classList.add("inst-block__item");
    li.innerHTML = ` <a href="${data.link}" class="inst-block__link" target="_blank">
        <div class="inst-block__img-wrapper">
          <img src="${data.image}" />
        </div>
      </a>
      <span class="inst-block__delete"></span>
        `;

    container.appendChild(li);
  });
}

loadGallery();
