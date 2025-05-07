const navContact = document.getElementById("nav__link-contact");
const contactModal = document.querySelector(".contact-modal");

function closeModal() {
  contactModal.classList.remove("contact-modal-active");
}

function openContactModal() {
  contactModal.classList.toggle("contact-modal-active");
}

navContact.addEventListener("click", openContactModal);

// Закриття при кліку на фон
contactModal.addEventListener("click", (e) => {
  if (e.target === contactModal) {
    closeModal();
  }
});

// Закриття при прокрутці тільки якщо модалка відкрита
contactModal.addEventListener("wheel", (e) => {
  if (contactModal.classList.contains('contact-modal-active')) {
    closeModal();
  }
});
