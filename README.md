# ✨ Motion Interior Design Studio ✨

A premium, modern interior design platform built with **React**, **Vite**, **TypeScript**, and **Framer Motion**. This project features a fully dynamic frontend and a robust Admin Dashboard powered by **Supabase**.

![Banner](https://raw.githubusercontent.com/rudranilchakraborty308-cloud/motion-interior-design-studio/main/motion_interior_banner.png)

## 🌟 Key Features

- **🎭 Cinematic Experience**: Immersive, fluid animations using Framer Motion.
- **📱 Dynamic Content**: Every section (Hero, About, Services, Testimonials) is manageable via an elegant Admin Panel.
- **🖼️ Project Portfolio**: Categorized gallery with high-resolution image support and intelligent optimization.
- **📅 Booking System**: Integrated consultation booking flow with real-time notifications.
- **🛠️ Premium Admin Dashboard**:
  - Full Site Content Management.
  - Portfolio & Gallery control.
  - Testimonial management with soft-delete support.
  - Global Branding & Logo settings.
  - Booking overview and status tracking.
- **⚡ Image Optimization**: Automatic client-side compression for lightning-fast loading without compromising visual quality.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Vanilla CSS with Tailwind CSS utilities.
- **Animation**: Framer Motion.
- **Backend/Database**: Supabase (PostgreSQL).
- **Deployment**: Netlify Ready (with `_redirects` support).

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/rudranilchakraborty308-cloud/motion-interior-design-studio-premium.git
cd motion-interior-design-studio-premium
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

## 📂 Project Structure

- `src/admin/`: All components and views for the Admin Portal.
- `src/components/`: Modular frontend components (Hero, Portfolio, etc.).
- `src/lib/`: Shared utilities, image compression, and database configuration.
- `public/`: Static assets and deployment configurations.

## 🔐 Admin Access

The Admin Panel is accessible at `/admin`. Access is strictly restricted to authorized emails (configured in `src/admin/AdminApp.tsx`).

## 🌐 Deployment to Netlify

1. Connect your GitHub repository to **Netlify**.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.
4. Add your Environment Variables in the Netlify Dashboard.

---

*Designed with ❤️ for luxury, elegance, and performance.*
