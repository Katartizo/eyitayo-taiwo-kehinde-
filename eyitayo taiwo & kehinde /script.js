
/*
  A Life in Frames — birthday guestbook
  Automatic publishing, public wish wall, pagination and realtime updates.
*/

const SUPABASE_URL = "https://mgosavprtrwwcbgaenul.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_T3VuGPrsqfbJ6rNdjtAp5A_H6cjQHzJ";

const birthdayDate = new Date("2026-11-22T00:00:00");
const PAGE_SIZE = 50;

const $ = (selector) => document.querySelector(selector);

const supabaseReady = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  window.supabase
);

const db = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

$("#year").textContent = new Date().getFullYear();

let loadedCount = 0;
let totalWishes = 0;
let loadingWishes = false;
let moreWishesAvailable = false;
let realtimeChannel = null;

// --------------------------------------------------
// COUNTDOWN
// --------------------------------------------------

function updateCountdown() {
  const now = new Date();
  const diff = birthdayDate.getTime() - now.getTime();

  if (diff <= 0) {
    $(".countdown-card").innerHTML =
      "<div><span class='countdown-label'>TODAY IS THE DAY</span>" +
      "<strong>Happy Birthday, Eita!</strong></div>";
    return;
  }

  $("#days").textContent = String(
    Math.floor(diff / 86400000)
  ).padStart(2, "0");

  $("#hours").textContent = String(
    Math.floor((diff % 86400000) / 3600000)
  ).padStart(2, "0");

  $("#minutes").textContent = String(
    Math.floor((diff % 3600000) / 60000)
  ).padStart(2, "0");

  $("#seconds").textContent = String(
    Math.floor((diff % 60000) / 1000)
  ).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// --------------------------------------------------
// MOBILE NAVIGATION
// --------------------------------------------------

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

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
    menuToggle.textContent = "☰";
  });
});

// --------------------------------------------------
// MESSAGE CHARACTER COUNTER
// --------------------------------------------------

const messageInput = $("#wishMessage");

messageInput.addEventListener("input", () => {
  $("#charCount").textContent =
    `${messageInput.value.length} / 700`;
});

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
  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function setStatus(message, isError = false) {
  $("#formStatus").textContent = message;
  $("#formStatus").style.color = isError ? "#a03e2e" : "";
}

function updateWishCount() {
  $("#wishCount").textContent =
    `${totalWishes} BIRTHDAY WISH${totalWishes === 1 ? "" : "ES"}`;
}


function renderWish(wish, sample = false, append = false) {
  const name = escapeHtml(wish.name || "A friend");
  const message = escapeHtml(wish.message || "");
  const relationship = escapeHtml(
    wish.relationship || "A birthday guest"
  );
  const initial = escapeHtml(
    (wish.name || "A").trim().charAt(0).toUpperCase()
  );

  const list = $("#wishesList");

  // Avoid showing the same database wish twice.
  if (
    wish.id &&
    Array.from(list.children).some(
      card => card.dataset.wishId === String(wish.id)
    )
  ) {
    return;
  }

  const article = document.createElement("article");
  article.className = "wish-card";

  if (wish.id) {
    article.dataset.wishId = String(wish.id);
  }

  article.innerHTML = `
    <div class="wish-initial">${initial}</div>
    <div>
      <p>${message}</p>
      <div class="wish-by">
        ${name.toUpperCase()}
        <span> · ${
          sample ? "PREVIEW" : relationship.toUpperCase()
        }</span>
      </div>
    </div>
  `;

  if (append) {
    list.append(article);
  } else {
    list.prepend(article);
  }
}

// --------------------------------------------------
// LOAD MORE BUTTON
// --------------------------------------------------

let loadMoreButton = null;

