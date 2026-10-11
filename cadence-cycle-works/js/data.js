/* Shared data: services, bike types and time slots.
   Exposed on one global namespace so every page script can use it. */
(function () {
  "use strict";

  var services = [
    { id: "puncture", name: "Puncture repair", desc: "Find the leak, patch or swap the tube and check the tyre for debris.", price: 12, days: 0, category: "wheels", featured: false },
    { id: "tune-basic", name: "Basic tune-up", desc: "Brake and gear adjustment, tyre pressure, bolt check and a safety test ride.", price: 45, days: 1, category: "tune-ups", featured: true },
    { id: "tune-full", name: "Full overhaul", desc: "Strip, clean and rebuild the whole bike, with new cables and fresh grease.", price: 140, days: 3, category: "tune-ups", featured: true },
    { id: "brakes", name: "Brake service", desc: "Replace pads, bleed hydraulic lines or re-seat cables, then re-align the calipers.", price: 40, days: 1, category: "brakes", featured: true },
    { id: "gears", name: "Gear indexing", desc: "Tune the shifting so every gear changes cleanly, front and rear.", price: 28, days: 1, category: "gears", featured: false },
    { id: "drivetrain", name: "Drivetrain replacement", desc: "Fit a new chain, cassette or chainrings and set the gears up to match.", price: 60, days: 2, category: "gears", featured: false },
    { id: "wheel-true", name: "Wheel true", desc: "Straighten a wobbling rim and even out spoke tension.", price: 25, days: 1, category: "wheels", featured: false },
    { id: "suspension", name: "Suspension service", desc: "Clean and re-oil fork seals, check the shock pressure and set the sag.", price: 90, days: 3, category: "specialty", featured: false },
    { id: "ebike", name: "E-bike diagnostic", desc: "Read error codes, test the motor and battery connections, check the controller.", price: 50, days: 2, category: "specialty", featured: false },
    { id: "fit", name: "Bike fit", desc: "A one-hour session to set saddle, bars and cleats to your body and riding style.", price: 80, days: 0, category: "specialty", featured: false }
  ];

  var categories = [
    { id: "all", label: "All services" },
    { id: "tune-ups", label: "Tune-ups" },
    { id: "brakes", label: "Brakes" },
    { id: "gears", label: "Gears" },
    { id: "wheels", label: "Wheels" },
    { id: "specialty", label: "Specialty" }
  ];

  /* mult: labour multiplier applied to every service */
  var bikes = [
    { id: "road", label: "Road bike", mult: 1 },
    { id: "mountain", label: "Mountain bike", mult: 1.1 },
    { id: "city", label: "City or commuter", mult: 1 },
    { id: "ebike", label: "E-bike", mult: 1.3 },
    { id: "kids", label: "Kids' bike", mult: 0.8 }
  ];

  var slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }

  /* Total labour for a set of service ids on a bike type, plus turnaround */
  function estimate(serviceIds, bikeId) {
    var bike = byId(bikes, bikeId) || bikes[0];
    var sum = 0, days = 0;
    serviceIds.forEach(function (id) {
      var s = byId(services, id);
      if (s) { sum += s.price; days = Math.max(days, s.days); }
    });
    return { total: Math.round(sum * bike.mult), days: days };
  }

  function daysLabel(d) {
    if (d === 0) return "Same day";
    if (d === 1) return "Ready next day";
    return "Ready in " + d + " days";
  }

  window.CCW = {
    services: services, categories: categories, bikes: bikes, slots: slots,
    byId: byId, estimate: estimate, daysLabel: daysLabel
  };
})();
