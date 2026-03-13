import { db, auth, storage } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const itemDetails = document.getElementById("item-details");

let isAdmin = false;
let workId = null; // збережемо ID документа

onAuthStateChanged(auth, (user) => {
  isAdmin = !!user;
  if (slug) loadWorkBySlug(slug);
});

// Витягуємо slug через параметри запиту
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
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
      workId = docSnap.id;

      itemDetails.innerHTML = `
      <div class="item">
        <div class="item__img-wrapper" id="image-gallery">
          <div class="swiper mySwiper2">
            <div class="swiper-wrapper">
              ${data.images
                .map(
                  (img, index) => `
                <div class="swiper-slide">
                  <img src="${img}" alt="${data.title}" loading="lazy"/>
                  ${
                    isAdmin
                      ? `<button class="delete-image-btn" data-index="${index}">delete🗑️</button>`
                      : ""
                  }
                </div>`
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
                  <img src="${img}" alt="${data.title}" loading="lazy"/>
                </div>`
                )
                .join("")}
            </div>
          </div>

          ${
            isAdmin
              ? `
            <div class="image-upload-form">
              <input type="file" id="newImageInput" accept="image/*" />
              <button id="uploadNewImageBtn">➕ Add Image</button>
            </div>`
              : ""
          }
        </div>

        <div class="item__info-wrapper">
          ${
            isAdmin
              ? `
          <input type="text" id="editTitle" class="item__title" value="${data.title}"/>
          <input type="text" id="editYear" class="item__year" value="${data.year}"/>
          <textarea id="editDescription" class="item__descr">${data.description}</textarea>
          <button id="saveTextChangesBtn">Save </button>`
              : `
        <h3 class="item__title">${data.title}</h3>
          <span class="item__year">year: ${data.year}</span>
          <p class="item__descr">${data.description}</p>
        </div>`
          }
      </div>
    `;

      // 2. ТІЛЬКИ ТЕПЕР ініціалізуємо Swiper
      initializeSwiper();
      if (isAdmin) {
        const saveBtn = document.getElementById("saveTextChangesBtn");

        if (saveBtn) {
          saveBtn.addEventListener("click", async () => {
            const newTitle = document.getElementById("editTitle").value.trim();
            const newYear = document.getElementById("editYear").value.trim();
            const newDesc = document
              .getElementById("editDescription")
              .value.trim();

            if (!newTitle || !newYear) {
              alert("Title and year are required");
              return;
            }

            try {
              await updateDoc(doc(db, "works", workId), {
                title: newTitle,
                year: newYear,
                description: newDesc,
              });
              alert("✅ Changes saved");
              loadWorkBySlug(slug);
            } catch (error) {
              console.log("Update error: ", error);
              alert("❌ Failed to update data");
            }
          });
        }
        // Кнопка "Додати зображення"
        document
          .getElementById("uploadNewImageBtn")
          .addEventListener("click", async () => {
            const file = document.getElementById("newImageInput").files[0];
            if (!file) return alert("Choose an image first");

            const storageRef = ref(storage, `works/${slug}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const newImages = [...data.images, url];
            await updateDoc(doc(db, "works", workId), { images: newImages });

            alert("✅ Image added");
            loadWorkBySlug(slug);
          });

        // Кнопки "Видалити зображення"
        document.querySelectorAll(".delete-image-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const index = parseInt(btn.dataset.index);
            const confirmed = confirm("Delete this image?");
            if (!confirmed) return;

            const updatedImages = data.images.filter((_, i) => i !== index);
            await updateDoc(doc(db, "works", workId), {
              images: updatedImages,
            });

            alert("✅ Image removed");
            loadWorkBySlug(slug);
          });
        });
      }
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
