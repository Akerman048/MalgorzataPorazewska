import { auth, db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const openBtn = document.getElementById("openTypographySettings");
const modal = document.getElementById("typographyModal");
const closeBtn = document.getElementById("closeTypographyModal");
const saveBtn = document.getElementById("saveTypography");

const elementSelect = document.getElementById("elementSelect");
const fontStyleInput = document.getElementById("fontStyle");
const fontWeightInput = document.getElementById("fontWeight");
const fontSizeInput = document.getElementById("fontSize");
const lineHeightInput = document.getElementById("lineHeight");
const letterSpacingInput = document.getElementById("letterSpacing");
const mobileLetterSpacing = document.getElementById("mobileLetterSpacing");

const mobileFontStyle = document.getElementById("mobileFontStyle");
const mobileFontWeight = document.getElementById("mobileFontWeight");
const mobileFontSize = document.getElementById("mobileFontSize");
const mobileLineHeight = document.getElementById("mobileLineHeight");
const fontFamilyInput = document.getElementById("fontFamilySelect");
const mobileFontFamilyInput = document.getElementById("mobileFontFamilySelect");
const fontColorInput = document.getElementById("fontColor");
const mobileFontColorInput = document.getElementById("mobileFontColor");

const ELEMENT_MAP = {
  headerName: [".header__name a", ".header__name--mobile a"],
  navLink: [".nav__link a"],
  contactTitle: [".contact-modal__hero-title"],
  footerTitle: [".footer__title"],
  shapesHeading: ["#shapesTitle"],
  homeCategoryLabel: [".home-category-label"],
  worksCategoryLabel: [".works__categories-btn"],
  sliderHeading: [".slider__heading"],
  selectedWorks: [".selected-works__title"],
  instHeading: [".inst-block__heading"],
  smallHeading: ["h6", ".small-heading"],
  aboutText: ["#aboutTitle"],
  itemTitle: [".item__title"],
  itemYear: [".item__year"],
  itemDescription: [".item__descr"],
};

Object.values(ELEMENT_MAP)
  .flat()
  .forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add("typography-loading");
    });
  });

function getDefaultTypographySettings() {
  return {
    desktop: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "16",
      lineHeight: "1.5",
      letterSpacing: "0",
      fontFamily: "",
      fontColor: "#000000",
    },
    mobile: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "14",
      lineHeight: "1.4",
      letterSpacing: "0",
      fontFamily: "",
      fontColor: "#000000",
    },
  };
}

function fillTypographyForm(settings = {}) {
  const defaults = getDefaultTypographySettings();

  const merged = {
    desktop: {
      ...defaults.desktop,
      ...(settings.desktop || {}),
    },
    mobile: {
      ...defaults.mobile,
      ...(settings.mobile || {}),
    },
  };

  if (fontStyleInput) fontStyleInput.value = merged.desktop.fontStyle;
  if (fontWeightInput) fontWeightInput.value = merged.desktop.fontWeight;
  if (fontSizeInput) fontSizeInput.value = merged.desktop.fontSize;
  if (lineHeightInput) lineHeightInput.value = merged.desktop.lineHeight;
  if (letterSpacingInput) letterSpacingInput.value = merged.desktop.letterSpacing;
  if (fontFamilyInput) fontFamilyInput.value = merged.desktop.fontFamily;
  if (fontColorInput) fontColorInput.value = merged.desktop.fontColor;

  if (mobileFontStyle) mobileFontStyle.value = merged.mobile.fontStyle;
  if (mobileFontWeight) mobileFontWeight.value = merged.mobile.fontWeight;
  if (mobileFontSize) mobileFontSize.value = merged.mobile.fontSize;
  if (mobileLineHeight) mobileLineHeight.value = merged.mobile.lineHeight;
  if (mobileLetterSpacing) mobileLetterSpacing.value = merged.mobile.letterSpacing;
  if (mobileFontFamilyInput) mobileFontFamilyInput.value = merged.mobile.fontFamily;
  if (mobileFontColorInput) mobileFontColorInput.value = merged.mobile.fontColor;
}

async function loadAndApplyTypography() {
  const docSnap = await getDoc(doc(db, "siteSettings", "typography"));
  const typography = docSnap.exists() ? docSnap.data() : {};
  applyAllTypography(typography);
  return typography;
}

// Показуємо кнопку тільки адміну,
// але самі стилі застосовуємо для ВСІХ
onAuthStateChanged(auth, async (user) => {
  if (user && openBtn) {
    openBtn.style.display = "inline-block";
    await loadTypographyFontOptions();
  } else if (openBtn) {
    openBtn.style.display = "none";
  }

  await loadAndApplyTypography();
});

