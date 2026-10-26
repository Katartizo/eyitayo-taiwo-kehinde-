/*
  A Life in Frames — frontend interactions.
  Supabase is optional during design. Without credentials, the guestbook runs
  in local preview mode only; those wishes are NOT shared with other visitors.
*/
const SUPABASE_URL = ""; // Add your Supabase Project URL
const SUPABASE_ANON_KEY = ""; // Add your Supabase publishable/anon key (never a service-role key)
const birthdayDate = new Date("2026-11-22T00:00:00");

const $ = (selector) => document.querySelector(selector);
const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const db = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

$("#year").textContent = new Date().getFullYear();

function updateCountdown() {
  const now = new Date();
  const diff = birthdayDate.getTime() - now.getTime();
  if (diff <= 0) {
    $(".countdown-card").innerHTML = "<div><span class='countdown-label'>TODAY IS THE DAY</span><strong>Happy Birthday, Eita!</strong></div>";
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  $("#days").textContent = String(days).padStart(2, "0");
  $("#hours").textContent = String(hours).padStart(2, "0");
  $("#minutes").textContent = String(minutes).padStart(2, "0");
  $("#seconds").textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menuToggle.textContent = open ? "✕" : "☰";
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

const messageInput = $("#wishMessage");
messageInput.addEventListener("input", () => {
  $("#charCount").textContent = `${messageInput.value.length} / 700`;
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}
function renderWish(wish, sample = false) {
  const name = escapeHtml(wish.name || "A friend");
  const message = escapeHtml(wish.message || "");
  const relationship = escapeHtml(wish.relationship || "A birthday guest");
  const initial = escapeHtml((wish.name || "A").trim().charAt(0).toUpperCase());
  const article = document.createElement("article");
  article.className = "wish-card";
  article.innerHTML = `<div class="wish-initial">${initial}</div><div><p>${message}</p><div class="wish-by">${name.toUpperCase()} <span>· ${sample ? "PREVIEW" : relationship.toUpperCase()}</span></div></div>`;
  $("#wishesList").prepend(article);
}
function setStatus(message, isError = false) {
  $("#formStatus").textContent = message;
  $("#formStatus").style.color = isError ? "#a03e2e" : "";
}

async function loadApprovedWishes() {
  if (!db) {
    $("#wallDisclaimer").textContent = "Preview mode only: messages submitted here are stored in this browser and are not visible to other visitors. Connect Supabase before launch.";
    $("#wishCount").textContent = "PREVIEW WALL";
    return;
  }
  const { data, error } = await db
    .from("birthday_wishes")
    .select("id, name, relationship, message, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) {
    $("#wallDisclaimer").textContent = "The public wish wall could not load. Please try again later.";
    console.error("Could not load approved wishes:", error.message);
    return;
  }
  $("#wishesList").innerHTML = "";
  data.forEach(wish => renderWish(wish));
  $("#wishCount").textContent = `${data.length} APPROVED WISH${data.length === 1 ? "" : "ES"}`;
  $("#wallDisclaimer").textContent = "Only approved wishes appear here. Thank you for helping keep this a kind and welcoming space.";
}

$("#wishForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
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
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  try {
    if (db) {
      const { error } = await db.from("birthday_wishes").insert([{
        name: wish.name,
        relationship: wish.relationship || null,
        message: wish.message,
        approved: false
      }]);
      if (error) throw error;
      setStatus("Thank you! Your wish has been received and is waiting for approval.");
      showToast("Your birthday wish was submitted for review.");
    } else {
      const localWishes = JSON.parse(localStorage.getItem("lifeInFramesPreviewWishes") || "[]");
      localWishes.unshift({ ...wish, submittedAt: new Date().toISOString() });
      localStorage.setItem("lifeInFramesPreviewWishes", JSON.stringify(localWishes.slice(0, 20)));
      renderWish(wish, true);
      $("#wishCount").textContent = "PREVIEW WALL";
      setStatus("Preview only: saved in this browser, not shared publicly. Connect Supabase for real submissions.");
      showToast("Preview wish added on this device only.");
    }
    event.currentTarget.reset();
    $("#charCount").textContent = "0 / 700";
  } catch (error) {
    console.error("Wish submission failed:", error.message);
    setStatus("Sorry, your wish could not be submitted. Please try again.", true);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send birthday wish <span>↗</span>';
  }
});

loadApprovedWishes();
