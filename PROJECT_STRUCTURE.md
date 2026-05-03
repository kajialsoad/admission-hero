# Admission Hero - Project Structure

## 📊 Project Statistics
- **Total Files:** 311
- **Total Words:** ~240,338
- **Graph Nodes:** 2,790
- **Graph Edges:** 6,519
- **Communities:** 77

## 🏗️ Architecture Overview

### Backend (Node.js/Express)
**Location:** `backend/`

**Key Components:**
- **Models:** `backend/src/models/`
  - User.ts
  - AppContent.ts (NEW)
  - Settings.ts
  - Exam.ts, Question.ts, etc.

- **Controllers:** `backend/src/controllers/`
  - authController.ts
  - appContentController.ts (NEW)
  - adminController.ts
  - examController.ts, etc.

- **Routes:** `backend/src/routes/`
  - auth.ts
  - appContent.ts (NEW)
  - settings.ts
  - admin.ts, etc.

- **Services:** `backend/src/services/`
  - emailService.ts
  - notificationService.ts

**API Endpoints:**
```
/api/auth          - Authentication
/api/users         - User management
/api/app-content   - Content management (NEW)
/api/settings      - Settings
/api/admin         - Admin operations
/api/exams         - Exam management
/api/questions     - Question management
/api/subscription  - Subscription
/api/payments      - Payment processing
```

---

### Admin Dashboard (Next.js)
**Location:** `admin-dashboard/`

**Pages:**
- `/dashboard` - Main dashboard
- `/dashboard/users` - User management
- `/dashboard/packages` - Package management
- `/dashboard/promo-codes` - Promo codes
- `/dashboard/questions` - Question management
- `/dashboard/universities` - University management
- `/dashboard/payments` - Payment tracking
- `/dashboard/settings` - Settings (Contact info, Payment methods)
- `/dashboard/app-content` - **App Content Management (NEW)**

**Key Features:**
- Redux store for state management
- RTK Query for API calls
- Shadcn UI components
- Responsive design

---

### Flutter Mobile App
**Location:** `admission_hero_flutter/`

**Screens:**
```
lib/screens/
├── auth/
│   ├── auth_screen.dart
│   └── forgot_password_screen.dart
├── home/
│   ├── home_screen.dart
│   ├── question_sets_screen.dart
│   ├── unit_selection_screen.dart
│   └── session_selection_screen.dart
├── exam/
│   ├── exam_screen.dart
│   ├── exam_result_screen.dart
│   └── practice_screen.dart
├── subscription/
│   └── new_subscription_screen.dart
├── profile/
│   ├── profile_screen.dart
│   ├── edit_profile_screen.dart
│   ├── support_screen.dart
│   └── performance_screen.dart
├── settings/
│   └── settings_screen.dart (UPDATED)
├── content/
│   └── app_content_screen.dart (NEW)
├── chat/
│   └── chat_screen.dart
├── notifications/
│   └── notifications_screen.dart
└── offline/
    └── offline_exams_screen.dart
```

**Providers:**
- AuthProvider
- ExamProvider
- UniversityProvider
- SubscriptionProvider
- FirebaseProvider

**Services:**
- ApiService
- AppContentService (NEW)
- SettingsService (NEW)
- SubscriptionService
- NotificationService
- OfflineService
- ChatService
- AnalyticsService

---

## 🆕 Recent Changes (App Content Management)

### Backend Changes:
1. **New Model:** `AppContent.ts`
   - Stores dynamic content (About, Privacy Policy, Terms, etc.)
   - Draft/Published status
   - Version tracking

2. **New Controller:** `appContentController.ts`
   - CRUD operations for content
   - Initialize default content
   - Public and admin endpoints

3. **New Routes:** `appContent.ts`
   - GET /api/app-content (admin)
   - GET /api/app-content/:key (public)
   - POST /api/app-content (admin)
   - POST /api/app-content/initialize (admin)

### Admin Dashboard Changes:
1. **New Page:** `app-content/page.tsx`
   - Sidebar navigation for content sections
   - HTML editor
   - Draft/Publish workflow
   - Version tracking
   - Last updated info

