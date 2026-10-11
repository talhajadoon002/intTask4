/* Contact page: validated message form, live character count and an
   "open now" indicator (features 13-14). */
(function () {
  "use strict";
  var CCW = window.CCW;

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var $ = function (id) { return document.getElementById(id); };
    var nameEl = $("c-name"), emailEl = $("c-email"), topicEl = $("c-topic"), msgEl = $("c-msg");
    var summary = $("c-summary");

    var rules = [
      { el: nameEl, err: "c-name-err", test: function () {
        var v = nameEl.value.trim();
        if (!v) return "Enter your full name.";
        return v.length < 2 ? "Name must be at least 2 characters." : "";
      } },
      { el: emailEl, err: "c-email-err", test: function () {
        var v = emailEl.value.trim();
        if (!v) return "Enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter an email like name@example.com.";
      } },
      { el: topicEl, err: "c-topic-err", test: function () { return topicEl.value ? "" : "Choose a topic."; } },
      { el: msgEl, err: "c-msg-err", test: function () {
        var v = msgEl.value.trim();
        if (!v) return "Write a message.";
        return v.length < 20 ? "Add a little more detail (" + v.length + " of 20 characters)." : "";
      } }
    ];

    function run(rule) {
      var m = rule.test();
      CCW.setError(rule.el, rule.err, m);
      return m;
    }

    rules.forEach(function (r) {
      r.el.addEventListener("blur", function () { run(r); });
      r.el.addEventListener("input", function () { if (r.el.getAttribute("aria-invalid") === "true") run(r); });
    });

    msgEl.addEventListener("input", function () {
      $("c-msg-count").textContent = msgEl.value.length + " of 600 characters (at least 20)";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var problems = [];
      rules.forEach(function (r) {
        var m = run(r);
        if (m) problems.push({ id: r.el.id, message: m });
      });
      CCW.showSummary(summary, problems);
      if (problems.length) { summary.focus(); CCW.toast("Check the form before sending.", "error"); return; }
      $("c-done-text").textContent = "Thanks, " + nameEl.value.trim().split(" ")[0] + ". We will reply to " + emailEl.value.trim() + " within one working day.";
      form.hidden = true;
      $("c-done").hidden = false;
      $("c-done").focus();
      CCW.toast("Message sent.");
    });

    $("c-again").addEventListener("click", function () {
      form.reset();
      $("c-msg-count").textContent = "0 of 600 characters (at least 20)";
      $("c-done").hidden = true;
      form.hidden = false;
      nameEl.focus();
    });

    /* open-now indicator from the visitor's local clock */
    var now = new Date(), day = now.getDay(), hr = now.getHours() + now.getMinutes() / 60;
    var closeAt = day === 0 ? 0 : day === 6 ? 16 : 18;
    var open = day !== 0 && hr >= 9 && hr < closeAt;
    $("open-now").textContent = open ? "We are open right now." : "We are closed right now.";
  });
})();
