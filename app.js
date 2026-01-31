const navButtons = document.querySelectorAll(".nav-button");
const sideButtons = document.querySelectorAll(".side-button");
const pages = document.querySelectorAll(".page");
const signupButton = document.getElementById("signup-button");
const signupPop = document.getElementById("signup-pop");
const termsModal = document.getElementById("terms-modal");
const termsScroll = document.getElementById("terms-scroll");
const termsActions = document.getElementById("terms-actions");
const agreeButton = document.getElementById("agree-button");
const ageButton = document.getElementById("age-button");
const contactModal = document.getElementById("contact-modal");
const contactForm = document.getElementById("contact-form");
const wordCount = document.getElementById("word-count");
const descriptionField = document.getElementById("contact-description");
const adminCodeInput = document.getElementById("admin-code");
const unlockButton = document.getElementById("unlock-button");
const adminStatus = document.getElementById("admin-status");
const imageColumn = document.getElementById("image-column");
const videoColumn = document.getElementById("video-column");
const bannerDisplay = document.getElementById("banner-display");
const profileDisplay = document.getElementById("profile-display");

const state = {
  termsAccepted: false,
  ageConfirmed: false,
  contactOpen: false,
  uploadsUnlocked: false,
};

const storage = {
  get(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const imageUploads = storage.get("sloanex_images", []);
const videoUploads = storage.get("sloanex_videos", []);
const bannerUpload = storage.get("sloanex_banner", null);
const profileUpload = storage.get("sloanex_profile", null);

const setPage = (targetId) => {
  if (!state.termsAccepted || !state.ageConfirmed) {
    return;
  }
  if (state.contactOpen) {
    return;
  }
  pages.forEach((page) => page.classList.remove("active"));
  const target = document.getElementById(targetId);
  if (target) {
    target.classList.add("active");
  }
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.target));
});

sideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.target === "contact") {
      openContactModal();
      return;
    }
    setPage(button.dataset.target);
  });
});

signupButton.addEventListener("click", () => {
  signupPop.classList.add("active");
  signupPop.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    signupPop.classList.remove("active");
    signupPop.setAttribute("aria-hidden", "true");
  }, 1600);
});

const updateTermsActionsVisibility = () => {
  const reachedBottom =
    termsScroll.scrollTop + termsScroll.clientHeight >=
    termsScroll.scrollHeight - 2;
  if (reachedBottom) {
    termsActions.classList.remove("hidden");
  }
};

termsScroll.addEventListener("scroll", updateTermsActionsVisibility);

const hideTermsModalIfReady = () => {
  if (state.termsAccepted && state.ageConfirmed) {
    termsModal.classList.add("hidden");
    storage.set("sloanex_terms", true);
    setPage("landing");
  }
};

agreeButton.addEventListener("click", () => {
  state.termsAccepted = true;
  hideTermsModalIfReady();
});

ageButton.addEventListener("click", () => {
  state.ageConfirmed = true;
  hideTermsModalIfReady();
});

const openContactModal = () => {
  state.contactOpen = true;
  contactModal.classList.remove("hidden");
};

const closeContactModal = () => {
  contactModal.classList.add("hidden");
  state.contactOpen = false;
  setPage("home");
};

const getWordCount = (value) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const updateWordCount = () => {
  const words = getWordCount(descriptionField.value);
  if (words > 200) {
    const trimmed = descriptionField.value
      .trim()
      .split(/\s+/)
      .slice(0, 200)
      .join(" ");
    descriptionField.value = trimmed + " ";
  }
  const count = Math.min(getWordCount(descriptionField.value), 200);
  wordCount.textContent = `${count} / 200 words`;
};

descriptionField.addEventListener("input", updateWordCount);

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("contact-email").value;
  const issue = document.getElementById("contact-issue").value;
  const description = descriptionField.value;

  const subject = encodeURIComponent(`SloaneX Support: ${issue}`);
  const body = encodeURIComponent(
    `Email: ${email}\nIssue: ${issue}\nDescription: ${description}`
  );
  window.location.href = `mailto:insanitbjones@gmail.com?subject=${subject}&body=${body}`;
  closeContactModal();
});

