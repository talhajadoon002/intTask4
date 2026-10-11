/* Home page: live price estimator (feature 7). */
(function () {
  "use strict";
  var CCW = window.CCW;

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("estimator");
    if (!form) return;
    var bikeSel = document.getElementById("est-bike");
    var box = document.getElementById("est-services");
    var totalEl = document.getElementById("est-total");
    var timeEl = document.getElementById("est-time");
    var bookLink = document.getElementById("est-book");

    CCW.bikes.forEach(function (b) {
      var o = document.createElement("option");
      o.value = b.id; o.textContent = b.label;
      bikeSel.appendChild(o);
    });

    CCW.services.filter(function (s) { return ["tune-basic", "brakes", "gears", "wheel-true", "puncture"].indexOf(s.id) > -1; })
      .forEach(function (s) {
        var label = document.createElement("label");
        label.className = "check";
        var input = document.createElement("input");
        input.type = "checkbox"; input.value = s.id; input.name = "service";
        var name = document.createElement("span"); name.textContent = s.name;
        var price = document.createElement("span"); price.className = "price"; price.textContent = CCW.money(s.price);
        label.appendChild(input); label.appendChild(name); label.appendChild(price);
        box.appendChild(label);
      });

    function update() {
      var ids = Array.prototype.map.call(box.querySelectorAll("input:checked"), function (i) { return i.value; });
      var est = CCW.estimate(ids, bikeSel.value);
      totalEl.textContent = CCW.money(est.total);
      if (!ids.length) {
        timeEl.textContent = "Select at least one service.";
        bookLink.setAttribute("aria-disabled", "true");
        bookLink.setAttribute("tabindex", "-1");
        bookLink.href = "booking.html";
        return;
      }
      timeEl.textContent = CCW.daysLabel(est.days) + " for " + ids.length + (ids.length === 1 ? " service" : " services") + ".";
      bookLink.removeAttribute("aria-disabled");
      bookLink.removeAttribute("tabindex");
      bookLink.href = "booking.html?bike=" + encodeURIComponent(bikeSel.value) + "&service=" + ids.map(encodeURIComponent).join(",");
    }

    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    update();
  });
})();
