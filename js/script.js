import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const navContact = document.getElementById("nav__link-contact");
  const contactModal = document.querySelector(".contact-modal");
  const heroUpload = document.querySelector(".hero-video__upload-controls");
  const sliderUploadWwrap = document.getElementById("slider__upload-wrap");
  const picturesSliderUploadModal = document.getElementById("pictures-slider-upload-modal");
  const instFileUploadWrap = document.getElementById("inst__file-upload-wrap");

  loadContactData();

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

        const addressEls = document.querySelectorAll(".contact_address");
        addressEls.forEach((el) => {
          el.textContent = data.address;
        });

        const instEls = document.querySelectorAll(".contact_inst a");
        instEls.forEach((el) => {
          el.href = data.instagram;
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

  function closeModal() {
    contactModal.classList.remove("contact-modal-active");
  }

  function openContactModal() {
    contactModal.classList.toggle("contact-modal-active");
   
  }

  navContact.addEventListener("click", (e) => {
    e.preventDefault();
    openContactModal();
  });

  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) {
      closeModal();
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
