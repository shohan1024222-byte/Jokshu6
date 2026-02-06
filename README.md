# JOKSHU Voting System (New)
## জগন্নাথ বিশ্ববিদ্যালয় কেন্দ্রীয় ছাত্র সংসদ নির্বাচন ২০২৬

A mobile voting application for JOKSU (Jagannath University Kendrio Chhatra Sangsad) elections built with React Native and Expo.

This is an optimized version for expo.dev deployment and APK generation.

## 🎯 Features

- **Student Authentication**: Secure login with Student ID and password
- **Candidate Browsing**: View all candidates with their symbols, departments, and manifestos
- **Position-wise Voting**: Vote for candidates in 10 different positions
- **Real-time Results**: Track election progress and results
- **Admin Panel**: Manage election state, view detailed analytics, and reset data
- **ID Card Scanning**: Verify student identity before voting

## 🗳️ Election Positions

1. **VP** - সহ-সভাপতি (Vice President)
2. **GS** - সাধারণ সম্পাদক (General Secretary)
3. **AGS** - সহ-সাধারণ সম্পাদক (Assistant General Secretary)
4. **OS** - সাংগঠনিক সম্পাদক (Organizing Secretary)
5. **PS** - প্রচার সম্পাদক (Publicity Secretary)
6. **SS** - সমাজসেবা সম্পাদক (Social Service Secretary)
7. **CS** - সাংস্কৃতিক সম্পাদক (Cultural Secretary)
8. **SPS** - ক্রীড়া সম্পাদক (Sports Secretary)
9. **IS** - আন্তর্জাতিক সম্পাদক (International Secretary)
10. **LS** - গ্রন্থাগার সম্পাদক (Library Secretary)

## 🚀 Building for Production

### Prerequisites for APK Build

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure project:
```bash
eas build:configure
```

### Build APK
```bash
# For preview (internal testing)
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

## 🔑 Demo Credentials

### Student Login:
- **Student ID**: `2022331001` | Password: `123456`
- **Student ID**: `4155` | Password: `123456`

### Admin Login:
- **Student ID**: `admin` | Password: `admin123`

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript** - Type safety
- **React Navigation 6** - Navigation library
- **AsyncStorage** - Local data persistence
- **Context API** - State management
- **EAS Build** - Production builds

---

**Jagannath University, Dhaka-1100, Bangladesh**

জয় জগন্নাথ! 🎓