### Flutter App Changes:
1. **Settings Screen Updated:**
   - Removed: Report Bug
   - Removed: External links
   - Added: In-app content navigation

2. **New Screen:** `app_content_screen.dart`
   - Beautiful content viewer
   - HTML rendering
   - Loading states
   - Error handling

3. **New Model:** `app_content.dart`
4. **New Service:** `app_content_service.dart`

---

## 📦 Content Sections Managed

1. **About App** - Application information
2. **Privacy Policy** - Privacy and data protection
3. **Terms & Conditions** - Terms of service
4. **Refund Policy** - Refund and cancellation
5. **Contact Us** - Contact information
6. **Support Information** - Help and support

---

## 🔗 Key Dependencies

### Backend:
- express
- mongoose
- jsonwebtoken
- firebase-admin
- socket.io
- nodemailer

### Admin Dashboard:
- next.js
- react
- redux toolkit
- shadcn/ui
- tailwindcss

### Flutter App:
- provider
- http
- firebase_core
- firebase_messaging
- shared_preferences
- flutter_widget_from_html (NEW)
- sqflite (offline storage)

---

## 🗂️ Database Schema

### MongoDB Collections:
- **users** - User accounts
- **exams** - Exam data
- **questions** - Question bank
- **universities** - University information
- **subscriptions** - Subscription records
- **payments** - Payment transactions
- **settings** - App settings
- **appcontents** - Dynamic content (NEW)
- **notifications** - Push notifications
- **chatmessages** - Chat messages

---

## 🚀 Deployment

### Backend:
- **Platform:** Railway
- **URL:** munns-production.up.railway.app
- **Auto-deploy:** On git push to main

### Admin Dashboard:
- **Platform:** Railway
- **URL:** endearing-serenity-production.up.railway.app
- **Auto-deploy:** On git push to main

### Flutter App:
- **Android:** Google Play Store
- **Build:** Manual build and upload

---

## 📝 Development Workflow

1. **Backend Development:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Admin Dashboard:**
   ```bash
   cd admin-dashboard
   npm run dev
   ```

3. **Flutter App:**
   ```bash
   cd admission_hero_flutter
   flutter run
   ```

4. **Update Graph:**
   ```bash
   graphify update
   ```

---

## 🎯 Key Features

### For Students:
- ✅ University admission preparation
- ✅ Question bank with solutions
- ✅ Practice exams
- ✅ Performance tracking
- ✅ Offline mode
- ✅ Video tutorials
- ✅ Live chat support

### For Admins:
- ✅ User management
- ✅ Content management (NEW)
- ✅ Question management
- ✅ Package management
- ✅ Payment tracking
- ✅ Analytics dashboard
- ✅ Promo code management

---

## 📊 Graph Visualization

- **Main Graph:** `graphify-out/graph.html` (3.3 MB - may be slow)
- **Tree View:** `graphify-out/GRAPH_TREE.html` (Better for navigation)
- **Report:** `graphify-out/GRAPH_REPORT.md` (Text summary)

**Note:** Due to large codebase (2790 nodes), the main graph visualization may be slow. Use the tree view for better navigation.

---

## 🔍 Finding Code

### Using Graphify:
```bash
# Find shortest path between two components
graphify path "ComponentA" "ComponentB"

# Explain a specific node
graphify explain "AppContent"

# Query the graph
graphify query "How does authentication work?"
```

### Using File Search:
- Backend: Look in `backend/src/`
- Admin: Look in `admin-dashboard/src/app/dashboard/`
- Flutter: Look in `admission_hero_flutter/lib/screens/`

---

## 📞 Support

For questions about the codebase:
1. Check `GRAPH_REPORT.md` for structure
2. Use `GRAPH_TREE.html` for navigation
3. Search in relevant directories
4. Check API documentation in controllers

---

**Last Updated:** May 3, 2026
**Graph Version:** 2790 nodes, 6519 edges
**Status:** ✅ Production Ready
