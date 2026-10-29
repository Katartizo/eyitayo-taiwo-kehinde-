

/* =====================================
   A LIFE IN FRAMES: CHILDHOOD GALLERY
   Original filenames; guestbook untouched
   ===================================== */

(() => {
  // Add every real filename here, in chronological order.
  // Paths are relative to index.html.
  const childhoodPhotos = [
    "IMG_20191020_145025_0.jpg",
    "IMG_20191020_154223_1.jpg",
    "IMG_20191020_155048_2.jpg",
    "IMG_20191020_144812_0.jpg",
    "IMG_20191020_144552_4.jpg",
    "IMG_20191020_144735_1.jpg",
    "IMG_20191020_145129_8.jpg",
    "IMG-20250106-WA0059.jpg",
    "IMG_20191020_144902_7.jpg",
    "IMG_20220506_140900_325.jpg",
    "IMG-20250106-WA0064.jpg",
    "MG-20250106-WA0260.jpg",
    "MG-20250106-WA0309.jpg",
    "IMG-20250106-WA0337.jpg",
    "IMG-20250106-WA0381.jpg",
    "IMG_20261029_043955.jpg",
    "IMG_20261029_044032.jpg",
    "IMG_20261029_043218.jpg",
    "IMG_20191020_154831_9.jpg",
    "FB_IMG_15818570030961286.jpg",
    "FB_IMG_16371526437310027.jpg",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "0e55897c0ba94d1d807c4bed6bc832e6.jpg",
    "IMG_20200315_115918_4.jpg"
  ];

  const folder = "images/childhood/";
  const viewport = document.getElementById("childhoodViewport");
  const track = document.getElementById("childhoodTrack");
  const previous = document.getElementById("childhoodPrev");
  const next = document.getElementById("childhoodNext");
  const lightbox = document.getElementById("childhoodLightbox");
  const lightboxImage = document.getElementById("childhoodLightboxImage");
  const lightboxCaption = document.getElementById("childhoodLightboxCaption");
  const closeLightbox = document.getElementById("childhoodLightboxClose");

  if (!viewport || !track || !previous || !next ||
      !lightbox || !lightboxImage || !lightboxCaption ||
      !closeLightbox) {
    console.warn("Childhood gallery HTML elements are missing.");
    return;
  }

  let dragging = false;
  let dragMoved = false;
  let startX = 0;
  let startScroll = 0;
  let paused = false;
  let lastTime = 0;

  childhoodPhotos.forEach((filename, index) => {
    const figure = document.createElement("figure");
    figure.className = "childhood-card";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "childhood-photo-button";
    button.setAttribute("aria-label", `Enlarge childhood photo ${index + 1}`);

    const image = document.createElement("img");
    image.src = folder + filename;
    image.alt = `Childhood memory ${index + 1}`;
    image.loading = index < 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;

    image.addEventListener("error", () => {
      console.error("Could not load childhood photo:", image.src);
      figure.hidden = true;
      updateArrows();
    });

    const caption = document.createElement("figcaption");
    const label = document.createElement("span");
    const title = document.createElement("b");

    label.textContent = `MEMORY ${String(index + 1).padStart(2, "0")}`;
    title.textContent = "A moment in our story";

    caption.append(label, title);
    button.appendChild(image);
    figure.append(button, caption);
    track.appendChild(figure);

    button.addEventListener("click", () => {
      if (dragMoved) {
        dragMoved = false;
        return;
      }

      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = title.textContent;

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      }
    });
  });

  closeLightbox.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) lightbox.close();
  });

  function getStep() {
    const card = track.querySelector(".childhood-card:not([hidden])");
    return card ? card.getBoundingClientRect().width + 18 : 240;
  }

  function updateArrows() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    previous.disabled = viewport.scrollLeft <= 2;
    next.disabled = viewport.scrollLeft >= maxScroll - 2;
  }

  previous.addEventListener("click", () => {
    viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    viewport.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  viewport.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);

  // Mouse drag support; mobile finger swiping uses native scrolling.
  viewport.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    dragging = true;
    dragMoved = false;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", event => {
    if (!dragging) return;

    const distance = event.clientX - startX;
    if (Math.abs(distance) > 5) dragMoved = true;
    if (dragMoved) viewport.scrollLeft = startScroll - distance;
  });

  function stopDragging() {
    dragging = false;
    viewport.classList.remove("is-dragging");
  }

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.addEventListener("lostpointercapture", stopDragging);

  // Slow automatic scrolling; pauses while visitors interact.
  function animate(time) {
    requestAnimationFrame(animate);

    if (!lastTime) lastTime = time;
    const elapsed = Math.min(time - lastTime, 40);
    lastTime = time;

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (paused || dragging || lightbox.open || reducedMotion ||
        maxScroll <= 0) return;

    if (viewport.scrollLeft >= maxScroll - 1) {
      viewport.scrollLeft = 0;
    } else {
      viewport.scrollLeft += elapsed * 0.025;
    }
  }

  viewport.addEventListener("mouseenter", () => paused = true);
  viewport.addEventListener("mouseleave", () => paused = false);
  viewport.addEventListener("focusin", () => paused = true);
  viewport.addEventListener("focusout", () => paused = false);
  viewport.addEventListener("touchstart", () => paused = true, { passive: true });
  viewport.addEventListener("touchend", () => paused = false, { passive: true });
  viewport.addEventListener("touchcancel", () => paused = false, { passive: true });

  document.addEventListener("visibilitychange", () => {
    lastTime = 0;
  });

  updateArrows();
  requestAnimationFrame(animate);
})();




