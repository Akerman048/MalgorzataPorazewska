import {
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db, auth, storage } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

let isLoggedIn = false;
const loader = document.getElementById("about_loader");

document.addEventListener("DOMContentLoaded", async () => {
  await loadAboutTitle();
  await loadAboutBackground();
});

onAuthStateChanged(auth, async (user) => {
  isLoggedIn = !!user;
  const uploadForm = document.getElementById("uploadForm");

  if (uploadForm) {
    uploadForm.style.display = isLoggedIn ? "flex" : "none";
  }
});

const uploadBgImgBtn = document.getElementById("uploadBgImgBtn");

uploadBgImgBtn.addEventListener("click", async () => {
  const bgImagefile = document.getElementById("uploadImage").files[0];
  const aboutbg = document.getElementById("aboutbg");

  if (!bgImagefile) {
    alert("Please select image.");
    return;
  }

  try {
    loader.classList.remove("hidden");

    const storageRef = ref(storage, `about/${bgImagefile.name}`);
    await uploadBytes(storageRef, bgImagefile);
    const url = await getDownloadURL(storageRef);

    const img = new Image();
    img.onload = () => {
      aboutbg.style.backgroundImage = `url('${url}')`;
      aboutbg.classList.add("is-ready");
    };
    img.onerror = () => {
      console.error("Failed to preload uploaded image");
      aboutbg.classList.add("is-ready");
    };
    img.src = url;

    await setDoc(
      doc(db, "about", "background"),
      { url },
      { merge: true }
    );
  } catch (error) {
    console.log(error);
    alert("❌ Failed to upload.");
  } finally {
    loader.classList.add("hidden");
  }
});

async function loadAboutBackground() {
  const aboutbg = document.getElementById("aboutbg");

  try {
    const docRef = doc(db, "about", "background");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (data.url) {
        const img = new Image();

        img.onload = () => {
          aboutbg.style.backgroundImage = `url('${data.url}')`;
          aboutbg.classList.add("is-ready");
        };

        img.onerror = () => {
          console.error("Error preloading background image");
          aboutbg.classList.add("is-ready");
        };

        img.src = data.url;
      } else {
        aboutbg.classList.add("is-ready");
      }
    } else {
      aboutbg.classList.add("is-ready");
    }
  } catch (error) {
    console.error("Error loading background image:", error);
    aboutbg.classList.add("is-ready");
  }
}

const uploadAboutTitleBtn = document.getElementById("uploadAboutTitleBtn");

uploadAboutTitleBtn.addEventListener("click", async () => {
  const titleInput = document.getElementById("uploadTitle");
  const title = titleInput.value.trim();
  const aboutTitle = document.getElementById("aboutTitle");

  if (!title) {
    alert("Please fill in the text.");
    return;
  }

  try {
    loader.classList.remove("hidden");

    await setDoc(
      doc(db, "data", "titles"),
      {
        about_title: title,
      },
      { merge: true }
    );

    aboutTitle.textContent = title;
    alert("✅ Title uploaded!");
  } catch (error) {
    console.error("❌ Error uploading title:", error);
  } finally {
    loader.classList.add("hidden");
  }
});

async function loadAboutTitle() {
  try {
    const docRef = doc(db, "data", "titles");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const aboutTitle = document.getElementById("aboutTitle");

      if (data.about_title) {
        aboutTitle.textContent = data.about_title;
      }
    }
  } catch (error) {
    console.error("Error loading about title:", error);
  }
}