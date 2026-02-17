# 💰 FinSnap

**The Ultimate Automated Money Tracker** — Manage all your wallets, track every transaction, and control your monthly budgets — all in one place, right from your browser.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## ✨ Features

| Feature                | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| 🏦 **Multi-Wallet**    | Manage bank accounts, e-wallets, and cash with multi-currency support           |
| 📊 **Smart Tracking**  | Record income, expenses, and inter-wallet transfers with full category support  |
| 💡 **Budget Planner**  | Set monthly budgets per category with visual alerts when approaching limits     |
| 📈 **Analytics**       | Charts, trends, and spending insights to understand your financial habits       |
| 🎨 **Personalization** | 7 color themes, dark/light mode, and 2 languages (English & Bahasa Indonesia)   |
| 🔒 **Privacy First**   | Your data stays in the browser via `localStorage` — no server, no third parties |
| 🧾 **Receipt OCR**     | Snap and scan receipts to auto-fill transaction data _(mock/demo)_              |

---

## 🛠 Tech Stack

| Layer                | Technology                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| **Framework**        | [Next.js 16](https://nextjs.org/) (App Router)                              |
| **UI Library**       | [React 19](https://react.dev/)                                              |
| **Language**         | [TypeScript 5](https://www.typescriptlang.org/)                             |
| **Styling**          | [Tailwind CSS 4](https://tailwindcss.com/)                                  |
| **Components**       | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/)                                  |
| **Charts**           | [Recharts 2](https://recharts.org/)                                         |
| **Forms**            | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| **Icons**            | [Lucide React](https://lucide.dev/)                                         |
| **Date Utilities**   | [date-fns 4](https://date-fns.org/)                                         |
| **Notifications**    | [Sonner](https://sonner.emilkowal.dev/)                                     |
| **Code Formatting**  | [Biome](https://biomejs.dev/)                                               |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/FinSnap-Studio/FinSnap-App.git
cd FinSnap-App

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start development server |
| `npm run build`  | Create production build  |
| `npm start`      | Start production server  |
| `npm run lint`   | Run ESLint               |
| `npm run format` | Format code with Biome   |

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/               # Authentication pages (login, register)
│   ├── (dashboard)/          # Protected dashboard pages
│   │   ├── dashboard/        # Main dashboard with widgets
│   │   ├── wallets/          # Wallet management & detail
│   │   ├── transactions/     # Transaction listing & filters
│   │   ├── budgets/          # Budget planning
│   │   ├── categories/       # Category management
│   │   └── settings/         # App settings & preferences
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles & CSS variables
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── landing/              # Landing page sections
│   ├── layout/               # Sidebar, header, mobile nav
│   ├── dashboard/            # Dashboard widgets & charts
│   ├── wallets/              # Wallet cards & forms
│   ├── transactions/         # Transaction list, filters, form
│   ├── budgets/              # Budget cards & forms
│   └── categories/           # Category items & forms
├── stores/                   # Zustand state stores
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities, constants, i18n, validations
├── types/                    # TypeScript type definitions
└── data/                     # Mock/demo data
```

---

## 🌍 Internationalization

FinSnap supports two languages out of the box:

- 🇬🇧 **English**
- 🇮🇩 **Bahasa Indonesia**

Language can be switched from **Settings > Language**.

---

## 🎨 Theming

7 built-in color themes with dark/light mode:

| Theme       | Style                       |
| ----------- | --------------------------- |
| **Slate**   | Classic neutral (default)   |
| **Emerald** | Fresh green, financial vibe |
| **Violet**  | Modern purple, futuristic   |
| **Rose**    | Soft pink, friendly         |
| **Ocean**   | Ocean blue, calm            |
| **Amber**   | Warm gold, premium          |
| **Sunset**  | Bold orange, energetic      |

Customize from **Settings > Appearance**.

---

## 📦 Data Storage

FinSnap operates entirely in the browser using `localStorage`. No backend server or database is required.

- ✅ Zero setup — works offline
- ✅ No account required (demo mode available)
- ✅ Data can be cleared from Settings
- ⚠️ Data is local to the browser — clearing browser data will erase app data

---

## 👨‍💻 Author

**Muhammad Ikhwanul Hakim** (Iwan)

A Software Engineer passionate about building useful digital products. FinSnap was built to help people manage their personal finances more easily.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
