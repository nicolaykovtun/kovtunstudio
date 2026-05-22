// Дизайн оклейки авто — vanilla landing logic
// Lightbox gallery, Telegram lead form, tier prefill.

(function () {
  "use strict";

  /* ─── Portfolio data — 28 works ─── */
  var GALLERY = [
    { src: "assets/portfolio/01.png", label: "BMW Z4 — рекламная оклейка" },
    { src: "assets/portfolio/02.png", label: "Lexus LX570 — имиджевая концепция" },
    { src: "assets/portfolio/13.png", label: "Toyota Probox — оклейка Japanhouse, общий план" },
    { src: "assets/portfolio/03.png", label: "Toyota Hiace — корпоративный фургон" },
    { src: "assets/portfolio/04.png", label: "Toyota Probox — расширенный дизайн" },
    { src: "assets/portfolio/08.png", label: "Lexus LX570 — фасадный план" },
    { src: "assets/portfolio/20.png", label: "Probox — деталь оклейки Japanhouse" },
    { src: "assets/portfolio/05.png", label: "Toyota Probox — оклейка Japanhouse" },
    { src: "assets/portfolio/06.png", label: "Probox — рекламная оклейка" },
    { src: "assets/portfolio/22.png", label: "Probox — общий вид сзади" },
    { src: "assets/portfolio/07.png", label: "Probox — корпоративный транспорт" },
    { src: "assets/portfolio/09.png", label: "Probox — фрагмент кузова" },
    { src: "assets/portfolio/10.png", label: "Probox — боковая проекция" },
    { src: "assets/portfolio/11.png", label: "Probox — деталь оклейки" },
    { src: "assets/portfolio/12.png", label: "Probox — рекламный фрагмент" },
    { src: "assets/portfolio/14.png", label: "Probox — крупный план задней стороны" },
    { src: "assets/portfolio/15.png", label: "Probox — крупный план передней стороны" },
    { src: "assets/portfolio/16.png", label: "Probox — деталь композиции" },
    { src: "assets/portfolio/17.png", label: "Probox — фрагмент имиджевого макета" },
    { src: "assets/portfolio/18.png", label: "Probox — переход графики на двери" },
    { src: "assets/portfolio/19.png", label: "Probox — боковая часть с типографикой" },
    { src: "assets/portfolio/21.png", label: "Probox — задние двери" },
    { src: "assets/portfolio/23.png", label: "Probox — крупный план графики" },
    { src: "assets/portfolio/24.png", label: "Probox — деталь имиджевого макета" },
    { src: "assets/portfolio/25.png", label: "Probox — крупный план кузова" },
    { src: "assets/portfolio/26.png", label: "Probox — переход графики на боку" },
    { src: "assets/portfolio/27.png", label: "Probox — фрагмент оклейки" },
    { src: "assets/portfolio/28.png", label: "Probox — крупный план кузова, сторона" }
  ];

  /* ─── Lightbox ─── */
  var lb = document.getElementById("lightbox");
  var lbImage = document.getElementById("lb-image");
  var lbLabel = document.getElementById("lb-label");
  var lbCounter = document.getElementById("lb-counter");
  var lbThumbs = document.getElementById("lb-thumbs");
  var current = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  function buildThumbs() {
    var frag = document.createDocumentFragment();
    GALLERY.forEach(function (it, i) {
      var btn = document.createElement("button");
      btn.className = "lightbox-thumb";
      btn.setAttribute("aria-label", "Открыть работу " + (i + 1));
      var img = document.createElement("img");
      img.src = it.src;
      img.alt = "";
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
