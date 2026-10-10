# 💸 Cash-Flow — Salary & Expense Tracker

> A small side project built as part of an **internship assignment** and submitted as a **project deliverable**.

A lightweight, fully client-side personal finance dashboard built with **Vanilla JavaScript, HTML5, and CSS3** — no frameworks, no build step, no backend.

---

## ✨ Features at a Glance

| Feature | Details |
|---|---|
| 💰 Salary Setup | Set your monthly income with currency selection |
| 📝 Expense Logging | Add, edit, delete expenses with category & payment method |
| 📊 Visual Chart | Pie/Doughnut chart — balance vs expenses, or by category |
| 🔴 Threshold Alert | Auto-warning banner when balance drops below 10% of salary |
| 💱 Currency Converter | Live exchange rates via Frankfurter API (free & keyless) |
| 📄 PDF Export | One-click downloadable report via jsPDF + AutoTable |
| 💾 Persistence | All data saved to `localStorage` — survives page reloads |
| 🌙 Dark / Light Mode | Theme toggle with preference saved |
| 🔍 Search & Filter | Filter expenses by keyword, category, or sort order |

---

## 🧠 How It Works

### 1. Salary & State Initialization
On page load, the app reads from `localStorage` to restore the previously saved salary, currency, theme, and expense list. All state is stored in memory as a simple `totalSalary` number and an `expenses[]` array — a single source of truth.

```
Salary → localStorage → loaded on boot → rendered to KPI cards
```

### 2. Expense Management
When an expense is submitted via the form:
- It is validated (no empty fields, no zero/negative amounts)
- A unique ID + timestamp is assigned
- It is pushed into the `expenses[]` array
- The array is serialized via `JSON.stringify()` and saved to `localStorage`
- The DOM is re-rendered: KPI cards, chart, and expense table all update

Editing an expense reuses the same form — the existing item is patched in-place by ID, not duplicated.

### 3. Balance Calculation
The core math is straightforward:
```
Remaining Balance = Total Salary − Sum of all Expenses
```
This runs every time an expense is added, edited, deleted, or when salary is changed. If the remaining balance falls below **10% of salary**, a red alert banner is shown automatically.

### 4. Chart (Chart.js)
The chart has two modes switchable via tabs:
- **Balance Mode** — Remaining Balance vs Total Expenses (2 slices)
- **Category Mode** — Each expense category as its own slice

The chart instance is stored in `expenseChart`. On every update, it either mutates the existing instance via `.update()` or destroys and recreates it to prevent canvas duplication.

### 5. Currency System
The app supports **7 currencies** (USD, INR, EUR, GBP, JPY, CAD, AUD). Switching currency:
- Updates all displayed values using `Intl.NumberFormat` with the correct locale
- Does **not** mutate the raw stored numbers — formatting only, so no floating-point drift on repeated toggles
- Persists the selected currency to `localStorage`

The **Currency Converter** widget makes a live fetch to the [Frankfurter API](https://www.frankfurter.app/) to get real-time exchange rates, independent of the app's base currency.

### 6. PDF Report
Clicking "Download Report" triggers jsPDF + the AutoTable plugin to generate an A4 PDF containing:
- Salary, total expenses, and remaining balance
- A full table of all logged expenses (date, category, amount, payment method)
- Styled header and footer, all rendered in-browser — no server needed

### 7. Search, Filter & Sort
The expense table supports:
- **Keyword search** — matches against expense name
- **Category filter** — dropdown of all 9 categories
- **Sort** — by date (newest/oldest) or amount (high/low)

All three can be combined. The table re-renders from the in-memory array on every input event.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│              index.html                 │  ← UI layout, CDN scripts
├─────────────────────────────────────────┤
│              styles.css                 │  ← Design tokens, dark/light themes
├─────────────────────────────────────────┤
│              script.js                  │  ← All logic (IIFE, strict mode)
│                                         │
│  ┌──────────┐   ┌──────────────────┐    │
│  │  State   │──▶│  Render Layer    │    │
│  │(salary,  │   │(KPI cards, table,│    │
│  │ expenses)│   │ chart, alerts)   │    │
│  └──────────┘   └──────────────────┘    │
│       │                                 │
│  ┌────▼────────────────┐                │
│  │   localStorage      │  ← Persistence │
│  └─────────────────────┘                │
└─────────────────────────────────────────┘
```

All JavaScript is wrapped in an **IIFE** (`(() => { 'use strict'; ... })()`) to avoid polluting the global scope.

---

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Structure | HTML5 (semantic) |
| Styling | CSS3 (custom properties, dark/light themes) |
| Logic | Vanilla JavaScript (ES6+, strict mode) |
| Charts | [Chart.js](https://www.chartjs.org/) via CDN |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) + AutoTable via CDN |
| Currency | [Frankfurter API](https://www.frankfurter.app/) (free, no API key) |
| Font | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |

---

## 🚀 Quick Start

No install needed — just open the file:

```bash
# Windows
start index.html

# Or serve locally
npx serve .
# → http://localhost:3000
```

---

## 📂 File Structure

```
├── index.html     # App layout, CDN script tags, semantic HTML
├── styles.css     # Full design system — tokens, components, dark mode
├── script.js      # All app logic — state, render, storage, APIs
└── README.md      # This file
```
