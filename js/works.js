import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const gallery = document.getElementById("works__list");
const clearBtn = document.querySelector(".works__clear");
const categoryButtons = document.querySelectorAll(
  ".works__categories-btn:not(.works__clear)"
);

let selectedCategories = [];

async function loadWorks() {
  gallery.innerHTML = "Loading...";

  let worksQuery = collection(db, "works");

  if (selectedCategories.length > 0) {
    worksQuery = query(worksQuery, where("category", "in", selectedCategories));
  }

  const snapshot = await getDocs(worksQuery);
  gallery.innerHTML = "";

  if (snapshot.empty) {
    gallery.innerHTML = "<p>No works in this category</p>";
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;

    const card = document.createElement("div");
    card.classList.add("works__item-wrapper", "fade-in");

    card.innerHTML = `
      <a href="/item.html?slug=${data.slug}" class="works__item">
        <div class="works__img-wrapper">
          <img class="works__img" src="${data.images?.[0]}" alt="${data.title}" />
        </div>
        <h3 class="works__title">${data.title}</h3>
      </a>
    `;

    gallery.appendChild(card);
  });

  // Показати або приховати кнопку "Remove all filters"
  if (selectedCategories.length > 0) {
    clearBtn.style.display = "inline-flex";
  } else {
    clearBtn.style.display = "none";
  }
}

// Функція для перемикання категорії
function toggleCategory(category, buttonElement) {
  if (selectedCategories.includes(category)) {
    selectedCategories = selectedCategories.filter((c) => c !== category);
    buttonElement.classList.remove("active");
  } else {
    selectedCategories.push(category);
    buttonElement.classList.add("active");
  }

  loadWorks();
}

// Навішуємо події на категорії
categoryButtons.forEach((button) => {
  const category = button.textContent.toLowerCase();
  button.addEventListener("click", () => toggleCategory(category, button));
});

// Очищення всіх фільтрів
clearBtn.addEventListener("click", () => {
  selectedCategories = [];
  categoryButtons.forEach((btn) => btn.classList.remove("active"));
  loadWorks();
});

window.loadWorks = loadWorks;
loadWorks();