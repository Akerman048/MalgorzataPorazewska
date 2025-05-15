import { storage, db } from "./firebase-config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Elements
const openModalBtn = document.getElementById("slider__upload-btn");
const modal = document.getElementById("slider-upload-modal");
const fileInput = document.getElementById("slider-modal-file");
const linkInput = document.getElementById("slider-modal-link");
const titleInput = document.getElementById("slider-modal-title");
const submitBtn = document.getElementById("slider-modal-submit");
const cancelBtn = document.getElementById("slider-modal-cancel");
const sliderWrapper = document.getElementById("swiper-block-wrapper");

function initializeSwiper() {
    new Swiper(".mySwiper", {
      effect: "fade",
      loop: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        type: "fraction",
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  }

  

// Open modal
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// Cancel modal
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Upload image
submitBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  const link = linkInput.value.trim();
  const title = titleInput.value.trim();

  if (!file || !link || !title) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const storageRef = ref(storage, "slider_photos/" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await setDoc(doc(db, "slider_photos", file.name), {
      image: url,
      link: link,
      title: title,
      timestamp: Date.now(),
    });

    alert("✅ Image uploaded!");
    modal.classList.add("hidden");
    fileInput.value = "";
    linkInput.value = "";
    titleInput.value = "";
    loadSliderGallery(); // refresh
  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Upload failed. See console.");
  }
});

// Load gallery
async function loadSliderGallery() {
  sliderWrapper.innerHTML = "";

  const q = query(
    collection(db, "slider_photos"),
    orderBy("timestamp", "desc")
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    slide.innerHTML = `
      <div>
        <a href="${data.link}" target="_blank">
          <img src="${data.image}" alt="${data.title}" />
        </a>
        <span class="swiper__slide-title">${data.title}</span>
        <span class="swiper__delete slider__delete">delete slide</span>
      </div>
    `;
    sliderWrapper.appendChild(slide);
  });

  initializeSwiper();
}

loadSliderGallery();

