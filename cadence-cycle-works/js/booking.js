/* Booking page: validated form, live summary, slot picker and saved bookings
   (features 9-12). */
(function () {
  "use strict";
  var CCW = window.CCW;
  var STORAGE_KEY = "ccw.bookings";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("booking-form");
    if (!form) return;

    var $ = function (id) { return document.getElementById(id); };
    var nameEl = $("b-name"), phoneEl = $("b-phone"), emailEl = $("b-email"), bikeEl = $("b-bike");
    var dateEl = $("b-date"), notesEl = $("b-notes"), consentEl = $("b-consent");
    var servicesBox = $("b-services"), slotsBox = $("b-slots");
    var summaryBox = $("error-summary");

    /* ---------- build dynamic controls ---------- */
    var ph = document.createElement("option");
    ph.value = ""; ph.textContent = "Choose your bike";
    bikeEl.appendChild(ph);
    CCW.bikes.forEach(function (b) {
      var o = document.createElement("option");
      o.value = b.id; o.textContent = b.label;
      bikeEl.appendChild(o);
    });

    CCW.services.forEach(function (s) {
      var label = document.createElement("label");
      label.className = "check";
      var input = document.createElement("input");
      input.type = "checkbox"; input.name = "service"; input.value = s.id; input.id = "b-svc-" + s.id;
      var name = document.createElement("span"); name.textContent = s.name;
      var price = document.createElement("span"); price.className = "price"; price.textContent = CCW.money(s.price);
      label.appendChild(input); label.appendChild(name); label.appendChild(price);
      servicesBox.appendChild(label);
    });

    /* date limits: tomorrow to 60 days ahead */
    function iso(d) {
      var m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
      return d.getFullYear() + "-" + m + "-" + day;
    }
    var min = new Date(); min.setDate(min.getDate() + 1);
    var max = new Date(); max.setDate(max.getDate() + 60);
    dateEl.min = iso(min); dateEl.max = iso(max);

    /* prefill from the URL (?service=a,b&bike=road) */
    var params = new URLSearchParams(window.location.search);
    (params.get("service") || "").split(",").forEach(function (id) {
      var box = $("b-svc-" + id);
      if (box) box.checked = true;
    });
    if (params.get("bike") && CCW.byId(CCW.bikes, params.get("bike"))) bikeEl.value = params.get("bike");

    /* ---------- slots ---------- */
    function parseDate(v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }

    /* Deterministic "already taken" pattern so the demo feels real but is stable */
    function isTaken(dateStr, slot) {
      var h = 0, s = dateStr + slot;
      for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 97;
      return h % 5 === 0;
    }
    function bookedLocally(dateStr, slot) {
      return CCW.store.get(STORAGE_KEY, []).some(function (b) { return b.date === dateStr && b.time === slot; });
    }

    function renderSlots() {
      var v = dateEl.value;
      slotsBox.textContent = "";
      var msg = function (t) { var p = document.createElement("p"); p.className = "muted"; p.textContent = t; slotsBox.appendChild(p); };
      if (!v) { msg("Choose a date to see available times."); return; }
      var d = parseDate(v);
      if (d.getDay() === 0) { msg("We are closed on Sundays. Please pick another date."); return; }
      CCW.slots.forEach(function (slot, i) {
        if (d.getDay() === 6 && slot === "17:00") return; /* Saturday closes at 16:00 */
        var label = document.createElement("label");
        label.className = "slot";
        var input = document.createElement("input");
        input.type = "radio"; input.name = "time"; input.value = slot; input.id = "b-time-" + i;
        var taken = isTaken(v, slot) || bookedLocally(v, slot);
        input.disabled = taken;
        var span = document.createElement("span");
        span.textContent = slot;
        if (taken) span.setAttribute("title", "Already booked");
        label.appendChild(input); label.appendChild(span);
        slotsBox.appendChild(label);
      });
    }

    /* ---------- reading values ---------- */
    function selectedServices() {
      return Array.prototype.map.call(servicesBox.querySelectorAll("input:checked"), function (i) { return i.value; });
    }
    function selectedTime() {
      var r = slotsBox.querySelector("input:checked");
      return r ? r.value : "";
    }

    /* ---------- validation ---------- */
    var rules = [
      { id: "b-name", err: "b-name-err", test: function () {
        var v = nameEl.value.trim();
        if (!v) return "Enter your full name.";
        if (v.length < 2 || !/^[\p{L}][\p{L}\s'.-]*$/u.test(v)) return "Use letters only, at least 2 characters.";
        return "";
      } },
      { id: "b-phone", err: "b-phone-err", test: function () {
        var v = phoneEl.value.trim();
        if (!v) return "Enter a mobile number.";
        var digits = v.replace(/\D/g, "");
        if (!/^[+\d\s-]+$/.test(v) || digits.length < 10 || digits.length > 13) return "Enter a valid number with 10 to 13 digits.";
        return "";
      } },
      { id: "b-email", err: "b-email-err", test: function () {
        var v = emailEl.value.trim();
        if (!v) return "Enter your email address.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter an email like name@example.com.";
        return "";
      } },
      { id: "b-bike", err: "b-bike-err", test: function () { return bikeEl.value ? "" : "Choose your bike type."; } },
      { id: "b-svc-" + CCW.services[0].id, err: "b-services-err", group: true, test: function () {
        return selectedServices().length ? "" : "Choose at least one service.";
      } },
      { id: "b-date", err: "b-date-err", test: function () {
        var v = dateEl.value;
        if (!v) return "Choose a drop-off date.";
        var d = parseDate(v);
        if (d < parseDate(dateEl.min) || d > parseDate(dateEl.max)) return "Pick a date within the next 60 days, starting tomorrow.";
        if (d.getDay() === 0) return "We are closed on Sundays. Pick Monday to Saturday.";
        return "";
      } },
      { id: "b-time-0", err: "b-time-err", group: true, test: function () {
        if (!dateEl.value || parseDate(dateEl.value).getDay() === 0) return "Choose a valid date first, then a time.";
        return selectedTime() ? "" : "Choose a time slot.";
      } },
      { id: "b-consent", err: "b-consent-err", test: function () { return consentEl.checked ? "" : "Tick the box so we can contact you."; } }
    ];

    function focusTargetFor(rule) {
      if (rule.id === "b-time-0") {
        var first = slotsBox.querySelector("input:not(:disabled)");
        return first ? first.id : "b-date";
      }
      return rule.id;
    }

    function runRule(rule) {
      var message = rule.test();
      CCW.setError(rule.group ? null : $(rule.id), rule.err, message);
      return message;
    }

    function validateAll() {
      var problems = [];
      rules.forEach(function (r) {
        var m = runRule(r);
        if (m) problems.push({ id: focusTargetFor(r), message: m });
      });
      CCW.showSummary(summaryBox, problems);
      return problems;
    }

    /* validate on blur, and re-check live once a field has shown an error */
    rules.forEach(function (r) {
      if (r.group) return;
      var el = $(r.id);
      el.addEventListener("blur", function () { runRule(r); });
      el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" || el.type === "date" ? "change" : "input", function () {
        if (el.getAttribute("aria-invalid") === "true") runRule(r);
      });
    });

    /* ---------- live summary ---------- */
    function updateSummary() {
      var ids = selectedServices();
      var bike = CCW.byId(CCW.bikes, bikeEl.value);
      $("s-bike").textContent = bike ? bike.label : "Not chosen";
      $("s-services").textContent = ids.length
        ? ids.map(function (id) { return CCW.byId(CCW.services, id).name; }).join(", ")
        : "None yet";
      var when = "Not chosen";
      if (dateEl.value) {
        var d = parseDate(dateEl.value);
        when = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + (selectedTime() ? " at " + selectedTime() : "");
      }
      $("s-when").textContent = when;
      $("s-total").textContent = CCW.money(CCW.estimate(ids, bikeEl.value || "road").total);
    }

    form.addEventListener("change", function (e) {
      if (e.target === dateEl) renderSlots();
      if (e.target.name === "service" && selectedServices().length) CCW.setError(null, "b-services-err", "");
      if (e.target.name === "time") CCW.setError(null, "b-time-err", "");
      updateSummary();
    });

    notesEl.addEventListener("input", function () {
      $("b-notes-count").textContent = notesEl.value.length + " of 300 characters";
    });

    /* ---------- submit ---------- */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var problems = validateAll();
      if (problems.length) {
        summaryBox.focus();
        CCW.toast("Check the form: " + problems.length + (problems.length === 1 ? " problem" : " problems") + " found.", "error");
        return;
      }
      var ids = selectedServices();
      var booking = {
        ref: "CCW-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
        name: nameEl.value.trim(),
        bike: bikeEl.value,
        services: ids,
        date: dateEl.value,
        time: selectedTime(),
        total: CCW.estimate(ids, bikeEl.value).total
      };
      var all = CCW.store.get(STORAGE_KEY, []);
      all.push(booking);
      CCW.store.set(STORAGE_KEY, all);

      $("confirm-ref").textContent = booking.ref;
      $("confirm-detail").textContent = booking.name + ", we have you down for " + CCW.formatDate(booking.date) + " at " + booking.time +
        ". Estimated labour: " + CCW.money(booking.total) + ".";
      form.hidden = true;
      var confirmBox = $("confirm");
      confirmBox.hidden = false;
      confirmBox.focus();
      renderList();
      CCW.toast("Booking confirmed: " + booking.ref);
    });

    $("confirm-new").addEventListener("click", function () {
      form.reset();
      summaryBox.hidden = true;
      $("b-notes-count").textContent = "0 of 300 characters";
      renderSlots(); updateSummary();
      $("confirm").hidden = true;
      form.hidden = false;
      nameEl.focus();
    });

    /* ---------- saved bookings ---------- */
    function renderList() {
      var list = $("my-list"), emptyMsg = $("my-empty");
      var all = CCW.store.get(STORAGE_KEY, []);
      list.textContent = "";
      emptyMsg.hidden = all.length > 0;
      all.forEach(function (b) {
        var li = document.createElement("li");
        var info = document.createElement("div");
        var strong = document.createElement("strong"); strong.textContent = b.ref;
        var small = document.createElement("small");
        small.textContent = CCW.formatDate(b.date) + " at " + b.time;
        info.appendChild(strong); info.appendChild(small);
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "btn btn-ghost btn-sm"; btn.textContent = "Cancel";
        btn.setAttribute("aria-label", "Cancel booking " + b.ref);
        btn.addEventListener("click", function () {
          if (!window.confirm("Cancel booking " + b.ref + "?")) return;
          CCW.store.set(STORAGE_KEY, CCW.store.get(STORAGE_KEY, []).filter(function (x) { return x.ref !== b.ref; }));
          renderList(); renderSlots();
          CCW.toast("Booking " + b.ref + " cancelled.");
        });
        li.appendChild(info); li.appendChild(btn);
        list.appendChild(li);
      });
    }

    renderSlots();
    updateSummary();
    renderList();
  });
})();