const SUPABASE_URL =
  "https://mgosavprtrwwcbgaenul.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_T3VuGPrsqfbJ6rNdjtAp5A_H6cjQHzJ";

const birthdayDate = new Date("2026-11-22T00:00:00");
const PAGE_SIZE = 30;

const $ = (selector) => document.querySelector(selector);

const supabaseReady = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  window.supabase &&
  typeof window.supabase.createClient === "function"
);

const db = supabaseReady
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  : null;

if ($("#year")) {
  $("#year").textContent = new Date().getFullYear();
}

// --------------------------------------------------
// STATE
// --------------------------------------------------

let totalWishes = 0;
let wishesOffset = 0;
let loadingWishes = false;
let moreWishesAvailable = false;
let realtimeChannel = null;
let loadMoreButton = null;

// --------------------------------------------------
// COUNTDOWN
// --------------------------------------------------

function updateCountdown() {
  const now = new Date();
  const diff = birthdayDate.getTime() - now.getTime();

  if (diff <= 0) {
    const card = $(".countdown-card");

    if (card) {
      card.innerHTML =
        "<div><span class='countdown-label'>" +
        "TODAY IS THE DAY</span>" +
        "<strong>Happy Birthday, Eita!</strong></div>";
    }

    return;
  }

  const days = $("#days");
  const hours = $("#hours");
  const minutes = $("#minutes");
  const seconds = $("#seconds");

  if (days) {
    days.textContent = String(
      Math.floor(diff / 86400000)
    ).padStart(2, "0");
  }

  if (hours) {
    hours.textContent = String(
      Math.floor((diff % 86400000) / 3600000)
    ).padStart(2, "0");
  }

  if (minutes) {
    minutes.textContent = String(
      Math.floor((diff % 3600000) / 60000)
    ).padStart(2, "0");
  }

  if (seconds) {
    seconds.textContent = String(
      Math.floor((diff % 60000) / 1000)
    ).padStart(2, "0");
  }
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

// --------------------------------------------------
// MOBILE NAVIGATION
// --------------------------------------------------

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );
    menuToggle.textContent = open ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.textContent = "☰";
    });
  });
}

// --------------------------------------------------
// MESSAGE CHARACTER COUNTER
// --------------------------------------------------

const messageInput = $("#wishMessage");

