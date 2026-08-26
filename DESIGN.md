---
name: Kinetic Local
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ef9900'
  on-tertiary-container: '#5c3800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is built for a **Hyperlocal Delivery Platform** that prioritizes speed, reliability, and community connection. The brand personality is efficient and energetic, evoking a sense of "velocity meeting trust." 

The visual style is **Corporate / Modern** with a high-contrast edge. It utilizes generous whitespace and a clean, systematic structure to reduce cognitive load for users who are often on the move. The aesthetic balances professional utility with vibrant pops of color to signal action and urgency, ensuring the interface feels alive and responsive to real-time logistics.

## Colors

This design system utilizes a high-visibility palette optimized for legibility in various lighting conditions.

- **Primary (Delivery Green):** Used for primary actions, success states, and indicating "Go." It symbolizes the freshness of goods and the efficiency of the fleet.
- **Secondary (Trust Blue):** Used for deep-interface elements, primary navigation, and high-contrast typography. It provides the grounding force of the brand.
- **Tertiary (Urgency Orange):** Reserved for active order tracking, alerts, and time-sensitive notifications.
- **Neutrals:** A range of Slate-tints are used for secondary text and subtle borders to maintain a crisp, decluttered appearance.
- **Surfaces:** Pure white is the base, with subtle `#F8FAFC` tints used to differentiate background sections from content cards.

## Typography

The design system uses **Inter** exclusively to ensure maximum readability across mobile and desktop. 

- **Headlines:** Use a bold weight with tight letter-spacing to create a sense of urgency and importance.
- **Body:** Generous line heights (1.5x) are applied to ensure lists of items and delivery instructions are easy to scan.
- **Labels:** Semibold weights are used for buttons and status chips to ensure they stand out against background elements.
- **Scale:** On mobile devices, headlines scale down slightly to prevent awkward text wrapping in narrow containers.

## Layout & Spacing

The layout follows a **4px baseline grid** to ensure mathematical consistency across all components.

- **Grid System:** A 12-column fluid grid is used for desktop, transitioning to a 4-column grid for mobile.
- **Margins:** Mobile screens use a strict 16px side margin to maximize screen real estate for product imagery. 
- **Rhythm:** Use `md` (16px) for internal component padding and `lg` (24px) for vertical spacing between distinct content sections.
- **Safe Areas:** Ensure all critical action buttons (like "Checkout") maintain a 16px buffer from the bottom of the device screen.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Base):** Pure white background.
- **Level 1 (Surfaces):** `#F8FAFC` is used for background fills behind cards to create a subtle recessed look.
- **Level 2 (Cards):** White cards with a very soft, diffused shadow (`0px 4px 20px rgba(15, 23, 42, 0.05)`). This makes cards feel "lifted" but integrated.
- **Level 3 (Floating/Active):** Higher elevation shadows for sticky bottom bars or active floating order trackers (`0px 10px 30px rgba(15, 23, 42, 0.1)`).
- **Outlines:** Use a 1px border of `#E2E8F0` for input fields and non-elevated containers.

## Shapes

The design system uses a **Rounded (Level 2)** shape language to appear friendly and modern, while maintaining a professional edge.

- **Small Components:** Checkboxes and small tags use `0.25rem` (4px).
- **Standard UI:** Buttons, inputs, and list items use `0.5rem` (8px).
- **Large Containers:** Product cards and modals use `rounded-xl` at `1.5rem` (24px) to create a distinct, high-end feel.
- **Imagery:** All merchant and product photos must carry a `1rem` (16px) corner radius to match the UI container language.

## Components

- **Buttons:** Primary buttons use a solid "Delivery Green" fill with white text. They are large (min-height: 48px) to be thumb-friendly. Secondary buttons use a "Trust Blue" outline.
- **Chips/Badges:** Used for delivery status (e.g., "Out for Delivery," "Preparing"). Use "Urgency Orange" background with a 10% opacity and a solid orange text for high legibility without visual heaviness.
- **Input Fields:** Use a subtle `#F8FAFC` fill and a 1px `#E2E8F0` border. On focus, the border transitions to "Trust Blue" with a 2px thickness.
- **Cards:** Horizontal layouts for list views (shops) and vertical layouts for grid views (products). Cards should have a `1.5rem` corner radius and a Level 2 elevation.
- **Status Tracker:** A specialized component featuring a vertical or horizontal stepper. Active steps use "Delivery Green" with a pulse animation to indicate live progress.
- **Lists:** Clean dividers of 1px using `#F1F5F9`. Provide ample vertical padding (16px) to each list item to prevent accidental taps.
