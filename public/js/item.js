import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const itemDetails = document.getElementById("item-details");

// Витягуємо slug через параметри запиту
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (slug) {
  loadWorkBySlug(slug);
} else {
  itemDetails.innerHTML = "<p>Invalid work slug.</p>";
}

async function loadWorkBySlug(slug) {
  try {
    const worksRef = collection(db, "works");
    const q = query(worksRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      // 1. Спочатку вставляємо HTML
      itemDetails.innerHTML = `
        <div class="item">
          <div class="item__img-wrapper">
            <div class="swiper mySwiper2">
              <div class="swiper-wrapper">
                ${data.images
                  .map(
                    (img) => `
                  <div class="swiper-slide">
                    <img src="${img}" alt="${data.title}" />
                  </div>
                `
                  )
                  .join("")}
              </div>
              <div class="swiper-button-next"></div>
              <div class="swiper-button-prev"></div>
            </div>

            <div thumbsSlider="" class="swiper mySwiper">
              <div class="swiper-wrapper">
                ${data.images
                  .map(
                    (img) => `
                  <div class="swiper-slide">
                    <img src="${img}" alt="${data.title}" />
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div class="item__info-wrapper">
            <h3 class="item__title">${data.title}</h3>
            <span class="item__year">year: ${data.year}</span>
            <p class="item__descr">${data.description}</p>
          </div>
        </div>
      `;

      // 2. ТІЛЬКИ ТЕПЕР ініціалізуємо Swiper
      initializeSwiper();
    } else {
      itemDetails.innerHTML = "<p>Work not found.</p>";
    }
  } catch (error) {
    console.error("Error loading work:", error);
    itemDetails.innerHTML = "<p>Error loading work.</p>";
  }
}

// Функція для запуску Swiper тільки після вставки HTML
function initializeSwiper() {
  var swiper = new Swiper(".mySwiper", {
    loop: true,
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  });
  var swiper2 = new Swiper(".mySwiper2", {
    loop: true,
    spaceBetween: 10,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    thumbs: {
      swiper: swiper,
    },
  });
}
