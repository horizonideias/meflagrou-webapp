# 🤖 meflagrou.com • AI & System Architecture Documentation

Welcome to **meflagrou.com**! This document provides an instant, structured overview of the entire codebase, domain models, business logic, and component architecture for AI coding assistants, code reviewers, and software engineers.

---

## 🌟 Executive Overview
* **Platform Name:** `meflagrou.com` (Brazil's Premier 8K VIP Nightlife & Festival AI Flagra Platform)
* **Tech Stack:** React 18, Vite, TypeScript, Lucide Icons, Canvas-Confetti, Vitest, Modern Cyberpunk Dark Custom CSS.
* **Core Value Proposition:**
  1. High-resolution 8K nightlife photography delivery with 1-second auto delayed overlays.
  2. Ultra-fast Client-side AI Face Recognition (Face ID Instantâneo) and Biometric Tagging.
  3. Interactive Nightlife Marketplace with automated profit sharing: 90% to the photo owner/seller, 9% to the Master Deus/Founder account, and 1% fees.
  4. Real-time VIP Community & Live Chat rooms (#Geral, #Camarote VIP, #Lost & Found, #Fotógrafos Pro, #Festivals Live) + 1-on-1 Direct Messages.
  5. Anti-Screen Capture Shield (`AntiScreenCaptureShield.tsx`) to protect photographer copyright.
  6. Social profile with persistent photo collection ("Meus Flagras"), instant avatar updating, and 4:5 Instagram Portrait video generation (1080 x 1350).

---

## 🏗️ Directory Architecture

```
meflagrou-webapp/
├── public/                 # Static assets (favicons, manifest, logo assets)
├── src/
│   ├── components/         # Modular React UI components
│   │   ├── InstagramApp.tsx               # Root App orchestrator (Feed, Profile, Modals router)
│   │   ├── InstagramFeed.tsx              # Central VIP stream with story reels and event cards
│   │   ├── InstagramPostCard.tsx          # Feed photo card with likes, reactions, purchase & tags
│   │   ├── InstagramSidebar.tsx           # Left desktop & mobile sidebar navigation
│   │   ├── InstagramRightSidebar.tsx      # Right sidebar (PIX wallet, 1v1 battle, community widget)
│   │   ├── SocialProfile.tsx              # VIP Profile screen, avatar uploader, "Meus Flagras" gallery
│   │   ├── PhotoModalViewer.tsx           # Fullscreen 8K photo viewer with delayed meta overlay
│   │   ├── CommunityLiveChatModal.tsx     # Real-time VIP Community Chat & Directs
│   │   ├── AuthGatekeeperPage.tsx         # Clean futuristic login & register with CPF/CEP/Photo
│   │   ├── FacialScannerModal.tsx         # Biometric Face ID scanner modal
│   │   ├── PartyRecapVideoModal.tsx       # 1080x1350 (4:5) Party Recap Story video generator
│   │   ├── MotionVideoModal.tsx           # 1080x1350 (4:5) 3D Motion Video generator
│   │   └── ...
│   ├── context/
│   │   └── CartContext.tsx                # Global state: Cart, Checkout, Sales, User Profile Photos
│   ├── data/
│   │   ├── mockDatabase.ts                # Verified Mock Users, Events, and Photos
│   │   └── mockStories.ts                 # Dynamic stories ordered with active user first
│   ├── services/
│   │   ├── biometricService.ts            # Facial vector extractor, landmark soundfx & CPF validator
│   │   ├── databaseService.ts             # IndexedDB & LocalStorage persistence adapter
│   │   ├── colorGradeEngine.ts            # LUMEN cinema film presets & CSS filters
│   │   └── ambientSoundscape.ts           # Web Audio API ambient festival sound generator
│   ├── tests/                             # Vitest unit test suite (37+ passing tests)
│   ├── types/
│   │   └── index.ts                       # TypeScript interfaces (UserProfile, EventPhoto, Transaction)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                          # Global dark cyberpunk styling
└── package.json
```

---

## 💰 Monetization & Royalties Algorithm (90% / 9% / 1%)

Located in `src/types/index.ts` and calculated in `src/context/CartContext.tsx`:
```ts
export const calculateMasterDeusSplit = (totalAmount: number = 0): MasterDeusSplit => {
  const safeTotal = Math.max(0, Number(totalAmount) || 0);
  const ownerAmount = Number((safeTotal * 0.90).toFixed(2));     // 90% for Photo Seller / Owner
  const deusRoyaltyAmount = Number((safeTotal * 0.09).toFixed(2)); // 9% for Master Founder / Deus Account
  const platformFee = Number((safeTotal - ownerAmount - deusRoyaltyAmount).toFixed(2)); // 1% Gateway Fee
  return { ownerAmount, deusRoyaltyAmount, platformFee };
};
```

---

## 🧪 Testing & Verification
Execute:
```bash
npm test        # Runs Vitest unit tests suite
npm run build   # TypeScript compilation check & Vite bundling
```