if (messageInput) {
  messageInput.addEventListener("input", () => {
    const counter = $("#charCount");

    if (counter) {
      counter.textContent =
        `${messageInput.value.length} / 700`;
    }
  });
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function setStatus(message, isError = false) {
  const status = $("#formStatus");
  if (!status) return;

  status.textContent = message;
  status.style.color = isError ? "#a03e2e" : "";
}

function updateWishCount() {
  const countElement = $("#wishCount");
  if (!countElement) return;

  countElement.textContent =
    `${totalWishes} BIRTHDAY WISH` +
    `${totalWishes === 1 ? "" : "ES"}`;
}

// --------------------------------------------------
// RENDER WISH
// Returns false if this wish is already displayed.
// --------------------------------------------------

function renderWish(wish, append = false) {
  const list = $("#wishesList");
  if (!list || !wish) return false;

  if (
    wish.id != null &&
    Array.from(list.children).some(
      (card) =>
        card.dataset.wishId === String(wish.id)
    )
  ) {
    return false;
  }

  const name = escapeHtml(wish.name || "A friend");
  const message = escapeHtml(wish.message || "");
  const relationship = escapeHtml(
    wish.relationship || "A birthday guest"
  );

  const initial = escapeHtml(
    (wish.name || "A").trim().charAt(0).toUpperCase()
  );

  const article = document.createElement("article");
  article.className = "wish-card";

  if (wish.id != null) {
    article.dataset.wishId = String(wish.id);
  }

  article.innerHTML = `
    <div class="wish-initial">${initial}</div>
    <div>
      <p>${message}</p>
      <div class="wish-by">
        ${name.toUpperCase()}
        <span> · ${relationship.toUpperCase()}</span>
      </div>
    </div>
  `;

  if (append) {
    list.appendChild(article);
  } else {
    list.prepend(article);
  }

  return true;
}

// --------------------------------------------------
// LOAD MORE BUTTON
// --------------------------------------------------

function createLoadMoreButton() {
  if (loadMoreButton) return;

  loadMoreButton = document.createElement("button");
  loadMoreButton.type = "button";
  loadMoreButton.className = "load-more-wishes";
  loadMoreButton.textContent = "Load more wishes";

  loadMoreButton.style.cssText =
    "display:block;margin:24px auto;padding:14px 24px;" +
    "border:1px solid #c9b77f;background:transparent;" +
    "color:inherit;cursor:pointer;font:inherit;";

  loadMoreButton.addEventListener("click", () => {
    loadBirthdayWishes(false);
  });

  const list = $("#wishesList");

  if (list) {
    list.insertAdjacentElement("afterend", loadMoreButton);
  }
}

function updateLoadMoreButton() {
  if (!loadMoreButton) return;

  loadMoreButton.hidden = !moreWishesAvailable;
  loadMoreButton.disabled = loadingWishes;

  loadMoreButton.textContent = loadingWishes
    ? "Loading wishes…"
    : "Load more wishes";
}

// --------------------------------------------------
// COUNT SAVED WISHES
// --------------------------------------------------

async function refreshTotalCount() {
  if (!db) return;

  const { count, error } = await db
    .from("birthday_wishes")
    .select("id", {
      count: "exact",
      head: true
    });

  if (error) {
    console.error("Could not count wishes:", error.message);
    return;
  }

  totalWishes = count ?? 0;
  updateWishCount();
}

// --------------------------------------------------
// LOAD WISHES FROM SUPABASE
// All publicly readable wishes are shown.
// No approved filter is used.
// --------------------------------------------------

async function loadBirthdayWishes(reset = false) {
  if (!db || loadingWishes) return;

  const list = $("#wishesList");
  if (!list) return;

  loadingWishes = true;

  if (reset) {
    wishesOffset = 0;
    moreWishesAvailable = false;
    list.innerHTML = "";
  }

  updateLoadMoreButton();

  try {
    const from = wishesOffset;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await db
      .from("birthday_wishes")
      .select(
        "id, name, relationship, message, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const wishes = data || [];

    wishes.forEach((wish) => {
      // Newest wishes first on the first page.
      // Older wishes are appended on subsequent pages.
      renderWish(wish, !reset);
    });

    wishesOffset += wishes.length;
    totalWishes = count ?? wishesOffset;

    moreWishesAvailable =
      wishesOffset < totalWishes;

    updateWishCount();

    const disclaimer = $("#wallDisclaimer");

    if (disclaimer) {
      disclaimer.textContent =
        "Birthday wishes appear automatically after submission. " +
        "Thank you for being part of this story!";
    }
  } catch (error) {
    console.error("Could not load birthday wishes:", error);

    const disclaimer = $("#wallDisclaimer");

    if (disclaimer) {
      disclaimer.textContent =
        "The wish wall could not load. Please try again.";
    }

    showToast("Could not load wishes. Please try again.");
  } finally {
    loadingWishes = false;
    updateLoadMoreButton();
  }
}

// --------------------------------------------------
// REALTIME UPDATES
// Enable birthday_wishes in Supabase Realtime first.
// --------------------------------------------------

function startRealtimeUpdates() {
  if (!db) return;

  realtimeChannel = db
    .channel("public-birthday-wishes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "birthday_wishes"
      },
      async (payload) => {
        const inserted = payload.new;

        // A new wish goes to the top.
        // renderWish prevents duplicate display.
        renderWish(inserted, false);

        // Read the database count instead of incrementing
        // it, preventing double counting.
        await refreshTotalCount();

        // Keep pagination available when new wishes arrive.
        if (wishesOffset < totalWishes) {
          moreWishesAvailable = true;
        }

        updateLoadMoreButton();
      }
    )
    .subscribe((status) => {
      console.log("Birthday wish live updates:", status);
    });
}

// --------------------------------------------------
// SUBMIT A BIRTHDAY WISH
// --------------------------------------------------

const wishForm = $("#wishForm");

if (wishForm) {
  wishForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const wish = {
      name: String(form.get("name") || "").trim(),
      relationship: String(
        form.get("relationship") || ""
      ).trim(),
      message: String(form.get("message") || "").trim()
    };

    if (!wish.name || !wish.message) {
      setStatus("Please add your name and a message.", true);
      return;
    }

    if (
      wish.name.length > 60 ||
      wish.message.length > 700
    ) {
      setStatus(
        "Please shorten your name or message.",
        true
      );
      return;
    }

    if (!db) {
      setStatus(
        "The guestbook is not connected. Please try again later.",
        true
      );
      return;
    }

    const submitButton = formElement.querySelector(
      'button[type="submit"]'
    );

    if (!submitButton) return;

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    setStatus("");

    try {
      const { data, error } = await db
        .from("birthday_wishes")
        .insert([{
          name: wish.name,
          relationship: wish.relationship || null,
          message: wish.message,

          // Automatically publish the wish.
          // No manual approval is required.
          approved: true
        }])
        .select(
          "id, name, relationship, message, created_at"
        )
        .single();

      if (error) throw error;

      // Display immediately without waiting for Realtime.
      renderWish(data, false);

      formElement.reset();

      if ($("#charCount")) {
        $("#charCount").textContent = "0 / 700";
      }

      setStatus("Your message has been delivered!");
      showToast("Your message has been delivered!");

      // Refresh the exact database count.
      await refreshTotalCount();

      if (wishesOffset < totalWishes) {
        moreWishesAvailable = true;
      }

      updateLoadMoreButton();
    } catch (error) {
      console.error("Wish submission failed:", error);

      setStatus(
        "Sorry, your wish could not be submitted. Please try again.",
        true
      );

      showToast(
        "Your wish could not be sent. Please try again."
      );
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Send birthday wish <span>↗</span>';
    }
  });
}