const setUploadsLockedState = (locked) => {
  const dropZones = document.querySelectorAll(".drop-zone");
  dropZones.forEach((zone) => {
    zone.classList.toggle("disabled", locked);
  });
  const inputs = document.querySelectorAll(".drop-zone input");
  inputs.forEach((input) => {
    input.disabled = locked;
  });
};

setUploadsLockedState(true);

unlockButton.addEventListener("click", () => {
  if (adminCodeInput.value === "0000") {
    state.uploadsUnlocked = true;
    adminStatus.textContent = "Uploads unlocked.";
    setUploadsLockedState(false);
  } else {
    adminStatus.textContent = "Incorrect code. Uploads remain locked.";
    setUploadsLockedState(true);
  }
});

const renderMediaColumn = (column, items, type) => {
  column.innerHTML = "";
  items.forEach((item) => {
    const element = document.createElement(type === "image" ? "img" : "video");
    element.src = item;
    if (type === "video") {
      element.controls = true;
    }
    column.appendChild(element);
  });
};

const renderBanner = () => {
  if (bannerUpload) {
    bannerDisplay.innerHTML = `<img src="${bannerUpload}" alt="Banner" />`;
  }
};

const renderProfile = () => {
  if (profileUpload) {
    profileDisplay.innerHTML = `<img src="${profileUpload}" alt="Profile" />`;
  }
};

renderMediaColumn(imageColumn, imageUploads, "image");
renderMediaColumn(videoColumn, videoUploads, "video");
renderBanner();
renderProfile();

const handleFiles = (files, type, progressWrapper) => {
  if (!state.uploadsUnlocked) {
    return;
  }
  const progress = progressWrapper.querySelector("progress");
  const progressText = progressWrapper.querySelector(".progress-text");
  let elapsedSeconds = 0;
  progress.value = 0;
  progressText.textContent = "0s · 0%";
  const timer = setInterval(() => {
    elapsedSeconds += 1;
    progressText.textContent = `${elapsedSeconds}s · ${Math.round(
      progress.value
    )}%`;
  }, 1000);

  const fileArray = Array.from(files);
  let processed = 0;

  fileArray.forEach((file) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        progress.value = percent;
      }
    };
    reader.onload = () => {
      processed += 1;
      if (type === "images") {
        imageUploads.push(reader.result);
        storage.set("sloanex_images", imageUploads);
        renderMediaColumn(imageColumn, imageUploads, "image");
      }
      if (type === "videos") {
        videoUploads.push(reader.result);
        storage.set("sloanex_videos", videoUploads);
        renderMediaColumn(videoColumn, videoUploads, "video");
      }
      if (type === "banner") {
        storage.set("sloanex_banner", reader.result);
        bannerDisplay.innerHTML = `<img src="${reader.result}" alt="Banner" />`;
      }
      if (type === "profile") {
        storage.set("sloanex_profile", reader.result);
        profileDisplay.innerHTML = `<img src="${reader.result}" alt="Profile" />`;
      }

      if (processed === fileArray.length) {
        progress.value = 100;
        progressText.textContent = `${elapsedSeconds}s · 100%`;
        clearInterval(timer);
      }
    };
    reader.readAsDataURL(file);
  });
};

const setupDropZone = (zone, type) => {
  const input = zone.querySelector("input");
  const progressWrapper = zone.parentElement.querySelector(".progress-wrapper");

  zone.addEventListener("click", () => {
    if (!state.uploadsUnlocked) {
      return;
    }
    input.click();
  });

  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (!state.uploadsUnlocked) {
      return;
    }
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("dragover");
    if (!state.uploadsUnlocked) {
      return;
    }
    handleFiles(event.dataTransfer.files, type, progressWrapper);
  });

  input.addEventListener("change", () => {
    if (!state.uploadsUnlocked) {
      return;
    }
    handleFiles(input.files, type, progressWrapper);
  });
};

const dropZones = document.querySelectorAll(".drop-zone");
dropZones.forEach((zone) => setupDropZone(zone, zone.dataset.drop));

const initializeTerms = () => {
  const hasAccepted = storage.get("sloanex_terms", false);
  if (hasAccepted) {
    termsModal.classList.add("hidden");
    state.termsAccepted = true;
    state.ageConfirmed = true;
    setPage("landing");
    return;
  }
  termsModal.classList.remove("hidden");
  setPage("landing");
};

initializeTerms();
