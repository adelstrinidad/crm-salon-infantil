# UI Style Guide

> Template for Step 04: UI Design Guidelines
> Replace all placeholders with actual values

## 1. Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#[HEX]` | Main actions, navigation |
| Primary Focus | `#[HEX]` | Hover states |
| Primary Content | `#[HEX]` | Text on primary |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Secondary | `#[HEX]` | Secondary actions |
| Secondary Focus | `#[HEX]` | Hover states |
| Secondary Content | `#[HEX]` | Text on secondary |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Accent | `#[HEX]` | Highlights, badges |
| Accent Focus | `#[HEX]` | Hover states |
| Accent Content | `#[HEX]` | Text on accent |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#10B981` | Success states |
| Warning | `#F59E0B` | Warning states |
| Error | `#EF4444` | Error states |
| Info | `#3B82F6` | Information states |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| Base 100 | `#FFFFFF` | Main background |
| Base 200 | `#F3F4F6` | Secondary background |
| Base 300 | `#D1D5DB` | Borders |
| Base Content | `#1F2937` | Body text |
| Neutral | `#374151` | Dark elements |
| Neutral Content | `#FFFFFF` | Text on dark |

---

## 2. Typography

### Font Families

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 12px | 16px | Captions, labels |
| sm | 14px | 20px | Secondary text |
| base | 16px | 24px | Body text |
| lg | 18px | 28px | Lead paragraphs |
| xl | 20px | 28px | H4 |
| 2xl | 24px | 32px | H3 |
| 3xl | 30px | 36px | H2 |
| 4xl | 36px | 40px | H1 |

### Font Weights

| Name | Weight | Usage |
|------|--------|-------|
| normal | 400 | Body text |
| medium | 500 | Labels, buttons |
| semibold | 600 | Subheadings |
| bold | 700 | Headings |

---

## 3. Spacing

### Base Unit

Base unit: `4px` (0.25rem)

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| 0 | 0 | None |
| 1 | 4px | Tight spacing |
| 2 | 8px | Small gaps |
| 3 | 12px | Icon gaps |
| 4 | 16px | Default spacing |
| 5 | 20px | Medium spacing |
| 6 | 24px | Card padding |
| 8 | 32px | Section spacing |
| 10 | 40px | Large spacing |
| 12 | 48px | Page sections |

---

## 4. Border Radius

| Name | Value | Usage |
|------|-------|-------|
| none | 0 | Sharp corners |
| sm | 4px | Subtle rounding |
| md | 8px | Default |
| lg | 12px | Cards, modals |
| xl | 16px | Large elements |
| full | 9999px | Circular |

---

## 5. Shadows

| Name | Value | Usage |
|------|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| md | `0 4px 6px rgba(0,0,0,0.1)` | Cards |
| lg | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns |
| xl | `0 20px 25px rgba(0,0,0,0.1)` | Modals |

---

## 6. Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Laptop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

---

## 7. Z-Index Scale

| Name | Value | Usage |
|------|-------|-------|
| dropdown | 50 | Dropdowns |
| sticky | 100 | Sticky headers |
| fixed | 200 | Fixed elements |
| overlay | 300 | Modal overlays |
| modal | 400 | Modals |
| toast | 500 | Notifications |
| tooltip | 600 | Tooltips |

---

## 8. DaisyUI Theme Configuration

```html
<html data-theme="[PROJECT_THEME]">
```

### Custom Theme Definition (optional)

```javascript
// tailwind.config.js
module.exports = {
  daisyui: {
    themes: [
      {
        "[PROJECT_THEME]": {
          "primary": "#[HEX]",
          "secondary": "#[HEX]",
          "accent": "#[HEX]",
          "neutral": "#[HEX]",
          "base-100": "#[HEX]",
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
    ],
  },
}
```

---

## 9. Brand Guidelines Reference

- **Logo**: [Path to logo files]
- **Brand Colors**: [Reference to brand guidelines]
- **Typography**: [Font licensing and usage]

---

**Created**: [DATE]
**Last Updated**: [DATE]
**Related**: Step 04 UI Design Guidelines
