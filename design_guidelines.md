# Design Guidelines: Crossy Chain - Web3 Gaming Experience

## Design Approach

**Reference-Based Approach**: Retro arcade gaming aesthetic inspired by Crossy Road's pixel-art style, combined with modern Web3 UI patterns from MetaMask and blockchain explorers.

**Core Design Principle**: Seamlessly blend nostalgic 8-bit gaming visuals with contemporary blockchain interface elements, creating a cohesive experience that feels both playful and trustworthy.

## Color Palette

### Primary Colors (Dark Mode Optimized)
- **Background**: 20 8% 12% (deep charcoal for game backdrop)
- **Surface**: 240 6% 18% (elevated UI panels)
- **Primary Brand**: 142 76% 56% (vibrant green from game grass - #baf455)
- **Secondary**: 356 64% 54% (energetic red for CTAs - #f0619a)

### Accent Colors
- **Success/Score**: 82 61% 56% (lime green for achievements)
- **Warning**: 48 89% 50% (amber for pending transactions)
- **Blockchain Blue**: 221 83% 53% (MetaMask-inspired for Web3 elements)

### Semantic Colors
- **Text Primary**: 0 0% 98% (high contrast white)
- **Text Secondary**: 0 0% 70% (muted gray for descriptions)
- **Border**: 240 4% 28% (subtle separators)

## Typography

### Font Families
- **Display/UI**: 'Press Start 2P' (retro pixel font via Google Fonts)
- **Body/Technical**: 'IBM Plex Mono' (for addresses, transaction hashes)
- **Fallback**: monospace, system-ui

### Type Scale
- **Game Score**: text-4xl (2.25rem) - pixelated, prominent
- **Wallet Address**: text-sm (0.875rem) - monospace truncated
- **Button Labels**: text-base (1rem) - uppercase, letter-spacing tight
- **Transaction Hash**: text-xs (0.75rem) - monospace with copy button

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 16 for consistent rhythm
- Base padding: p-4 (controls, modals)
- Section spacing: gap-8 (between UI groups)
- Modal margins: m-16 (centered overlays)

**Game Canvas**: Full viewport with fixed overlay UI elements at corners/edges
**Web3 UI Overlay**: Non-intrusive floating panels that don't block gameplay

## Component Library

### Core Game Components
**A. Score Display**
- Position: Absolute top-right (top-8 right-8)
- Style: Pixelated white text with subtle drop-shadow
- Animation: Number increment with pixel-pop effect on score change

**B. Control Panel**
- Position: Absolute bottom-center (bottom-8)
- D-pad layout: CSS Grid 3-column (forward spanning full width)
- Button style: White bg, light gray border, 3px shadow offset
- Interactive: Maintain original pixel-art button shadows

### New Web3 Components

**C. Wallet Connection Card**
- Position: Top-left floating panel (top-8 left-8)
- Structure: Compact card with blur background (backdrop-blur-md)
- States:
  - Disconnected: "Connect Wallet" button (bg-[#baf455])
  - Connected: Truncated address (0x1234...5678) + network badge
- Visual: 1px border, rounded-lg, pixel-corner accent decoration

**D. Transaction Modal**
- Trigger: On saveScore() call
- Layout: Centered overlay (fixed inset-0, flex items-center justify-center)
- Card: max-w-md with dark surface bg, pixel-border styling
- Content Hierarchy:
  1. Status Icon (pending spinner / success checkmark)
  2. Message: "Saving Score On-Chain..." / "Score Saved!"
  3. Transaction Hash (copyable, monospace)
  4. Explorer Link Button (opens testnet.monadexplorer.com)
- Animation: Fade-in overlay, slide-up card

**E. Game Over Screen Enhancement**
- Existing: Red "Retry" button maintained
- Addition: Score summary card above retry button
  - Final Score (large pixelated number)
  - Transaction status indicator
  - "View on Explorer" link (if tx successful)

**F. Network Status Badge**
- Position: Top-left, below wallet card
- Design: Small pill badge showing "Monad Testnet" with chain icon
- Color: Blockchain blue bg with white text
- State: Green dot indicator when RPC connected

### Animations

**Minimal & Purposeful**:
- Score increment: Subtle scale pulse (scale-110 for 200ms)
- Transaction pending: Rotating spinner icon
- Success feedback: Green checkmark fade-in + confetti burst (particle effect)
- Wallet connect: Smooth slide-in from top-left
- Avoid: Excessive parallax, unnecessary transitions on game elements

## Images

**Hero Section**: NOT APPLICABLE - This is a full-screen 3D game canvas
**Decorative Elements**:
- MetaMask Fox icon (for wallet connection button)
- Monad network logo (for network badge)
- Blockchain checkmark icon (success states)

All icons sourced from: Heroicons for UI elements, official brand assets for MetaMask/Monad

## Accessibility

- Maintain existing keyboard controls for gameplay
- Add keyboard shortcuts: 'W' to open wallet, 'Esc' to close modals
- Color contrast: All text meets WCAG AA on dark backgrounds
- Focus states: Bright outline (outline-2 outline-[#baf455])
- Screen reader: aria-labels for wallet address, transaction status

## Responsive Behavior

**Desktop (≥1024px)**:
- Wallet card: top-left with full address display
- Controls: Bottom-center d-pad visible for demo
- Modals: max-w-md centered

**Tablet/Mobile (≤1024px)**:
- Wallet card: Compact icon-only mode, expands on tap
- Controls: Larger touch targets (min 48px)
- Modals: Full-width bottom sheet (slide up from bottom)

## Web3-Specific UI Patterns

**Address Truncation**: 0x1234...5678 (first 6, last 4 characters)
**Copy Interaction**: Click address → copy icon appears → "Copied!" tooltip
**Transaction Hash Links**: Underlined on hover, opens in new tab
**Paymaster Status**: Small "(Gasless)" badge if sponsored tx
**Loading States**: Skeleton screens for pending wallet connection

## Visual Differentiation

This design uniquely blends:
- **Retro Gaming**: Pixel fonts, grid-based layouts, primary colors from game objects
- **Modern Web3**: Glassmorphism cards, monospace addresses, blockchain iconography
- **Playful Trust**: Fun game aesthetic with serious transaction feedback

The result: A gaming-first experience where blockchain integration feels like a natural power-up system rather than intrusive financial UI.