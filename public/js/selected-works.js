import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const container = document.querySelector(".selected-works__grid");

async function loadSelectedWorks() {
  try {
    const q = query(collection(db, "works"), where("selected", "==", true));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = "<p>No featured works yet.</p>";
      return;
    }
    container.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.classList.add("selected-works__item");
      li.innerHTML = `
      <a href="/item.html?slug=${data.slug}" class="selected-works__link">
        <div class="selected-works__img-wrapper">
          <img class="selected-works__img" src="${data.images?.[0]}" alt="${data.title}" />
        </div>
        <span class="selected-works__title">${data.title}</span>
      </a>
    `;
    container.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading featured works:", error);
    container.innerHTML = "<p>Failed to load featured works.</p>";
  }
}


loadSelectedWorks();