const stack = document.getElementById("stack");
const cat = document.querySelector(".cat-rider");
const tabs = [...document.querySelectorAll(".tab")];
const buttons = tabs.filter((t) => t.tagName === "BUTTON");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let active = tabs[0]; // kucing mulai di tab judul

// Taruh kucing di atas tab yang aktif, di sisi kanan tab
function place() {
  const s = stack.getBoundingClientRect();
  const t = active.getBoundingClientRect();
  cat.style.left = t.right - s.left - cat.offsetWidth * 0.9 + "px";
  cat.style.top = t.top - s.top - cat.offsetHeight + 4 + "px";
}

// Posisi tab bergeser saat map membuka atau menutup, jadi kucing ikut dipantau sebentar
function track(ms = 700) {
  const end = performance.now() + ms;
  (function step() {
    place();
    if (performance.now() < end) requestAnimationFrame(step);
  })();
}

function hop() {
  if (reduce) return;
  cat.classList.remove("hop");
  void cat.offsetWidth; // memulai ulang animasi
  cat.classList.add("hop");
}

function toggle(btn) {
  const willOpen = btn.getAttribute("aria-expanded") !== "true";
  buttons.forEach((b) => {
    b.setAttribute("aria-expanded", "false");
    b.closest(".folder").classList.remove("open");
  });
  if (willOpen) {
    btn.setAttribute("aria-expanded", "true");
    btn.closest(".folder").classList.add("open");
    active = btn;
    // geser halaman supaya map yang dibuka naik ke dekat atas layar
    setTimeout(() => btn.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 480);
  } else {
    active = tabs[0]; // semua tertutup: kucing kembali ke judul
  }
  hop();
  track();
}

buttons.forEach((b) => b.addEventListener("click", () => toggle(b)));
addEventListener("resize", place);
addEventListener("load", () => {
  place();
  requestAnimationFrame(() => cat.classList.add("ready")); // animasi geser aktif setelah posisi awal
});
if (document.fonts) document.fonts.ready.then(place);

const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');

function openLightbox(srcList) {
  lightboxContent.innerHTML = '';
  lightboxContent.classList.toggle('multi', srcList.length > 1);

  srcList.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src.trim();
    img.alt = srcList.length > 1 ? `Sertifikat halaman ${i + 1}` : 'Sertifikat';
    lightboxContent.appendChild(img);
  });

  lightbox.hidden = false;
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxContent.innerHTML = '';
}

// Klik link "Lihat sertifikat"
document.addEventListener('click', e => {
  const opener = e.target.closest('.open-lightbox');
  if (opener) {
    e.preventDefault();
    openLightbox(opener.dataset.src.split(','));
  }
});

// Klik latar hitam -> tutup (klik di fotonya tidak menutup)
lightbox.addEventListener('click', e => {
  if (e.target.tagName !== 'IMG') closeLightbox();
});

// Esc -> tutup
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

const bubble = document.getElementById("cat-bubble");
const catSvg = cat.querySelector("svg");
const catLines = [
  { text: "?", angry: false },
  { text: "💢", angry: true },
  { text: "(◣ _ ◢)", angry: true },
  { text: "(ㆆ_ㆆ)", angry: false },
];
let lastLine = -1;
let bubbleTimer;

catSvg.addEventListener("click", () => {
  // pilih kalimat acak, bukan yang sama dengan sebelumnya
  let i;
  do { i = Math.floor(Math.random() * catLines.length); } while (i === lastLine);
  lastLine = i;
  const line = catLines[i];

  bubble.textContent = line.text;
  bubble.classList.add("show");

  cat.classList.remove("angry");
  if (line.angry) {
    void cat.offsetWidth;   // mulai ulang animasi
    cat.classList.add("angry");
  }

  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 1800);
});

