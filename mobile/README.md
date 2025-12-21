# Ekthaa Business - React Native Mobile App 📱

Modern, native mobile application for managing business credits and payments. Built with React Native + Expo for iOS and Android.

## ✨ Features

### ✅ Currently Working
- **Authentication**: Login & Registration with JWT token persistence
- **Dashboard**: Overview with total receivables, quick actions, QR code, recent customers
- **Customer Management**: Search, list, view details (coming soon), WhatsApp integration
- **Navigation**: 5-tab bottom navigation with smooth transitions
- **Theme System**: Beautiful purple theme matching web app
- **API Integration**: Connected to deployed backend

### 🚧 In Development
- Customer Details (WhatsApp-style transaction history)
- Add Customer & Add Transaction
- Products Catalog
- Invoice Generation
- Transactions List

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Installation

```bash
cd mobile
npm install
```

### Run Development Server

```bash
npm start
```

This will display a QR code. Scan it with:
- **Android**: Expo Go app
- **iOS**: Camera app

The app will load instantly on your device!

### Run on Emulator/Simulator

```bash
# Android (requires Android Studio)
npm run android

# iOS (macOS only, requires Xcode)
npm run ios
```

## 📁 Project Structure

```
mobile/
├── App.js                  # Main entry point
├── src/
│   ├── theme/              # Design system (colors, spacing, typography)
│   ├── services/           # API service with AsyncStorage
│   ├── context/            # Auth Context for state management
│   ├── navigation/         # Bottom Tab + Stack navigation
│   ├── components/         # Reusable components
│   │   ├── LoadingSpinner.js
│   │   ├── CustomerCard.js
│   │   ├── SearchBar.js
│   │   ├── FlashMessage.js
│   │   └── EmptyState.js
│   ├── screens/            # All app screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── CustomersScreen.js
│   │   └── PlaceholderScreen.js
│   └── assets/
│       └── logo.png
```

## 🎨 Design System

### Colors
- **Primary**: #5f259f (Purple)
- **Accents**: Orange, Green, Blue, Red
- **10 Avatar Colors** for customer icons

### Components
All components follow modern mobile design patterns:
- Touch feedback (activeOpacity)
- Large hit areas (min 44pt)
- Smooth animations
- Consistent spacing (8px grid)

## 🔧 Tech Stack

- **React Native** via Expo
- **React Navigation** (Bottom Tabs + Native Stack)
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **Expo Image Picker** for photos
- **QR Code SVG** for QR generation
- **Vector Icons** (FontAwesome)

## 🌐 API Integration

Connected to deployed backend:
```
https://kathape-react-business.onrender.com/api
```

All endpoints mapped in `src/services/api.js`:
- Authentication (login, register, logout)
- Dashboard (summary, statistics)
- Customers (CRUD operations, search)
- Transactions (create with image upload)
- Products, Invoice, Profile, QR Code

## 📱 Current Screens

### Authentication
- ✅ **Login**: Phone + password with validation
- ✅ **Register**: Business name, phone, password with matching

### Main App
- ✅ **Dashboard**: Hero card, 6 action buttons, QR modal, recent customers
- ✅ **Customers**: List with search, WhatsApp integration, FAB
- 🚧 **Customer Details**: Transaction history (coming soon)
- 🚧 **Add Customer**: Form for new customer
-🚧 **Add Transaction**: Credit/Payment with receipt photo
- 🚧 **Products**: Product catalog
- 🚧 **Invoice**: PDF generation
- 🚧 **Transactions**: Full transaction list
- 🚧 **Profile**: Business info + logout

## 🎯 Testing

### Test User Flow
1. Open app → see Login screen
2. Tap "Register" → create account
3. Auto-login → Dashboard appears
4. Explore tabs → all navigation works
5. Check Customers → search works
6. Tap customer → see details (placeholder)

### Pull to Refresh
- Swipe down on Dashboard → refreshes data
- Swipe down on Customers → refreshes list

### Error Handling
- Invalid phone → shows error toast
- Wrong password → shows error toast
- API failure → shows user-friendly message

## 🛠️ Development

### Adding New Screens
1. Create screen file in `src/screens/`
2. Import in `src/navigation/index.js`
3. Replace PlaceholderScreen with your component

Example:
```javascript
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';

// In MainStack:
<Stack.Screen 
  name="CustomerDetails" 
  component={CustomerDetailsScreen}  // Changed from PlaceholderScreen
  options={...}
/>
```

### Styling
Use the theme system for consistent styling:

```javascript
import { theme } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgPrimary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
});
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native](https://reactnative.dev/)

## 🐛 Troubleshooting

### Metro bundler not starting
```bash
npx expo start --clear
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Expo Go not connecting
- Ensure phone and computer on same WiFi
- Disable VPN
- Try manual connection (type URL from terminal)

## 📈 Progress

- **Infrastructure**: 100% ✅
- **Authentication**: 100% ✅
- **Navigation**: 100% ✅
- **Dashboard**: 100% ✅
- **Customers**: 100% ✅
- **Remaining Screens**: ~40% 🚧

## 🎯 Next Steps

1. **Build Customer Details** (WhatsApp-style chat UI)
2. **Build Add Customer** (simple form)
3. **Build Add Transaction** (with image picker)
4. **Build remaining screens** (Products, Invoice, Transactions)
5. **Add animations** (optional polish)
6. **Build production app** (EAS Build)

## 📝 License

Part of Kathape-React-Business project.

---

**Built with ❤️ using React Native + Expo**
