---
name: Enpii Studio
colors:
  surface: '#fff8f7'
  surface-dim: '#dfd8d8'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2f1'
  surface-container: '#f3ecec'
  surface-container-high: '#eee7e6'
  surface-container-highest: '#e8e1e0'
  on-surface: '#1e1b1b'
  on-surface-variant: '#474551'
  inverse-surface: '#33302f'
  inverse-on-surface: '#f6efee'
  outline: '#787582'
  outline-variant: '#c8c4d3'
  surface-tint: '#5b53aa'
  primary: '#261a74'
  on-primary: '#ffffff'
  primary-container: '#3d348b'
  on-primary-container: '#aba3ff'
  inverse-primary: '#c6c0ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fdc342'
  on-secondary-container: '#705100'
  tertiary: '#2a2c2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#404242'
  on-tertiary-container: '#adaeae'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6c0ff'
  on-primary-fixed: '#150066'
  on-primary-fixed-variant: '#433a91'
  secondary-fixed: '#ffdea2'
  secondary-fixed-dim: '#f6be3d'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5c4200'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fff8f7'
  on-background: '#1e1b1b'
  surface-variant: '#e8e1e0'
typography:
  headline-xl:
    fontFamily: Anybody
    fontSize: 80px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Anybody
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Anybody
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  border-width: 4px
  shadow-offset: 6px
  gutter: 24px
  margin-page: 32px
  container-max: 1280px
---

## Brand & Style

The design system is built on a **Neobrutalist** foundation, characterized by high-contrast geometry, raw honesty, and a "zine-inspired" editorial flair. It targets a niche audience that values the intersection of creative artistry and technical precision. The UI should evoke a sense of structural confidence, urgency, and unapologetic boldness.

Key stylistic pillars include:
- **High-Contrast Impact:** Heavy use of solid black strokes and shadows against vibrant fills.
- **Asymmetric Precision:** Layouts that feel intentional yet irregular, breaking traditional symmetry to create visual tension.
- **Functional Rawness:** No gradients, no blurs, and no decorative softness. Every element serves a structural or communicative purpose.

## Colors

The palette is restricted to a high-impact set of four colors to maintain the "printed-matter" aesthetic:

- **Primary (#3D348B):** A deep, saturated purple used for hero typography, primary containers, and large structural blocks.
- **Accent (#E6AF2E):** A bold gold used sparingly for calls-to-action, status indicators, and critical highlights.
- **Background (#F3F3F3):** A neutral off-white that acts as the canvas, preventing the high-contrast elements from feeling overly clinical.
- **Stroke/Text (#040303):** An aggressive near-black used for all 4px borders, hard shadows, and body text.

## Typography

Typography is a primary graphic element in this design system. 

- **Display Headlines:** Utilizing **Anybody**, set in extra-bold or black weights. It must be uppercase with tight tracking to create "text-blocks" that function as shapes.
- **Body Text:** **Hanken Grotesk** provides a clean, neutral balance to the aggressive headlines, ensuring long-form readability.
- **Technical/Utility:** **JetBrains Mono** is used for labels, captions, and secondary metadata to reinforce the studio's technical expertise.

## Layout & Spacing

This design system uses an **Asymmetric Editorial Grid**. While a 12-column underlying structure is used for alignment, elements should frequently "break" the grid or overlap to create a zine-like feel.

- **Grid:** 12-column fluid grid on desktop, 4-column on mobile.
- **Gutters:** Fixed at 24px to maintain a rigid, mechanical separation between blocks.
- **Margins:** Generous page margins (32px+) to allow the bold borders room to breathe.
- **Alignment:** Use extreme horizontal and vertical offsets. For example, a card might be offset 24px to the right of its header to create a stepped visual hierarchy.

## Elevation & Depth

Depth is conveyed through **Hard Offset Shadows** rather than Z-axis blurs or gradients. 

- **Shadow Character:** Use a solid #040303 fill with 100% opacity. 
- **Offset:** Shadows are consistently offset by 6px to the bottom-right (6px 6px).
- **Interactivity:** On hover, buttons and interactive cards should "press down" by reducing the shadow offset to 2px or 0px, mimicking a physical mechanical click.
- **Layers:** Use the Primary (#3D348B) or Accent (#E6AF2E) colors as background fills for the "bottom" layer to create color-blocked depth when elements overlap.

## Shapes

The shape language is strictly **Sharp**. 

- **Corners:** All containers, buttons, and input fields must have 0px border-radius. 
- **Strokes:** A uniform 4px black (#040303) stroke is mandatory for all UI containers.
- **Images:** Treat images as structural blocks. They should always be contained within a 4px black border with a hard shadow.

## Components

### Buttons
- **Style:** 4px black border, solid fill (Primary or Accent), bold uppercase text.
- **Interaction:** Hard shadow (6px) that disappears on `active` state to simulate a press.
- **Variants:** Primary (Gold fill), Secondary (Purple fill), Outline (Off-white fill).

### Cards
- **Style:** Off-white or Primary background, 4px black border, 6px black hard shadow.
- **Layout:** Use internal padding of 24px. Headers within cards should be separated by a 4px horizontal rule.

### Input Fields
- **Style:** 4px black border, sharp corners, Off-white background.
- **Focus:** When focused, the background changes to a very light tint of the Primary color or increases the border weight to 6px.

### Chips & Tags
- **Style:** Small, sharp-edged boxes with 2px borders.
- **Typography:** JetBrains Mono bold, all-caps.
- **Color:** Always use the Accent (#E6AF2E) for price tags or high-priority categories.

### Lists
- **Style:** Items separated by 4px black horizontal lines. 
- **Bullets:** Square 8px blocks using the Accent color instead of round dots.