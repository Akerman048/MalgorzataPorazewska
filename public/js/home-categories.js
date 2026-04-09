import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function renderHomeCategories() {
  const container = document.getElementById("homeCategories");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "categories"));
  const categories = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    categories.push({
      id: docSnap.id,
      name: data.name,
    });
  });

  categories.sort((a, b) => a.name.localeCompare(b.name));

  const allLink = document.createElement("a");
  allLink.href = "works.html?category=all";
  allLink.className = "shape-link home-category-link";
  allLink.innerHTML = `
    <span class="label home-category-label">All works</span>
  `;
  container.appendChild(allLink);

  categories.forEach((category) => {
    const link = document.createElement("a");
    link.href = `works.html?category=${encodeURIComponent(category.id)}`;
    link.className = "shape-link home-category-link";
    link.innerHTML = `
      <span class="label home-category-label">${capitalize(category.name)}</span>
    `;
    container.appendChild(link);
  });

  document.dispatchEvent(new CustomEvent("homeCategoriesRendered"));
}

document.addEventListener("DOMContentLoaded", renderHomeCategories);
