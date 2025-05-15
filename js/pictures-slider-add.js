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

const fileInput = document.getElementById("pictures-slider-modal-file");
const titleInput = document.getElementById("pictures-slider-modal-title");
const submitBtn = document.getElementById("pictures-slider-modal-submit");

function initializeSwiper() {
  var swiper = new Swiper(".pictures-swiper-slider", {
    effect: "fade",
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    pagination: {
      type: "fraction",
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

submitBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  const title = titleInput.value.trim();

  if (!file || !title) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const storageRef = ref(storage, "pictures_slider/" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await setDoc(doc(db, "pictures_slider", file.name), {
      image: url,
      title: title,
      timeStamp: Date.now(),
    });

    alert("✅ Image uploaded!");

    fileInput.value = "";

    titleInput.value = "";
    loadPicturesSliderGallery();
  } catch (error) {
    console.error("Upload error:", error);
    alert("❌ Upload failed. See console.");
  }
});

async function loadPicturesSliderGallery() {
  const swiperWrapper = document.getElementById("pictures-swiper-wrapper");
  swiperWrapper.innerHTML = "";

  const q = query(
    collection(db, "pictures_slider"),
    orderBy("timeStamp", "desc")
  );

  try {
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = `
        <img src="${data.image}" alt="${data.title}" />
        <span class="pictures-swiper-descr">${data.title}</span>
        <span class="swiper__delete pictures-slider-delete">delete slide</span>
      `;

      swiperWrapper.appendChild(slide);
    });

    initializeSwiper();
  } catch (error) {
    console.error("Load error:", error);
    alert("❌ Failed to load slider.");
  }
}
loadPicturesSliderGallery();