if (openBtn) {
  openBtn.addEventListener("click", async () => {
    if (modal) modal.classList.remove("hidden");

    const selectedKey = elementSelect?.value;
    const docSnap = await getDoc(doc(db, "siteSettings", "typography"));
    const typography = docSnap.exists() ? docSnap.data() : {};
    const settings = typography[selectedKey] || {};

    fillTypographyForm(settings);
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    if (modal) modal.classList.add("hidden");
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const key = elementSelect?.value;
    if (!key) return;

    const ref = doc(db, "siteSettings", "typography");

    const docSnap = await getDoc(ref);
    const existingData = docSnap.exists() ? docSnap.data() : {};
    const currentSettings = existingData[key] || getDefaultTypographySettings();

    const newSettings = {
      desktop: {
        ...getDefaultTypographySettings().desktop,
        ...(currentSettings.desktop || {}),
        fontStyle: fontStyleInput?.value || "normal",
        fontWeight: fontWeightInput?.value || "400",
        fontSize: fontSizeInput?.value || "16",
        lineHeight: lineHeightInput?.value || "1.5",
        letterSpacing: letterSpacingInput?.value || "0",
        fontFamily: fontFamilyInput?.value || "",
        fontColor: fontColorInput?.value || "#000000",
      },
      mobile: {
        ...getDefaultTypographySettings().mobile,
        ...(currentSettings.mobile || {}),
        fontStyle: mobileFontStyle?.value || "normal",
        fontWeight: mobileFontWeight?.value || "400",
        fontSize: mobileFontSize?.value || "14",
        lineHeight: mobileLineHeight?.value || "1.4",
        letterSpacing: mobileLetterSpacing?.value || "0",
        fontFamily: mobileFontFamilyInput?.value || "",
        fontColor: mobileFontColorInput?.value || "#000000",
      },
    };

    await setDoc(
      ref,
      {
        [key]: newSettings,
      },
      { merge: true },
    );

    applyTypography(key, newSettings);
    alert("✅ Typography settings saved!");
    if (modal) modal.classList.add("hidden");
  });
}

if (elementSelect) {
  elementSelect.addEventListener("change", async () => {
    const docSnap = await getDoc(doc(db, "siteSettings", "typography"));
    const typography = docSnap.exists() ? docSnap.data() : {};
    const settings = typography[elementSelect.value] || {};

    fillTypographyForm(settings);
  });
}

function loadGoogleFont(fontFamily) {
  if (!fontFamily) return;

  const cleanFont = fontFamily.replace(/['"]/g, "").trim();
  if (!cleanFont) return;

  const formatted = cleanFont.replace(/ /g, "+");
  const linkId = `google-font-typography-${formatted}`;

  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;
  document.head.appendChild(link);
}

function applyTypography(key, settings) {
  const targets = ELEMENT_MAP[key] || [];

  const applyToElements = (style) => {
    targets.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (style.fontFamily) {
          loadGoogleFont(style.fontFamily);
        }

        el.style.fontStyle = style.fontStyle || "";
        el.style.fontWeight = style.fontWeight || "";
        el.style.fontSize = style.fontSize ? `${style.fontSize}px` : "";
el.style.lineHeight = style.lineHeight ? `${style.lineHeight}px` : "";        el.style.letterSpacing = style.letterSpacing
          ? `${style.letterSpacing}px`
          : "";
        el.style.fontFamily = style.fontFamily || "";
        el.style.color = style.fontColor || "";
        el.classList.remove("typography-loading");
      });
    });
  };

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const styleToApply = isMobile ? settings.mobile : settings.desktop;

  if (styleToApply) {
    applyToElements(styleToApply);
  }
}

async function loadTypographyFontOptions() {
  const desktopSelect = document.getElementById("fontFamilySelect");
  const mobileSelect = document.getElementById("mobileFontFamilySelect");

  if (!desktopSelect || !mobileSelect) return;

  const apiKey = "AIzaSyDJ_J7GpMa2nj0dZBgaj8W_NZ99gnha-FY";

  try {
    const res = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`,
    );
    const data = await res.json();

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Missing font list from API.");
    }

    desktopSelect.innerHTML = `<option value="">Default</option>`;
    mobileSelect.innerHTML = `<option value="">Default</option>`;

    data.items.forEach((font) => {
      const optionDesktop = document.createElement("option");
      const optionMobile = document.createElement("option");

      const value = `'${font.family}'`;

      optionDesktop.value = value;
      optionDesktop.textContent = font.family;

      optionMobile.value = value;
      optionMobile.textContent = font.family;

      desktopSelect.appendChild(optionDesktop);
      mobileSelect.appendChild(optionMobile);
    });
  } catch (err) {
    console.error("❌ Typography fonts loading error:", err);
    desktopSelect.innerHTML = `<option value="">Error loading fonts</option>`;
    mobileSelect.innerHTML = `<option value="">Error loading fonts</option>`;
  }
}

function applyAllTypography(data) {
  Object.entries(data).forEach(([key, settings]) => {
    applyTypography(key, settings);
  });
}

setTimeout(() => {
  document.querySelectorAll(".typography-loading").forEach((el) => {
    el.classList.remove("typography-loading");
  });
}, 1000);

document.addEventListener("homeCategoriesRendered", async () => {
  await loadAndApplyTypography();
});