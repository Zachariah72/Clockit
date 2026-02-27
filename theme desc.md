# Clockit Theme & Design System Documentation

Welcome to the **Clockit** Design System. This document serves as a guide for developers to understand the theme, color combinations, and design philosophy used throughout the application.

## 🎨 Design Philosophy
Clockit uses a **vibrant, high-contrast, modern** design language. It is optimized for a music and story-sharing experience, drawing inspiration from premium entertainment platforms. The core aesthetic relies on **Glassmorphism**, **Neon Glows**, and **Dynamic Gradients**.

---

## 🌈 Core Color Palette
The design system is built using HSL variables, allowing for consistent shades and easy theme switching.

| Component | Color Name | Color (Hex Approx) | Description |
| :--- | :--- | :--- | :--- |
| **Primary** | Vibrant Cyan | `#00f2ff` | Used for active states, CTA buttons, and primary branding. |
| **Secondary** | Hot Pink | `#ff0080` | Used for secondary highlights and "seen" story indicators. |
| **Accent** | Purple | `#9333ea` | A blending agent for gradients and neon accents. |
| **Background** | Deep Navy | `#0a0c10` | The primary dark canvas for the application. |
| **Surface** | Card/Popover | `#141820` | Subtle elevation for cards and overlays. |

---

## 🖌️ Design Elements

### 1. Signature Gradients
We use specific linear gradients to create the "Clockit" look:
- **Primary Gradient**: Cyan ➡️ Purple ➡️ Magenta (`--gradient-primary`)
- **Story Gradient**: Magenta ➡️ Purple ➡️ Cyan (`--gradient-story`)
- **Glass Gradient**: Semi-transparent dark blue for frosted glass effects.

### 2. Glassmorphism
Premium cards use backdrop filters and subtle borders:
- `.glass-card`: Standard frosted glass with a subtle border.
- `.glass-card-modern`: Enhanced version with a purple inner glow and deeper shadows.

### 3. Neon Glows
To emphasize interactivity, we use neon glow effects:
- `.glow-cyan`, `.glow-magenta`, `.glow-purple`: Box shadows that mimic LED/Neon lights.
- `.text-gradient`: Applies the primary gradient to text elements.

---

## 🛠️ Theme Management
Clockit supports four distinct themes managed via `ThemeContext.tsx` and the `ThemeProvider` component.

1.  **Dark (Default)**: The standard "Clockit" experience with deep navy backgrounds and neon accents.
2.  **Light**: A clean, high-legibility theme using white backgrounds and slightly muted brand colors.
3.  **Black (AMOLED)**: A pure black theme designed for OLED screens to save battery and provide infinite contrast.
4.  **Teal**: A variant theme where the primary accent is replaced with a sophisticated `#3B9797` teal.

### Usage in Code
- **Tailwind Classes**: Use semantic classes like `bg-primary`, `text-foreground`, `border-border`.
- **CSS Variables**: Accessed via `var(--primary)`, `var(--background)`, etc.
- **Hook**: Use the `useTheme()` hook to access or change the current theme.

---

## 📁 Key Files
- `tailwind.config.ts`: Tailwind configuration and animation definitions.
- `src/index.css`: Global base styles, HSL variable definitions, and component classes (`.glass-card`, etc.).
- `src/contexts/ThemeContext.tsx`: React Context for state management and theme persistence.

---

> [!TIP]
> When building new components, always prefer **semantic Tailwind classes** (e.g., `text-muted-foreground`) over hardcoded hex values to ensure your UI looks great across all four themes!
