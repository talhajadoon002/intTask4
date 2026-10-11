/* Shared behaviour on every page.
   Features here: 1) mobile nav  2) dark mode  3) toast messages
   4) back-to-top  5) FAQ accordion  6) review carousel */
(function () {
  "use strict";
  var CCW = window.CCW;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- safe storage helpers (storage can be blocked) ---- */
  CCW.store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  /* ---- 3) toast ---- */
  var toastBox;
  CCW.toast = function (message, type) {
    if (!toastBox) {
      toastBox = document.createElement("div");
      toastBox.className = "toasts";
      toastBox.setAttribute("role", "status");
      toastBox.setAttribute("aria-live", "polite");
      document.body.appendChild(toastBox);
    }
    var t = document.createElement("div");
    t.className = "toast" + (type === "error" ? " error" : "");
    t.textContent = message;
    toastBox.appendChild(t);
    setTimeout(function () { t.remove(); }, 4500);
  };

  /* ---- shared helpers ---- */
  CCW.money = function (n) { return "$" + n.toLocaleString("en-US"); };

  CCW.formatDate = function (iso) {
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  /* Show or clear a field error. Works for inputs and for fieldset groups. */
  CCW.setError = function (field, errId, message) {
    var err = document.getElementById(errId);
    if (err) err.textContent = message || "";
    if (field) {
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  };

  /* Build a short error summary linking to each invalid control */
  CCW.showSummary = function (box, items) {
    box.textContent = "";
    if (!items.length) { box.hidden = true; return; }
    var h = document.createElement("p");
    h.innerHTML = "<strong>Please fix " + items.length + (items.length === 1 ? " problem" : " problems") + ":</strong>";
    var ul = document.createElement("ul");
    items.forEach(function (it) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + it.id;
      a.textContent = it.message;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(it.id);
        if (target) target.focus();
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.appendChild(h);
    box.appendChild(ul);
    box.hidden = false;
  };

  /* Reusable service card (home and services pages) */
  CCW.serviceCard = function (s) {
    var li = document.createElement("article");
    li.className = "card svc";
    var cat = CCW.byId(CCW.categories, s.category);
    li.innerHTML =
      '<span class="tag"></span><h3></h3><p></p>' +
      '<div class="svc-meta"><span class="svc-price"></span><span class="svc-days"></span></div>' +
      '<a class="btn btn-ghost"></a>';
    li.querySelector(".tag").textContent = cat ? cat.label : "";
    li.querySelector("h3").textContent = s.name;
    li.querySelector("p").textContent = s.desc;
    li.querySelector(".svc-price").textContent = "From " + CCW.money(s.price);
    li.querySelector(".svc-days").textContent = CCW.daysLabel(s.days);
    var a = li.querySelector("a");
    a.href = "booking.html?service=" + encodeURIComponent(s.id);
    a.textContent = "Book this";
    a.setAttribute("aria-label", "Book " + s.name);
    return li;
  };

  document.addEventListener("DOMContentLoaded", function () {
    /* footer year */
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    /* ---- 2) dark mode ---- */
    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      var sync = function () {
        var dark = document.documentElement.dataset.theme === "dark";
        themeBtn.setAttribute("aria-pressed", String(dark));
      };
      sync();
      themeBtn.addEventListener("click", function () {
        var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        CCW.store.set("ccw.theme", next);
        sync();
      });
    }

    /* ---- 1) mobile nav ---- */
    var navBtn = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (navBtn && nav) {
      var setNav = function (open) {
        nav.classList.toggle("open", open);
        navBtn.setAttribute("aria-expanded", String(open));
        navBtn.setAttribute("aria-label", open ? "Close menu" : "Menu");
      };
      navBtn.addEventListener("click", function () { setNav(!nav.classList.contains("open")); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("open")) { setNav(false); navBtn.focus(); }
      });
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
      window.addEventListener("resize", function () { if (window.innerWidth > 720) setNav(false); });
    }

    /* ---- 4) back to top ---- */
    var topBtn = document.getElementById("to-top");
    if (topBtn) {
      var onScroll = function () { topBtn.hidden = window.scrollY < 700; };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        document.getElementById("main").setAttribute("tabindex", "-1");
        document.getElementById("main").focus({ preventScroll: true });
      });
    }

    /* ---- 5) accordion: one panel open at a time ---- */
    document.querySelectorAll("[data-accordion]").forEach(function (acc) {
      var buttons = acc.querySelectorAll("button[aria-controls]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var open = btn.getAttribute("aria-expanded") === "true";
          buttons.forEach(function (b) {
            b.setAttribute("aria-expanded", "false");
            document.getElementById(b.getAttribute("aria-controls")).hidden = true;
          });
          if (!open) {
            btn.setAttribute("aria-expanded", "true");
            document.getElementById(btn.getAttribute("aria-controls")).hidden = false;
          }
        });
        btn.addEventListener("keydown", function (e) {
          var i = Array.prototype.indexOf.call(buttons, btn);
          var to = null;
          if (e.key === "ArrowDown") to = buttons[(i + 1) % buttons.length];
          if (e.key === "ArrowUp") to = buttons[(i - 1 + buttons.length) % buttons.length];
          if (e.key === "Home") to = buttons[0];
          if (e.key === "End") to = buttons[buttons.length - 1];
          if (to) { e.preventDefault(); to.focus(); }
        });
      });
    });

    /* ---- 6) carousel (auto-advances unless reduced motion, hover or focus) ---- */
    document.querySelectorAll("[data-carousel]").forEach(function (car) {
      var slides = car.querySelectorAll(".slide");
      var dotsBox = car.querySelector(".dots");
      var live = car.querySelector(".slides");
      var index = 0, timer = null;

      slides.forEach(function (_, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "dot";
        d.setAttribute("aria-label", "Show review " + (i + 1));
        d.addEventListener("click", function () { show(i); });
        dotsBox.appendChild(d);
      });
      var dots = dotsBox.querySelectorAll(".dot");

      function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (s, n) { s.hidden = n !== index; });
        dots.forEach(function (d, n) {
          if (n === index) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
        });
      }
      function start() {
        if (reduceMotion || timer) return;
        timer = setInterval(function () { show(index + 1); }, 7000);
      }
      function stop() { clearInterval(timer); timer = null; live.setAttribute("aria-live", "polite"); }

      car.querySelector("[data-prev]").addEventListener("click", function () { stop(); show(index - 1); });
      car.querySelector("[data-next]").addEventListener("click", function () { stop(); show(index + 1); });
      dots.forEach(function (d) { d.addEventListener("click", stop); });
      car.addEventListener("mouseenter", stop);
      car.addEventListener("focusin", stop);
      show(0);
      start();
    });
  });
})();
