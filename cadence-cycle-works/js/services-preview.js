/* Home page: render the featured services from shared data. */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var box = document.getElementById("featured");
    if (!box) return;
    box.textContent = "";
    window.CCW.services.filter(function (s) { return s.featured; }).forEach(function (s) {
      box.appendChild(window.CCW.serviceCard(s));
    });
  });
})();
