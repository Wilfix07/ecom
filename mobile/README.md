# 📱 TechMart Haiti - Mobile App

React Native mobile app connected to the same Supabase backend as the web application.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android development)
- Xcode (for iOS development on Mac)
- Supabase account with same project

### Installation

1. **Initialize React Native Project**:
```bash
npx react-native@latest init TechMartMobile --template react-native-template-typescript
cd TechMartMobile
```

2. **Install Dependencies**:
```bash
npm install @supabase/supabase-js @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler
```

3. **Install iOS dependencies** (Mac only):
```bash
cd ios && pod install && cd ..
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetails.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Profile.tsx
│   │   ├── Orders.tsx
│   │   └── Login.tsx
│   ├── components/       # Reusable components
│   │   ├── ProductCard.tsx
│   │   ├── CartItem.tsx
│   │   └── Button.tsx
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── context/          # React Contexts
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── CurrencyContext.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   └── useAuth.ts
│   ├── lib/              # Utilities
│   │   ├── supabase.ts
│   │   └── constants.ts
│   └── types/            # TypeScript types
│       └── index.ts
├── App.tsx               # Root component
├── package.json
└── tsconfig.json
```

---

## 🔑 Configuration

### Supabase Setup

1. **Create `src/lib/supabase.ts`**:
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

2. **Update environment variables**:
Create `.env` file:
```
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

---

## 📱 Features

### Implemented Screens:
- ✅ Home - Product feed
- ✅ Products List - Browse all products
- ✅ Product Details - Full product info
- ✅ Cart - Shopping cart with items
- ✅ Checkout - Payment flow
- ✅ Profile - User profile
- ✅ Orders - Order history
- ✅ Login/Register - Authentication

### Shared with Web App:
- ✅ Same Supabase backend
- ✅ Same authentication
- ✅ Same product data
- ✅ Same cart logic
- ✅ Same orders
- ✅ Real-time sync

---

## 🧪 Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Development
```bash
npm start
```

---

## 📦 Build & Deploy

### iOS (App Store)
```bash
cd ios
xcodebuild -workspace TechMartMobile.xcworkspace -scheme TechMartMobile
```

### Android (Google Play)
```bash
cd android
./gradlew assembleRelease
```

---

## 🔐 Authentication

Same authentication flow as web app:
- Supabase Auth
- Email/Password
- Session management
- Profile sync

---

## 📊 Database

Same Supabase tables:
- products
- orders
- order_items
- user_profiles
- reviews
- cart_items (optional)

---

## 🎯 Next Steps

1. Set up navigation
2. Create screens
3. Integrate Supabase
4. Test on iOS and Android
5. Deploy to app stores

---

**Mobile app structure ready for development!**

