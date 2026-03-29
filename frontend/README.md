# Ledger Frontend Architecture

This is the frontend application for the **Ledger** invoice management system. It has been built to feel like a snappy, premium SaaS product, featuring a heavily customized UI design system.

## Tech Stack
- **Framework**: React 18, TypeScript, Vite
- **Routing**: React Router 6
- **Data Fetching**: Axios
- **Styling**: Pure CSS (`global.css`) built via custom variables, ensuring incredibly fast render times with zero overhead.

## Custom Design System

The platform features a tailor-made styling system focusing on user fluidity and experience:

### 1. Dynamic Animations
- **Staggered Entry**: Dashboards and lists load with cascading `stagger-` delay utilities, giving a smooth "waterfall" feeling as items enter the screen.
- **Robust Custom Easing**: All transitions utilize `cubic-bezier(0.4, 0, 0.2, 1)` to provide a fast snap-in with a fluid tail, commonly seen in high-end design systems.

### 2. Loading Skeletons
- We bypassed static `Loading...` texts for fully dynamic **Skeleton Loaders**. 
- Using `@keyframes shimmer` mapping across `linear-gradient` backgrounds, the layout softly pulses to visually mimic the specific structure of the data blocks loading in.

### 3. Interactive Components
- **Micro-Interaction Hover States**: Modifying table rows or hovering over buttons naturally expands the component using subtle `translateY` scaling alongside soft, glowing drop-shadows tailored to our signature base **Red Theme**.
- **Focus Rings**: Complex form handling incorporates intuitive input focus rings `rgba(230, 57, 70, 0.15)` for heightened layout accessibility.

## Getting Started

To run the application locally:
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

The app will become available at `http://localhost:5173`. Make sure the Django backend is also running concurrently to fetch and hydrate data correctly!