// --------------------------------------------------
// INITIALISE
// --------------------------------------------------

async function initialiseWishWall() {
  createLoadMoreButton();

  if (!db) {
    if ($("#wallDisclaimer")) {
      $("#wallDisclaimer").textContent =
        "The public guestbook is not connected. Please try again later.";
    }

    if ($("#wishCount")) {
      $("#wishCount").textContent = "GUESTBOOK OFFLINE";
    }

    setStatus("Guestbook connection unavailable.", true);
    return;
  }

  await loadBirthdayWishes(true);

  // Start live updates after the initial database load.
  startRealtimeUpdates();
}

initialiseWishWall();



/* =====================================
   A LIFE IN FRAMES: CHILDHOOD GALLERY
   Independent from the birthday guestbook
   ===================================== */
(() => {
  const PHOTO_COUNT = 45;

  const viewport = document.getElementById("childhoodViewport");
  const track = document.getElementById("childhoodTrack");
  const previous = document.getElementById("childhoodPrev");
  const next = document.getElementById("childhoodNext");
  const lightbox = document.getElementById("childhoodLightbox");
  const lightboxImage = document.getElementById("childhoodLightboxImage");
  const lightboxCaption = document.getElementById("childhoodLightboxCaption");
  const closeLightbox = document.getElementById("childhoodLightboxClose");

  if (!viewport || !track || !previous || !next ||
      !lightbox || !lightboxImage || !lightboxCaption ||
      !closeLightbox) return;

  const memories = Array.from({ length: PHOTO_COUNT }, (_, index) => {
    const number = index + 1;
    return {
      src: `images/childhood/childhood-${String(number).padStart(3, "0")}.jpg`,
      title: `Memory ${number}`,
      caption: "A precious moment in our story"
    };
  });

  memories.forEach((memory, index) => {
    const card = document.createElement("figure");
    card.className = "childhood-card";

    const photoButton = document.createElement("button");
    photoButton.type = "button";
    photoButton.className = "childhood-photo-button";
    photoButton.setAttribute("aria-label", `Enlarge ${memory.title}`);

    const image = document.createElement("img");
    image.src = memory.src;
    image.alt = memory.title;
    image.loading = index < 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;

    image.addEventListener("error", () => {
      card.hidden = true;
      updateArrows();
    });

    const caption = document.createElement("figcaption");
    const heading = document.createElement("h3");
    const description = document.createElement("p");

    heading.textContent = memory.title;
    description.textContent = memory.caption;

    photoButton.appendChild(image);
    caption.append(heading, description);
    card.append(photoButton, caption);
    track.appendChild(card);

    photoButton.addEventListener("click", () => {
      if (dragMoved) {
        dragMoved = false;
        return;
      }

      lightboxImage.src = memory.src;
      lightboxImage.alt = memory.title;
      lightboxCaption.textContent =
        `${memory.title} — ${memory.caption}`;

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      }
    });
  });

  closeLightbox.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) lightbox.close();
  });

  function cardStep() {
    const card = track.querySelector(".childhood-card:not([hidden])");
    return card ? card.getBoundingClientRect().width + 18 : 240;
  }

  function updateArrows() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    previous.disabled = viewport.scrollLeft <= 2;
    next.disabled = viewport.scrollLeft >= maxScroll - 2;
  }

  previous.addEventListener("click", () => {
    viewport.scrollBy({ left: -cardStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    viewport.scrollBy({ left: cardStep(), behavior: "smooth" });
  });

  viewport.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);

  // Mouse dragging for desktop; touch swiping remains native.
  let dragging = false;
  let dragMoved = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    dragging = true;
    dragMoved = false;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", event => {
    if (!dragging) return;

    const distance = event.clientX - startX;

    if (Math.abs(distance) > 5) dragMoved = true;
    if (dragMoved) viewport.scrollLeft = startScroll - distance;
  });

  function stopDragging() {
    dragging = false;
    viewport.classList.remove("is-dragging");
  }

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.addEventListener("lostpointercapture", stopDragging);

  // Pause auto-scroll when visitors interact with the gallery.
  let paused = false;
  let lastTime = 0;

  function animate(time) {
    requestAnimationFrame(animate);

    if (!lastTime) lastTime = time;
    const elapsed = Math.min(time - lastTime, 40);
    lastTime = time;

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (paused || dragging || lightbox.open || reducedMotion ||
        maxScroll <= 0) return;

    if (viewport.scrollLeft >= maxScroll - 1) {
      viewport.scrollLeft = 0;
    } else {
      viewport.scrollLeft += elapsed * 0.025;
    }
  }

  viewport.addEventListener("mouseenter", () => paused = true);
  viewport.addEventListener("mouseleave", () => paused = false);
  viewport.addEventListener("focusin", () => paused = true);
  viewport.addEventListener("focusout", () => paused = false);
  viewport.addEventListener("touchstart", () => paused = true, { passive: true });
  viewport.addEventListener("touchend", () => paused = false, { passive: true });
  viewport.addEventListener("touchcancel", () => paused = false, { passive: true });

  document.addEventListener("visibilitychange", () => {
    lastTime = 0;
  });

  updateArrows();
  requestAnimationFrame(animate);
})();



/* CHILDHOOD PHOTO GALLERY */
const childhoodPhotos = [
  "IMG_20191020_155048_2.jpg",
  "IMG_20191020_154223_1.jpg",
  "IMG_20200315_115918_4.jpg",
];
