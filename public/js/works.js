import { db } from "./firebase-config.js";
import {
  collection,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const gallery = document.getElementById("works__list");
const categoryList = document.getElementById("categoryList");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const newCategoryInput = document.getElementById("newCategoryInput");

let selectedCategories = [];
let isLoggedIn = false;

function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const categories = params.getAll("category");

  if (!categories.length) return;

  selectedCategories = categories
    .map((category) => category.toLowerCase())
    .filter((category) => category !== "all");
}

function updateURLFromSelectedCategories() {
  const url = new URL(window.location);
  url.searchParams.delete("category");

  selectedCategories.forEach((category) => {
    url.searchParams.append("category", category);
  });

  window.history.replaceState({}, "", url);
}

window.addEventListener("DOMContentLoaded", async () => {
  getCategoryFromURL();
  await loadCategories();
  await renderCategoryButtons();
  await renderUploadCategoryRadios();
});

onAuthStateChanged(auth, async (user) => {
  isLoggedIn = !!user;

  const uploadForm = document.querySelector(".upload-form");
  const categoryAdmin = document.getElementById("category-admin");

  if (uploadForm) {
    uploadForm.style.display = isLoggedIn ? "flex" : "none";
  }

  if (categoryAdmin) {
    categoryAdmin.style.display = isLoggedIn ? "block" : "none";
  }

  await loadWorks();
});

if (addCategoryBtn) {
  addCategoryBtn.addEventListener("click", async () => {
    const name = newCategoryInput.value.trim().toLowerCase();
    if (!name) {
      alert("Enter a category name");
      return;
    }

    const docRef = doc(db, "categories", name);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
      alert("❗ This category already exists!");
      return;
    }

    try {
      await setDoc(docRef, { name });
      newCategoryInput.value = "";
      alert("✅ Category added");
      await loadCategories();
      await renderCategoryButtons();
      await renderUploadCategoryRadios();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add category");
    }
  });
}