// Dibungkus fungsi supaya nama variabelnya tidak bentrok dengan folder.js
(() => {
  /* ---------- Formulir pesan ---------- */
  const form = document.getElementById("pesan-form");
  const wantReply = document.getElementById("mau-balasan");
  const emailWrap = document.getElementById("email-wrap");
  const emailInput = document.getElementById("email-input");
  const status = document.getElementById("form-status");
  // alamat tujuan diambil dari ikon email yang sudah ada di Kontak
  const to = document.querySelector('a[href^="mailto:"]').getAttribute("href").slice(7);

  wantReply.addEventListener("change", () => {
    emailWrap.hidden = !wantReply.checked;       // email muncul hanya kalau ingin dibalas
    emailInput.required = wantReply.checked;
    if (!wantReply.checked) emailInput.value = "";
  });

  form.addEventListener("reset", () => {
    emailWrap.hidden = true;
    emailInput.required = false;
    status.textContent = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = form.nama.value.trim();
    const pesan = form.pesan.value.trim();
    const email = emailInput.value.trim();
    form.pesan.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");

    if (!pesan) {
      form.pesan.setAttribute("aria-invalid", "true");
      status.textContent = "Pesan belum diisi.";
      form.pesan.focus();
      return;
    }
    if (wantReply.checked && (!email || !emailInput.checkValidity())) {
      emailInput.setAttribute("aria-invalid", "true");
      status.textContent = "Isi email yang benar supaya pesanmu bisa dibalas.";
      emailInput.focus();
      return;
    }

    const data = { nama, pesan };
    if (wantReply.checked) data.email = email;
    else data.balasan = "Tidak perlu dibalas";
    status.textContent = "Mengirim...";
    fetch("https://formspree.io/f/xkjoenzd", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data),
    })
    .then((r) => {
      if (!r.ok) throw new Error("gagal");
      form.reset();
      status.textContent = "Terkirim, terima kasih!";
    })
    .catch(() => { status.textContent = "Gagal terkirim. Coba lagi, atau kirim lewat ikon email di atas."; });  
  });

  /* ---------- Frame: tombol "Coba" ---------- */
  const dlg = document.getElementById("frame-dialog");
  const frame = document.getElementById("frame-iframe");
  const frameTitle = document.getElementById("frame-title");

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".try-me");
    if (!btn) return;
    const link = document.getElementById(btn.dataset.from).href;
    // link prototype Figma harus dibungkus alamat embed supaya bisa tampil di iframe
    const src = link.includes("figma.com")
      ? "https://www.figma.com/embed?embed_host=share&url=" + encodeURIComponent(link)
      : link;
    dlg.dataset.size = btn.dataset.size || "wide";
    frameTitle.textContent = btn.dataset.title;
    frame.title = btn.dataset.title;
    frame.src = src;              // frame baru dimuat setelah tombol ditekan
    dlg.showModal();
  });

  // klik area gelap atau tombol Tutup menutup frame (Esc sudah otomatis)
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest(".frame-close")) dlg.close();
  });
  dlg.addEventListener("close", () => { frame.src = "about:blank"; });

  /* ---------- Kucing: reaksi acak + lagu ---------- */
  const MUSIC_CHANCE = 0.34;   // peluang satu klik membuka bubble lagu (0 sampai 1)
  const stackEl = document.getElementById("stack");
  const bgm = document.getElementById("bgm");
  const playBtn = document.getElementById("bgm-play");
  const vol = document.getElementById("bgm-vol");
  const card = document.getElementById("cat-music");
  const listen = document.getElementById("cat-listen");
  const listenPause = document.getElementById("listen-pause");
  const bubble = document.getElementById("cat-bubble");
  const catSvg = document.querySelector(".cat-rider svg");
  const songSrc = bgm.dataset.src;
  let bubbleTimer, listenTimer;

  bgm.volume = Number(vol.value);
  vol.addEventListener("input", () => { bgm.volume = Number(vol.value); });

  // kucing juga bisa dipakai lewat keyboard
  catSvg.setAttribute("role", "button");
  catSvg.setAttribute("tabindex", "0");
  catSvg.setAttribute("aria-label", "Kucing, klik untuk melihat reaksinya");
  catSvg.setAttribute("aria-expanded", "false");
  catSvg.setAttribute("aria-controls", "cat-music");

  function say(text) {
    bubble.textContent = text;
    bubble.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 1800);
  }

  function toggleSong() {
    if (!bgm.getAttribute("src")) bgm.src = songSrc;
    if (bgm.paused) {
      bgm.play().catch(() => { playBtn.textContent = "Lagu tidak bisa diputar"; say("(x_x)"); });
    } else {
      bgm.pause();
    }
  }

  // jaga supaya bubble tidak keluar dari tumpukan map
  function placeCard() {
    card.style.left = "0px";
    const s = stackEl.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    let shift = 0;
    if (r.right > s.right - 8) shift = s.right - 8 - r.right;
    if (r.left + shift < s.left + 8) shift = s.left + 8 - r.left;
    card.style.left = shift + "px";
  }
  function openCard() { card.hidden = false; catSvg.setAttribute("aria-expanded", "true"); placeCard(); }
  function closeCard() { card.hidden = true; catSvg.setAttribute("aria-expanded", "false"); }

  // bubble "lagi dengerin lagu" disembunyikan sebentar saat bubble acak muncul
  function peekListen() {
    if (listen.hidden) return;
    listen.classList.add("away");
    clearTimeout(listenTimer);
    listenTimer = setTimeout(() => listen.classList.remove("away"), 2000);
  }

  if (!songSrc) {
    playBtn.disabled = true;
    playBtn.textContent = "Lagu belum dipilih";
  }
  playBtn.addEventListener("click", toggleSong);
  listenPause.addEventListener("click", (e) => { e.stopPropagation(); bgm.pause(); });

  // Klik kucing = hasil acak. Biasanya salah satu kalimat dari folder.js,
  // kadang bubble pemutar lagu. Belum ada lagu: murni kalimat acak.
  catSvg.addEventListener("click", (e) => {
    if (!songSrc) return;
    if (!card.hidden) { e.stopImmediatePropagation(); closeCard(); return; }
    if (Math.random() < MUSIC_CHANCE) { e.stopImmediatePropagation(); openCard(); return; }
    peekListen();                       // kalimat acak ditampilkan oleh folder.js
  }, true);
  catSvg.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    catSvg.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  // bagian teks bubble "dengerin lagu" juga memicu reaksi acak
  listen.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    catSvg.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  // tutup bubble pemutar: klik di luar, tombol Esc, atau pindah map
  document.addEventListener("click", (e) => {
    if (!card.hidden && !card.contains(e.target) && !catSvg.contains(e.target)) closeCard();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !card.hidden) closeCard(); });
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", closeCard));

  bgm.addEventListener("play", () => {
    playBtn.textContent = "Jeda lagu"; playBtn.setAttribute("aria-pressed", "true");
    listen.hidden = false;              // menetap selama lagu diputar
  });
  bgm.addEventListener("pause", () => {
    playBtn.textContent = "Putar lagu"; playBtn.setAttribute("aria-pressed", "false");
    listen.hidden = true;
    say("zzz...");
  });
})();