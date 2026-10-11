# Cadence Cycle Works

A responsive, multi-page front-end web application for a neighbourhood bike repair studio. Visitors can browse services, estimate a price, and book a drop-off slot online.

Built as **Task 4 (Final Project)** of the Inovegen Internship, Web Development Front-End track.

- **Live site:** `ADD-YOUR-GITHUB-PAGES-LINK-HERE`
- **Repository:** `ADD-YOUR-GITHUB-REPO-LINK-HERE`

## Concept

Cadence is a fictional repair shop. The site has one job: help a rider go from "my bike is broken" to "my repair is booked" in about two minutes, with the price visible at every step. All business details, reviews and names are sample content.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Hero with live price estimator, promises, popular services, repair process, reviews, FAQ |
| `services.html` | Searchable, filterable, sortable service list |
| `booking.html` | Validated booking form, live summary, slot picker, saved bookings |
| `contact.html` | Validated contact form, opening hours, open-now indicator |

## JavaScript features (14)

1. **Responsive mobile menu** with `aria-expanded`, Escape to close, closes on link click
2. **Dark / light theme** that follows system preference and remembers the choice
3. **Toast notifications** for confirmations and errors
4. **Back-to-top button** that appears after scrolling
5. **FAQ accordion** with one panel open at a time and arrow-key navigation
6. **Review carousel** with previous/next, dot controls, autoplay that stops on hover/focus and is off for reduced-motion users
7. **Price estimator** that updates total and turnaround as you choose bike type and services, and passes the choice to the booking page
8. **Service search, category filter and sort** with a live result count and an empty state
9. **Booking form validation** on blur and submit, with inline errors and a linked error summary
10. **Slot picker** that builds time slots from the chosen date, blocks Sundays, shortens Saturdays, and disables taken slots
11. **Live booking summary** with price calculated from bike type and selected services
12. **Saved bookings** stored in `localStorage` with a cancel option
13. **Contact form validation** with live character counter and success state
14. **Open-now indicator** based on the visitor's clock

## Technologies

- Semantic HTML5 (landmarks, headings, fieldsets, tables with captions)
- CSS3: custom properties as a design system, Grid, Flexbox, `clamp()` type scale, media queries
- Vanilla JavaScript (no frameworks, no build step)
- Google Fonts: Archivo and Public Sans, with system fallbacks

## Design system

- **Colour:** deep workshop green, safety yellow accent, cool grey surfaces; separate dark palette
- **Type:** Archivo for headings, Public Sans for body, fluid scale from 0.875rem to 4rem
- **Spacing:** five-step scale; breakpoints at 960px (tablet) and 720px (mobile)

## Accessibility

- Skip link, one `h1` per page, landmark regions, `aria-current` on the active page
- Visible `:focus-visible` outline on every control, 44px minimum touch targets
- Every input has a label; errors are linked with `aria-describedby`; `aria-invalid` is set on bad fields
- Error summary receives focus on failed submit and links to each field
- Text and controls meet WCAG AA contrast in both themes
- Respects `prefers-reduced-motion`; works with keyboard only

## Project structure

```
cadence-cycle-works/
├── index.html
├── services.html
├── booking.html
├── contact.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js              shared services, bikes, slots
│   ├── main.js              nav, theme, toast, accordion, carousel, helpers
│   ├── estimator.js         home price estimator
│   ├── services-preview.js  home featured services
│   ├── services.js          search, filter, sort
│   ├── booking.js           booking form logic
│   └── contact.js           contact form logic
├── assets/
│   └── logo.svg
└── screenshots/             desktop and mobile captures
```

## Setup

No installation needed.

1. Download or clone the repository.
2. Open `index.html` in a browser, or serve the folder:
   ```bash
   python3 -m http.server 8000
   ```
   then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new GitHub repository and push this folder to the `main` branch.
2. In the repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute your site is live at `https://<username>.github.io/<repository>/`. Paste that link at the top of this README.


## Notes

- There is no backend. Bookings and messages are demo-only; bookings are kept in the browser's `localStorage`.
- The design and code are original and were not copied from a template.
