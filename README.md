# HealthNote — Personal Health Tracker

A client-side web app for tracking BMI, daily calorie intake, macros, and weight trends. No server or build step required.

---

## Features

- **Welcome gate** — asks for your last name and age on first visit before showing the app
- **BMI calculator** — computes and categorises your BMI (Underweight / Normal / Overweight / Obese)
- **Daily food log** — search from a food database, log meals by type (breakfast, lunch, dinner, snack), and track calories and macros
- **Weight tracking** — log daily weight and view trends over time
- **Dashboard** — 7-day calorie chart, weight trend chart, and today's macro progress
- **Health report** — 30-day nutrition summary, personalised recommendations based on your BMI and goal
- **Local storage** — all data stays in your browser, no account needed

---

## Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari)
- [Node.js](https://nodejs.org) *(optional — only needed to run unit tests)*

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/venugangavarapu/VLVenuRepo.git
   cd VLVenuRepo
   ```

2. **Open the app**

   Simply open `index.html` in your browser:

   - **Windows:** double-click `index.html`, or run:
     ```bash
     start index.html
     ```
   - **Mac/Linux:**
     ```bash
     open index.html
     ```

   No npm install, no build step, no server needed.

3. **First-time setup**

   On first visit a welcome modal will appear asking for your **last name** and **age**. Fill these in and click **Get Started** (or press Enter) to open the app. This step is skipped on return visits.

---

## Running Unit Tests

Tests are written in plain Node.js and require no additional packages.

```bash
node tests.js
```

A non-zero exit code indicates test failures.

---

## Project Structure

```
├── index.html   # App shell and markup
├── style.css    # All styles
├── app.js       # Application logic
├── foods.js     # Food database
└── tests.js     # Unit tests
```

---

## Data Storage

All data (profile, food log, weight log, welcome info) is stored in the browser's `localStorage`. Clearing browser data will reset the app.