function createLoadMoreButton() {
  if (loadMoreButton) return;

  loadMoreButton = document.createElement("button");
  loadMoreButton.type = "button";
  loadMoreButton.textContent = "Load more wishes";
  loadMoreButton.className = "load-more-wishes";
  loadMoreButton.style.cssText =
    "display:block;margin:24px auto;padding:14px 24px;" +
    "border:1px solid #c9b77f;background:transparent;" +
    "color:inherit;cursor:pointer;font:inherit;";

  loadMoreButton.addEventListener("click", loadMoreWishes);

  $("#wishesList").insertAdjacentElement(
    "afterend",
    loadMoreButton
  );
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
// LOAD WISHES FROM SUPABASE
// --------------------------------------------------

async function refreshTotalCount() {
  const { count, error } = await db
    .from("birthday_wishes")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Could not count wishes:", error.message);
    return;
  }

  totalWishes = count ?? 0;
  updateWishCount();
}

async function loadBirthdayWishes(reset = false) {
  if (!db || loadingWishes) return;

  loadingWishes = true;
  updateLoadMoreButton();

  try {
    if (reset) {
      loadedCount = 0;
      moreWishesAvailable = false;
      $("#wishesList").innerHTML = "";
    }

    const from = loadedCount;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await db
      .from("birthday_wishes")
      .select("id, name, relationship, message, created_at")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    data.forEach((wish) => renderWish(wish, false, false));

    loadedCount += data.length;
    moreWishesAvailable = data.length === PAGE_SIZE;

    $("#wallDisclaimer").textContent =
      "Birthday wishes appear automatically after submission. " +
      "Thank you for being part of this story!";

    await refreshTotalCount();
  } catch (error) {
    console.error("Could not load birthday wishes:", error.message);

    $("#wallDisclaimer").textContent =
      "The wish wall could not load. Please refresh and try again.";
  } finally {
    loadingWishes = false;
    updateLoadMoreButton();
  }
}

async function loadMoreWishes() {
  await loadBirthdayWishes(false);
}

// --------------------------------------------------
// LIVE UPDATES FOR ALL VISITORS
// Requires birthday_wishes to be enabled in the
// Supabase Realtime publication.
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
      (payload) => {
        const wish = payload.new;

        // New messages appear at the top without a refresh.
        renderWish(wish, false, true);

        totalWishes += 1;
        updateWishCount();
      }
    )
    .subscribe((status) => {
      console.log("Birthday wish live updates:", status);
    });
}

// --------------------------------------------------
// SUBMIT A BIRTHDAY WISH
// --------------------------------------------------

$("#wishForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formElement = event.currentTarget;
  const form = new FormData(formElement);

  const wish = {
    name: String(form.get("name") || "").trim(),
    relationship: String(form.get("relationship") || "").trim(),
    message: String(form.get("message") || "").trim()
  };

  if (!wish.name || !wish.message) {
    setStatus("Please add your name and a message.", true);
    return;
  }

  if (wish.name.length > 60 || wish.message.length > 700) {
    setStatus("Please shorten your name or message.", true);
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
        approved: true
      }])
      .select("id, name, relationship, message, created_at")
      .single();

    if (error) throw error;

    // Display the returned saved wish immediately.
    renderWish(data, false, true);

    // Realtime may also report this same wish; duplicate IDs
    // are ignored by renderWish().
    totalWishes += 1;
    updateWishCount();

    formElement.reset();
    $("#charCount").textContent = "0 / 700";

    setStatus("Your message has been delivered!");
    showToast("Your message has been delivered!");

    // Keep the public count accurate.
    refreshTotalCount();
  } catch (error) {
    console.error("Wish submission failed:", error);

    setStatus(
      "Sorry, your wish could not be submitted. Please try again.",
      true
    );

    showToast("Your wish could not be sent. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML =
      'Send birthday wish <span>↗</span>';
  }
});

// --------------------------------------------------
// INITIALISE THE WISH WALL
// --------------------------------------------------

async function initialiseWishWall() {
  createLoadMoreButton();

  if (!db) {
    $("#wallDisclaimer").textContent =
      "The public guestbook is not connected yet. Please try again later.";

    $("#wishCount").textContent = "GUESTBOOK OFFLINE";
    setStatus("Guestbook connection unavailable.", true);
    return;
  }

  await loadBirthdayWishes(true);
  startRealtimeUpdates();
}

initialiseWishWall();
