import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const gallery = document.getElementById("works__list");
const clearBtn = document.querySelector(".works__clear");
const categoryButtons = document.querySelectorAll(
  ".works__categories-btn:not(.works__clear)"
);

let selectedCategories = [];
let isLoggedIn = false;

onAuthStateChanged(auth, (user) => {
  isLoggedIn = !!user;

  if (user) {
    console.log("User is logged in:", user.email);
    document.querySelector(".upload-form").style.display = "block";
    
      document.querySelectorAll(".delete-btn").forEach((el) => (el.style.display = "block"));
    document.querySelectorAll(".toggle-selected-btn").forEach((el) => (el.style.display = "block"));

     
    
  } else {
    console.log("No user is logged in");
    document.querySelector(".upload-form").style.display = "none";
    document.querySelectorAll(".delete-btn").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".toggle-selected-btn").forEach((el) => (el.style.display = "none"));
    
  } loadWorks();
});

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
      ${isLoggedIn ? `<button class="delete-btn" data-id="${id}">🗑 Delete</button>` : ""}
      ${isLoggedIn ? `<button class="toggle-selected-btn" data-id="${id}" data-selected="${data.selected}">
        ${data.selected ? "Remove from favorites" : "Add to favorites"}</button>` : ""}
    `;

    gallery.appendChild(card);
  });

  // Показати або приховати кнопку "Remove all filters"
  if (selectedCategories.length > 0) {
    clearBtn.style.display = "inline-flex";
  } else {
    clearBtn.style.display = "none";
  }
  setupDeleteButtons();
  setupSelectedButtons();
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

function setupDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm("Delete this work?");
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "works", id));
        alert("✅ Deleted");
        window.loadWorks(); // перезавантаження галереї
      } catch (err) {
        console.error(err);
        alert("❌ Failed to delete");
      }
    });
  });
}



function setupSelectedButtons() {
  document.querySelectorAll(".toggle-selected-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const current = btn.dataset.selected === "true";

      try {
        await updateDoc(doc(db, "works", id), {
          selected: !current,
        });
        alert("✅ Updated!");
        loadWorks(); // reload gallery
      } catch (err) {
        console.error(err);
        alert("❌ Failed to update selected status");
      }
    });
  });
}







window.loadWorks = loadWorks;


loadWorks();
