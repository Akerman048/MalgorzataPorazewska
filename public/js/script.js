import {
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const navContact = document.getElementById("nav__link-contact");
  const contactModal = document.querySelector(".contact-modal");
  const heroUpload = document.querySelector(".hero-video__upload-controls");
  const sliderUploadWwrap = document.getElementById("slider__upload-wrap");
  const picturesSliderUploadModal = document.getElementById(
    "pictures-slider-upload-modal"
  );
  const instFileUploadWrap = document.getElementById("inst__file-upload-wrap");
  const burgerBtn = document.getElementById("burger-btn");
  const navMenu = document.getElementById("nav-menu");

  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      burgerBtn.classList.toggle("open");
    });
  }

  loadContactData();
  loadTitlesData();

  async function loadContactData() {
    try {
      const docRef = doc(db, "data", "contact");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const emailEl = document.querySelectorAll(".contact_email a");
        emailEl.forEach((el) => {
          el.href = `mailto:${data.email}`;
          el.textContent = data.email;
        });

        const contactModalEmail = document.querySelectorAll(
          ".contact-modal_email a"
        );
        contactModalEmail.forEach((el) => {
          el.href = `mailto:${data.email}`;
        });

        const addressEls = document.querySelectorAll(".contact_address");
        addressEls.forEach((el) => {
          el.textContent = data.address;
        });

        const instEls = document.querySelectorAll(".contact_inst a");
        instEls.forEach((el) => {
          el.href = data.instagram;
        });

        const behanceEl = document.querySelectorAll(".contact_be a");
        behanceEl.forEach((el) => {
          el.href = data.behance;
        });

        const fbEls = document.querySelectorAll(".contact_fb a");
        fbEls.forEach((el) => {
          el.href = data.facebook;
        });
      } else {
        console.error("Document 'contact' does not exist");
      }
    } catch (error) {
      console.error("Error loading contact data:", error);
    }
  }

  async function loadTitlesData() {
    try {
      const docRef = doc(db, "data", "titles");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const shapesTitle = document.getElementById("shapesTitle");
        if (shapesTitle) shapesTitle.textContent = data.shapes_title;

        const aboutTitle = document.getElementById("aboutTitle");
        if (aboutTitle) aboutTitle.textContent = data.about_title;
      } else {
        console.error("Document 'titles' does not exist");
      }
    } catch (error) {
      console.error("Error loading titles data:", error);
    }
  }

  function closeModal() {
    contactModal.classList.remove("contact-modal-active");
  }

  function toggleContactModal() {
    // Закриваємо бургер-меню, якщо відкрите
    if (navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      burgerBtn.classList.remove("open");
    }

    // Якщо модалка вже відкрита — закриваємо
    if (contactModal.classList.contains("contact-modal-active")) {
      contactModal.classList.remove("contact-modal-active");
      document.body.classList.remove("no-scroll");
    } else {
      requestAnimationFrame(() => {
        contactModal.classList.add("contact-modal-active");
        document.body.classList.add("no-scroll");
      });
    }
  }

  const modalLinks = contactModal.querySelectorAll("a");
  modalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Якщо посилання не веде нікуди — запобігаємо переходу
      if (!href || href === "#") {
        e.preventDefault();
      }

      closeModal();
    });
  });

  navContact.addEventListener("click", (e) => {
    e.preventDefault();
    toggleContactModal();
  });

  contactModal.addEventListener("click", (e) => {
    const isOutsideClick =
      !e.target.closest(".contact-modal__hero") &&
      !e.target.closest(".footer__wrap");
    if (isOutsideClick) {
      contactModal.classList.remove("contact-modal-active");
      document.body.classList.remove("no-scroll");
    }
  });

  contactModal.addEventListener("wheel", () => {
    if (contactModal.classList.contains("contact-modal-active")) {
      closeModal();
    }
  });

  onAuthStateChanged(auth, (user) => {
    const show = (el) => el && (el.style.display = "block");
    const hide = (el) => el && (el.style.display = "none");

    if (user) {
      console.log("User is logged in:", user.email);
      show(heroUpload);
      show(sliderUploadWwrap);
      show(instFileUploadWrap);
      show(picturesSliderUploadModal);

      setTimeout(() => {
        document.querySelectorAll(".swiper__delete").forEach(show);
        document.querySelectorAll(".inst-block__delete").forEach(show);
      }, 500);
    } else {
      console.log("No user is logged in");
      hide(heroUpload);
      hide(sliderUploadWwrap);
      hide(picturesSliderUploadModal);
      hide(instFileUploadWrap);

      setTimeout(() => {
        document.querySelectorAll(".swiper__delete").forEach(hide);
        document.querySelectorAll(".inst-block__delete").forEach(hide);
      }, 500);
    }
  });
});

const faders = document.querySelectorAll(".fade-in");

const appearOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px",
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("appear");
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});