async function loadCategories() {
  if (!categoryList) return;

  categoryList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "categories"));

  snapshot.forEach((docSnap) => {
    const { name } = docSnap.data();
    const id = docSnap.id;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${name}</span>
      <button class="edit-cat-btn" data-id="${id}" data-name="${name}">✏️</button>
      <button class="delete-cat-btn" data-id="${id}">🗑️</button>
    `;
    categoryList.appendChild(li);
  });

  document.querySelectorAll(".edit-cat-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const oldId = btn.dataset.id;
      const oldName = btn.dataset.name;
      const newName = prompt("Enter new category name:", oldName);

      if (!newName || newName.toLowerCase() === oldName.toLowerCase()) return;

      const newId = newName.toLowerCase();
      const newDocRef = doc(db, "categories", newId);
      const exists = await getDoc(newDocRef);

      if (exists.exists()) {
        alert("❗ Category with this name already exists.");
        return;
      }

      try {
        await setDoc(newDocRef, { name: newName });

        const q = query(
          collection(db, "works"),
          where("category", "==", oldId),
        );
        const snapshot = await getDocs(q);

        await Promise.all(
          snapshot.docs.map((docSnap) =>
            updateDoc(doc(db, "works", docSnap.id), { category: newId }),
          ),
        );

        await deleteDoc(doc(db, "categories", oldId));

        alert("✅ Category updated");
        await loadCategories();
        await renderCategoryButtons();
        await renderUploadCategoryRadios();
        await loadWorks();
      } catch (err) {
        console.error(err);
        alert("❌ Failed to update category");
      }
    });
  });

  document.querySelectorAll(".delete-cat-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("Delete this category?")) return;

      try {
        await deleteDoc(doc(db, "categories", id));
        alert("✅ Category deleted");
        await loadCategories();
        await renderCategoryButtons();
        await renderUploadCategoryRadios();
        await loadWorks();
      } catch (err) {
        console.error(err);
        alert("❌ Failed to delete category");
      }
    });
  });
}

function updateClearButtonVisibility() {
  const clearBtn = document.querySelector(".works__clear");
  if (!clearBtn) return;

  clearBtn.style.display =
    selectedCategories.length > 0 ? "inline-flex" : "none";
}

async function renderCategoryButtons() {
  const container = document.getElementById("categoryButtons");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "categories"));
  const fragment = document.createDocumentFragment();
  const seen = new Set();

  snapshot.forEach((docSnap) => {
    const { name } = docSnap.data();
    const normalized = name.toLowerCase();

    if (seen.has(normalized)) return;
    seen.add(normalized);

    const button = document.createElement("button");
    button.className = "works__categories-btn works-category-btn";
    button.textContent = capitalize(name);

    if (selectedCategories.includes(normalized)) {
      button.classList.add("ctgrActive");
    }

    button.addEventListener("click", () => toggleCategory(normalized, button));
    fragment.appendChild(button);
  });

  container.appendChild(fragment);

  const clearBtn = document.createElement("button");
  clearBtn.className = "works__categories-btn works-category-btn works__clear";
  clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
    <path fill="currentColor" d="m12 12.708l-5.246 5.246q-.14.14-.344.15t-.364-.15t-.16-.354t.16-.354L11.292 12L6.046 6.754q-.14-.14-.15-.344t.15-.364t.354-.16t.354.16L12 11.292l5.246-5.246q.14-.14.345-.15q.203-.01.363.15t.16.354t-.16.354L12.708 12l5.246 5.246q.14.14.15.345q.01.203-.15.363t-.354.16t-.354-.16z"/></svg> Remove all filters`;

  clearBtn.addEventListener("click", () => {
    selectedCategories = [];
    document
      .querySelectorAll(".works__categories-btn.ctgrActive")
      .forEach((btn) => btn.classList.remove("ctgrActive"));

    updateURLFromSelectedCategories();
    updateClearButtonVisibility();
    loadWorks();
  });

  container.appendChild(clearBtn);
  updateClearButtonVisibility();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleCategory(category, button) {
  if (selectedCategories.includes(category)) {
    selectedCategories = selectedCategories.filter((c) => c !== category);
    button.classList.remove("ctgrActive");
  } else {
    selectedCategories.push(category);
    button.classList.add("ctgrActive");
  }

  updateURLFromSelectedCategories();
  updateClearButtonVisibility();
  loadWorks();
}

async function loadWorks() {
  if (!gallery) return;

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

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.classList.add("works__item-wrapper");

    card.innerHTML = `
      <a href="item.html?slug=${data.slug}" class="works__item">
        <div class="works__img-wrapper">
          <img
            class="works__img"
            src="${data.images?.[0] || ""}"
            alt="${data.title}"
            loading="lazy"
            style="object-position: ${data.coverObjectPosition || "center 50%"};"
          />
        </div>
        <h3 class="works__title">${data.title}</h3>
      </a>
      ${
        isLoggedIn
          ? `
            <button class="delete-btn" data-id="${id}">🗑 Delete</button>
            <button
              class="toggle-selected-btn"
              data-id="${id}"
              data-selected="${!!data.selected}"
            >
              ${data.selected ? "Remove from favorites" : "Add to favorites"}
            </button>
          `
          : ""
      }
    `;

    gallery.appendChild(card);
  });

  requestAnimationFrame(() => {
    setupDeleteButtons();
    setupSelectedButtons();
  });
}

async function renderUploadCategoryRadios() {
  const container = document.getElementById("categoryRadioGroup");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "categories"));
  container.innerHTML = "";

  snapshot.forEach((docSnap, index) => {
    const { name } = docSnap.data();
    const id = docSnap.id;
    const radioId = `upload-cat-${id}`;

    const wrapper = document.createElement("label");
    wrapper.className = "upload-category-option";
    wrapper.innerHTML = `
      <input
        type="radio"
        name="uploadCategory"
        value="${id}"
        id="${radioId}"
        ${index === 0 ? "checked" : ""}
      />
      ${capitalize(name)}
    `;
    container.appendChild(wrapper);
  });
}

function setupDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("Delete this work?")) return;

      try {
        await deleteDoc(doc(db, "works", id));
        alert("✅ Deleted");
        await loadWorks();
      } catch (err) {
        console.error("❌ Error deleting:", err);
        alert("❌ Failed to delete");
      }
    });
  });
}

function setupSelectedButtons() {
  document.querySelectorAll(".toggle-selected-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const current = btn.getAttribute("data-selected") === "true";
      const loadingText = btn.textContent;

      btn.disabled = true;
      btn.textContent = "⏳ Updating...";

      try {
        await updateDoc(doc(db, "works", id), { selected: !current });

        btn.setAttribute("data-selected", (!current).toString());
        btn.textContent = !current
          ? "Remove from favorites"
          : "Add to favorites";
      } catch (err) {
        console.error("❌ Firestore update error:", err);
        alert("❌ Failed to update selected status");
        btn.textContent = loadingText;
      } finally {
        btn.disabled = false;
      }
    });
  });
}

window.loadWorks = loadWorks;
