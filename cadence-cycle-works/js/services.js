/* Services page: search, category filter and sort (feature 8). */
(function () {
  "use strict";
  var CCW = window.CCW;

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("svc-grid");
    if (!grid) return;
    var search = document.getElementById("svc-search");
    var sort = document.getElementById("svc-sort");
    var chipBox = document.getElementById("chips");
    var status = document.getElementById("svc-status");
    var empty = document.getElementById("svc-empty");
    var category = "all";

    CCW.categories.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = c.label; b.dataset.cat = c.id;
      b.setAttribute("aria-pressed", String(c.id === "all"));
      chipBox.appendChild(b);
    });

    function render() {
      var q = search.value.trim().toLowerCase();
      var list = CCW.services.filter(function (s) {
        var inCat = category === "all" || s.category === category;
        var inText = !q || (s.name + " " + s.desc).toLowerCase().indexOf(q) > -1;
        return inCat && inText;
      });
      var by = sort.value;
      list.sort(function (a, b) {
        if (by === "price-asc") return a.price - b.price;
        if (by === "price-desc") return b.price - a.price;
        if (by === "days") return a.days - b.days || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });
      grid.textContent = "";
      list.forEach(function (s) { grid.appendChild(CCW.serviceCard(s)); });
      empty.hidden = list.length > 0;
      grid.hidden = list.length === 0;
      status.textContent = list.length + (list.length === 1 ? " service shown" : " services shown");
    }

    chipBox.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      category = btn.dataset.cat;
      chipBox.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === btn)); });
      render();
    });
    search.addEventListener("input", render);
    sort.addEventListener("change", render);
    document.getElementById("toolbar").addEventListener("submit", function (e) { e.preventDefault(); });
    document.getElementById("svc-reset").addEventListener("click", function () {
      search.value = ""; sort.value = "name"; category = "all";
      chipBox.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.cat === "all")); });
      render();
      search.focus();
    });
    render();
  });
})();
