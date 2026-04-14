# Design System Specification: High-Fidelity Music Utility

## 1. Overview & Creative North Star: "The Sonic Gallery"
This design system moves away from the "utilitarian database" look common in music apps and towards a **"Sonic Gallery"** experience. The North Star is the concept of **Luminous Depth**—where the UI feels like a high-end physical console made of smoked glass and light.

To break the "template" look, we utilize **Intentional Asymmetry**. Rather than perfectly centered grids, we use the `display-lg` typography to anchor layouts to the edges, creating an editorial feel. Overlapping elements—such as album art bleeding into glass containers—create a sense of movement and energy, moving the brand beyond a static player into a premium lifestyle tool.

---

## 2. Colors & Atmospheric Lighting
Our palette is rooted in absolute depth, using high-contrast accents to guide the user's "eye-path."

### The Palette (Tonal Values)
- **Background & Base:** `surface` (#131313) and `surface-container-lowest` (#0e0e0e) provide the "infinite" void.
- **Accents (The Energy):**
    - `primary`: (#53e076 / Spotify Green) for growth, playback, and success.
    - `secondary`: (#ffb4a8 / YouTube Red) for destructive actions, recording, and high-energy alerts.
- **Surface Hierarchy:** Use `surface-container` (#201f1f) through `surface-container-highest` (#353534) to define depth.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined through background shifts. For example, a list of tracks should sit on `surface-container-low`, while the active track uses `surface-container-high`. If you feel the need for a line, increase the padding instead.

### The "Glass & Gradient" Rule
Standard containers are forbidden for primary actions. Use **Glassmorphism**:
- **Floating Player:** Use `surface-variant` with a 60% opacity and a 24px backdrop blur.
- **Signature Textures:** Apply a linear gradient from `primary` (#53e076) to `primary-container` (#1db954) at a 135-degree angle for Hero CTAs. This creates a "glow" effect rather than a flat fill.

---

## 3. Typography: Editorial Authority
We pair **Plus Jakarta Sans** (Display/Headlines) with **Inter** (Body/UI) to create a balance between high-end fashion and technical precision.

- **Display (The Hook):** `display-lg` (3.5rem) should be used for artist names or playlist titles. Use tight letter-spacing (-0.04em) and bold weights to command attention.
- **Headlines (The Anchor):** `headline-sm` (1.5rem) uses Plus Jakarta Sans to define sections without needing dividers.
- **Body & Labels (The Utility):** `body-md` (Inter) is the workhorse for metadata. Use `on-surface-variant` (#bccbb9) for secondary data like "128 bpm" to keep the visual noise low.

---

## 4. Elevation & Depth: Tonal Layering
We reject the 2010s "drop shadow." Hierarchy is achieved through the **Layering Principle**.

- **Stacking:** Place `surface-container-highest` objects on top of `surface-dim` backgrounds. This creates a natural "lift."
- **Ambient Shadows:** For floating modals, use a "Sonic Shadow":
    - Blur: 40px | Spread: -10px | Color: `surface-container-lowest` at 40% opacity.
    - This mimics a physical object blocking ambient light, not a "glow" under the card.
- **The "Ghost Border" Fallback:** If a container must be defined against a complex background, use `outline-variant` (#3d4a3d) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Interactive Elements

### Buttons (High-Energy)
- **Primary:** Gradient fill (`primary` to `primary-container`), `md` (1.5rem) corner radius. Use `on-primary` (#003914) for text to ensure AAA contrast.
- **Tertiary:** Ghost style. No background, no border. Use `primary` text with a subtle glow on hover (0px 0px 12px `primary`).

### Glass Cards & Lists
- **Forbid Dividers:** Use `8px` of vertical whitespace between list items.
- **The "Active" State:** Instead of a checkbox, use a `primary` vertical pill (4px wide) on the left edge of the list item and shift the background to `surface-container-highest`.

### Signature Component: The Glass Scrubber
- The music progress bar should not be a flat line. Use a `surface-variant` track with a `primary` gradient fill. The "thumb" (handle) should be a 24px blurred glass circle that only appears on hover.

### Input Fields
- **Style:** `surface-container-high` background, `md` corner radius. 
- **Focus State:** 2px "Ghost Border" using `primary` at 40% opacity. No solid strokes.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Breathing Room":** If a design feels cluttered, double the padding. This system relies on space to feel premium.
- **Leverage Asymmetry:** Let album art be slightly larger than the text column beside it.
- **Color-Coded Feedback:** Use `secondary` (#ffb4a8) exclusively for YouTube-linked data or error states to maintain brand mental models.

### Don’t:
- **No 100% White:** Never use #FFFFFF. Use `on-surface` (#e5e2e1) to prevent eye strain in dark mode.
- **No Sharp Corners:** Every corner must be at least `sm` (0.5rem), with containers defaulting to `md` (1.5rem) or `lg` (2rem).
- **No Flat Black:** Avoid #000000. It kills the glassmorphism effect. Use `surface-container-lowest` (#0e0e0e) to allow for subtle depth.

---

## 7. Spacing Scale
Stick to a **base-8** grid to maintain mathematical harmony.
- **Tight:** 8px (icon padding)
- **Standard:** 24px (component internal padding)
- **Editorial:** 48px - 64px (section spacing to define hierarchy)