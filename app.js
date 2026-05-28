// Дизайн оклейки авто — vanilla landing logic
// Lightbox gallery, Telegram lead form, tier prefill.

(function () {
  "use strict";

  /* ─── Portfolio data — 28 works ─── */
  var GALLERY = [
    { src: "assets/portfolio/full/01.webp", label: "BMW Z4 — рекламная оклейка" },
    { src: "assets/portfolio/full/02.webp", label: "Lexus LX570 — имиджевая концепция" },
    { src: "assets/portfolio/full/13.webp", label: "Toyota Probox — оклейка Japanhouse, общий план" },
    { src: "assets/portfolio/full/03.webp", label: "Toyota Hiace — корпоративный фургон" },
    { src: "assets/portfolio/full/04.webp", label: "Toyota Probox — расширенный дизайн" },
    { src: "assets/portfolio/full/08.webp", label: "Lexus LX570 — фасадный план" },
    { src: "assets/portfolio/full/20.webp", label: "Probox — деталь оклейки Japanhouse" },
    { src: "assets/portfolio/full/05.webp", label: "Toyota Probox — оклейка Japanhouse" },
    { src: "assets/portfolio/full/06.webp", label: "Probox — рекламная оклейка" },
    { src: "assets/portfolio/full/22.webp", label: "Probox — общий вид сзади" },
    { src: "assets/portfolio/full/07.webp", label: "Probox — корпоративный транспорт" },
    { src: "assets/portfolio/full/09.webp", label: "Probox — фрагмент кузова" },
    { src: "assets/portfolio/full/10.webp", label: "Probox — боковая проекция" },
    { src: "assets/portfolio/full/11.webp", label: "Probox — деталь оклейки" },
    { src: "assets/portfolio/full/12.webp", label: "Probox — рекламный фрагмент" },
    { src: "assets/portfolio/full/14.webp", label: "Probox — крупный план задней стороны" },
    { src: "assets/portfolio/full/15.webp", label: "Probox — крупный план передней стороны" },
    { src: "assets/portfolio/full/16.webp", label: "Probox — деталь композиции" },
    { src: "assets/portfolio/full/17.webp", label: "Probox — фрагмент имиджевого макета" },
    { src: "assets/portfolio/full/18.webp", label: "Probox — переход графики на двери" },
    { src: "assets/portfolio/full/19.webp", label: "Probox — боковая часть с типографикой" },
    { src: "assets/portfolio/full/21.webp", label: "Probox — задние двери" },
    { src: "assets/portfolio/full/23.webp", label: "Probox — крупный план графики" },
    { src: "assets/portfolio/full/24.webp", label: "Probox — деталь имиджевого макета" },
    { src: "assets/portfolio/full/25.webp", label: "Probox — крупный план кузова" },
    { src: "assets/portfolio/full/26.webp", label: "Probox — переход графики на боку" },
    { src: "assets/portfolio/full/27.webp", label: "Probox — фрагмент оклейки" },
    { src: "assets/portfolio/full/28.webp", label: "Probox — крупный план кузова, сторона" }
  ];

  /* ─── Lightbox ─── */
  var lb = document.getElementById("lightbox");
  var lbImage = document.getElementById("lb-image");
  var lbLabel = document.getElementById("lb-label");
  var lbCounter = document.getElementById("lb-counter");
  var lbThumbs = document.getElementById("lb-thumbs");
  var current = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  // Превращает путь "assets/portfolio/full/01.webp" в "assets/portfolio/thumb/01.webp"
  function toThumb(src) { return src.replace("/full/", "/thumb/"); }

  function buildThumbs() {
    var frag = document.createDocumentFragment();
    GALLERY.forEach(function (it, i) {
      var btn = document.createElement("button");
      btn.className = "lightbox-thumb";
      btn.setAttribute("aria-label", "Открыть работу " + (i + 1));
      var img = document.createElement("img");
      img.src = toThumb(it.src);
      img.alt = "";
      img.loading = "lazy";
      btn.appendChild(img);
      btn.addEventListener("click", function (e) { e.stopPropagation(); open(i); });
      frag.appendChild(btn);
    });
    lbThumbs.appendChild(frag);
  }

  function preloadNeighbors(i) {
    var n = GALLERY.length;
    [(i + 1) % n, (i - 1 + n) % n].forEach(function (j) {
      var im = new Image();
      im.src = GALLERY[j].src;
    });
  }

  function render() {
    var it = GALLERY[current];
    lbImage.src = it.src;
    lbImage.alt = it.label;
    lbLabel.textContent = it.label;
    lbCounter.textContent = pad(current + 1) + " / " + pad(GALLERY.length);
    var thumbs = lbThumbs.children;
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].classList.toggle("is-active", i === current);
    }
    var active = thumbs[current];
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: "nearest", inline: "center" });
    }
    preloadNeighbors(current);
  }

  function open(i) {
    current = i;
    lb.classList.add("is-open");
    document.body.classList.add("lightbox-locked");
    render();
  }

  function close() {
    current = null;
    lb.classList.remove("is-open");
    document.body.classList.remove("lightbox-locked");
  }

  function nav(delta) {
    if (current === null) return;
    var n = GALLERY.length;
    current = (current + delta + n) % n;
    render();
  }

  buildThumbs();

  Array.prototype.forEach.call(document.querySelectorAll(".gallery-item"), function (el) {
    el.addEventListener("click", function () { open(parseInt(el.dataset.index, 10)); });
  });
  document.getElementById("gallery-all").addEventListener("click", function () { open(0); });
  document.getElementById("lb-close").addEventListener("click", close);
  document.getElementById("lb-prev").addEventListener("click", function () { nav(-1); });
  document.getElementById("lb-next").addEventListener("click", function () { nav(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (current === null) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") nav(-1);
    else if (e.key === "ArrowRight") nav(1);
  });

  /* ─── Telegram deep link ─── */
  function buildTelegramURL(d) {
    var lines = ["Здравствуйте! Хочу обсудить дизайн оклейки авто.", ""];
    if (d.name) lines.push("Имя: " + d.name);
    if (d.car) lines.push("Авто: " + d.car);
    if (d.message) lines.push("\nЗадача:\n" + d.message);
    return "https://t.me/nikolaikovtun?text=" + encodeURIComponent(lines.join("\n"));
  }

  /* ─── Lead form ─── */
  var form = document.getElementById("lead-form");
  var fName = document.getElementById("f-name");
  var fCar = document.getElementById("f-car");
  var fMessage = document.getElementById("f-message");
  var errName = document.getElementById("err-name");
  var errCar = document.getElementById("err-car");
  var fields = document.getElementById("form-fields");
  var success = document.getElementById("form-success");
  var reopen = document.getElementById("reopen-telegram");

  function setError(node, msg) {
    if (msg) { node.textContent = msg; node.hidden = false; }
    else { node.textContent = ""; node.hidden = true; }
  }

  function validate() {
    var ok = true;
    if (!fName.value.trim()) { setError(errName, "Как к вам обращаться?"); ok = false; }
    else setError(errName, "");
    if (!fCar.value.trim()) { setError(errCar, "Марка и модель — чтобы прикинуть объём"); ok = false; }
    else setError(errCar, "");
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    var url = buildTelegramURL({ name: fName.value.trim(), car: fCar.value.trim(), message: fMessage.value.trim() });
    window.open(url, "_blank", "noopener,noreferrer");
    reopen.href = url;
    fields.hidden = true;
    success.hidden = false;
  });

  document.getElementById("form-reset").addEventListener("click", function () {
    fName.value = ""; fCar.value = ""; fMessage.value = "";
    setError(errName, ""); setError(errCar, "");
    success.hidden = true;
    fields.hidden = false;
  });

  /* ─── Tier "Выбрать пакет" → prefill task + scroll to form ─── */
  Array.prototype.forEach.call(document.querySelectorAll(".tier-cta [data-tier]"), function (btn) {
    btn.addEventListener("click", function () {
      if (success.hidden === false) { success.hidden = true; fields.hidden = false; }
      fMessage.value = "Интересует пакет: " + btn.dataset.tier + ".";
      var el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ─── Footer year ─── */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
