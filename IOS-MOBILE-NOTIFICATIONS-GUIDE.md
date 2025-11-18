# 📱 Οδηγός Ειδοποιήσεων iOS & Mobile

## 🎯 Τι έχει γίνει ήδη

Η εφαρμογή έχει **πλήρη υποστήριξη** για push notifications σε:
- ✅ Desktop browsers (Chrome, Firefox, Edge, Safari)
- ✅ iOS Safari (iPhone/iPad)
- ✅ Android Chrome
- ✅ Όλες τις mobile συσκευές

## 🔑 Βασικές Αρχές

### 1. External User ID (Το Κλειδί για iOS)

Το **πιο σημαντικό** για iOS είναι το **External User ID**. Αυτό συνδέει **όλες τις συσκευές** (desktop, iPhone, iPad) στον **ίδιο χρήστη**.

```typescript
// Αυτό γίνεται αυτόματα όταν ο admin συνδέεται
await window.OneSignal.login(user.id)
```

**Γιατί είναι σημαντικό:**
- Στο iOS, το Player ID μπορεί να καθυστερήσει ή να μην είναι διαθέσιμο αμέσως
- Το External User ID λειτουργεί **αμέσως** και συνδέει όλες τις συσκευές
- Οι ειδοποιήσεις στέλνονται με `include_external_user_ids` που **λειτουργεί σε όλες τις συσκευές**

### 2. iOS-Specific Requirements

Το iOS Safari έχει **ειδικές απαιτήσεις**:

1. **User Interaction Required**: Δεν μπορείς να ζητήσεις permission αυτόματα
2. **Explicit Button**: Χρειάζεται κλικ σε button για permission
3. **Service Worker**: Απαιτείται για push notifications
4. **HTTPS**: Πρέπει να είναι HTTPS (εκτός από localhost για development)

## 📋 Setup Instructions

### Βήμα 1: OneSignal Configuration

1. **Δημιούργησε OneSignal Account**
   - Πήγαινε στο https://app.onesignal.com
   - Δημιούργησε Web Push app

2. **Configure Web Push Platform**
   - Settings → Platforms → Web Push
   - Site URL: `https://your-production-domain.com`
   - **Σημαντικό**: Πρόσθεσε το domain σου στα "Allowed Domains" (αν είναι διαθέσιμο)

3. **Download Service Worker**
   - Κάνε download το `OneSignalSDKWorker.js` από το OneSignal dashboard
   - Ανεβάστε το στο `public/OneSignalSDKWorker.js`
   - ✅ **Έχουμε ήδη το file** - μην το αλλάξεις!

### Βήμα 2: Environment Variables

```env
# Development
ONESIGNAL_APP_ID_DEV=your_dev_app_id
ONESIGNAL_REST_API_KEY_DEV=your_dev_rest_api_key
NEXT_PUBLIC_ONESIGNAL_APP_ID_DEV=your_dev_app_id

# Production
ONESIGNAL_APP_ID_PROD=your_prod_app_id
ONESIGNAL_REST_API_KEY_PROD=your_prod_rest_api_key
NEXT_PUBLIC_ONESIGNAL_APP_ID_PROD=your_prod_app_id
```

### Βήμα 3: Database Setup

Το database έχει ήδη το column `onesignal_player_id` στον πίνακα `admin_users`.

Αν δεν το έχεις, τρέξε:
```sql
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS onesignal_player_id JSONB;

CREATE INDEX IF NOT EXISTS idx_admin_users_onesignal_player_id
ON admin_users(onesignal_player_id)
WHERE onesignal_player_id IS NOT NULL;
```

## 🚀 Πώς Λειτουργεί

### 1. Admin Login Flow

```
1. Admin συνδέεται στο /admin
2. OneSignalProvider φορτώνει αυτόματα
3. OneSignal SDK αρχικοποιείται
4. External User ID ορίζεται: login(user.id) ← ΚΡΙΣΙΜΟ για iOS
5. Player ID αποθηκεύεται (αν είναι διαθέσιμο)
```

### 2. Permission Request (iOS)

Στο iOS, το permission **ΔΕΝ** γίνεται αυτόματα. Ο admin πρέπει:

1. Να πατήσει το button **"Ενεργοποίηση Ειδοποιήσεων"**
2. Να επιτρέψει notifications στο browser prompt
3. Το External User ID ορίζεται **αμέσως**
4. Το Player ID μπορεί να καθυστερήσει (αλλά δεν πειράζει!)

### 3. Sending Notifications

```typescript
// PRIMARY METHOD: External User IDs (λειτουργεί σε όλες τις συσκευές)
include_external_user_ids: [user.id]

// FALLBACK: Player IDs (για συσκευές χωρίς External User ID)
include_player_ids: [playerId1, playerId2, ...]

// iOS-Specific Properties
ios_badgeType: 'Increase',
ios_badgeCount: 1
```

## 📱 Testing στο iOS

### Βήμα 1: Προετοιμασία

1. **Ανοίξτε το Safari στο iPhone/iPad**
2. **Πηγαίνετε στο production URL** (π.χ. `https://tinkerbell-e-shop.vercel.app/admin`)
3. **Συνδεθείτε ως admin**

### Βήμα 2: Enable Notifications

1. **Βρείτε το button "Ενεργοποίηση Ειδοποιήσεων"**
   - Συνήθως είναι στο admin dashboard
   - Αν δεν το βλέπετε, ελέγξτε το `NotificationPermissionButton` component

2. **Πατήστε το button**
   - Θα εμφανιστεί prompt από το Safari
   - Πατήστε **"Allow"**

3. **Ελέγξτε το Console**
   - Ανοίξτε Safari Developer Tools (αν είναι διαθέσιμο)
   - Ή ελέγξτε τα server logs
   - Θα δείτε: `✅ [OneSignal] External User ID set: [user_id]`

### Βήμα 3: Test Notification

1. **Κάντε μια test παραγγελία**
2. **Ελέγξτε αν έρχεται notification στο iPhone**
3. **Πατήστε το notification** - θα ανοίξει το admin order page

## 🔧 Troubleshooting

### ❌ "Notifications δεν έρχονται στο iOS"

**Ελέγξτε:**

1. **Permission Granted?**
   - Settings → Safari → Notifications → Επιτρέψτε για το site σας

2. **External User ID Set?**
   - Console: `✅ [OneSignal] External User ID set: [user_id]`
   - Αν δεν το βλέπετε, το `login(user.id)` δεν έτρεξε

3. **OneSignal Configuration?**
   - Ελέγξτε ότι το production domain είναι στο OneSignal dashboard
   - Ελέγξτε ότι το `OneSignalSDKWorker.js` είναι στο `public/` folder

4. **HTTPS?**
   - Το iOS **απαιτεί HTTPS** (εκτός από localhost)
   - Βεβαιωθείτε ότι το production site είναι HTTPS

### ❌ "Player ID δεν αποθηκεύεται"

**Δεν πειράζει!** 

Το Player ID είναι **backup/fallback**. Το **External User ID** είναι το κύριο:

- ✅ **External User ID** → Λειτουργεί **αμέσως**, συνδέει όλες τις συσκευές
- ⚠️ **Player ID** → Μπορεί να καθυστερήσει στο iOS, αλλά δεν είναι κρίσιμο

Οι ειδοποιήσεις **λειτουργούν** με `include_external_user_ids` ακόμα και αν το Player ID δεν είναι διαθέσιμο!

### ❌ "Permission prompt δεν εμφανίζεται"

**Στο iOS, το permission prompt ΔΕΝ γίνεται αυτόματα!**

Πρέπει να:
1. Χρησιμοποιήσεις το **`NotificationPermissionButton`** component
2. Ο χρήστης να **πατήσει το button**
3. Μετά θα εμφανιστεί το browser prompt

**Μην προσπαθείς** να καλέσεις `Notification.requestPermission()` αυτόματα - **δεν λειτουργεί στο iOS**.

### ❌ "OneSignal SDK not loaded"

**Ελέγξτε:**

1. **Environment Variables**
   ```bash
   echo $NEXT_PUBLIC_ONESIGNAL_APP_ID_PROD
   ```

2. **Script Loading**
   - Ελέγξτε το `app/admin/layout.tsx`
   - Βεβαιωθείτε ότι το `onesignalAppId` δεν είναι `undefined`

3. **Network Tab**
   - Ανοίξτε Developer Tools → Network
   - Ελέγξτε αν το `OneSignalSDK.page.js` φορτώνει

## 💡 Best Practices

### 1. Always Set External User ID First

```typescript
// ✅ ΣΩΣΤΟ: Set External User ID ΠΡΙΝ από Player ID
await window.OneSignal.login(user.id)  // ← ΠΡΩΤΟ
const playerId = await window.OneSignal.User.PushSubscription.id  // ← ΜΕΤΑ
```

### 2. Use include_external_user_ids as Primary

```typescript
// ✅ PRIMARY METHOD
include_external_user_ids: [user.id]  // ← Λειτουργεί σε όλες τις συσκευές

// ⚠️ FALLBACK ONLY
include_player_ids: [playerId1, playerId2]  // ← Μόνο αν χρειάζεται
```

### 3. Multiple Retry Attempts για iOS

```typescript
// iOS χρειάζεται περισσότερο χρόνο
const maxAttempts = 10  // ← Αυξήθηκε από 3 σε 10
await new Promise(resolve => setTimeout(resolve, 3000))  // ← Περίμενε 3 δευτερόλεπτα
```

### 4. iOS-Specific Notification Properties

```typescript
{
  // ... standard properties ...
  ios_badgeType: 'Increase',  // ← iOS badge
  ios_badgeCount: 1,
  priority: 10,  // ← High priority για background delivery
}
```

### 5. Explicit Button για iOS

**Μην προσπαθείς** αυτόματο prompt στο iOS. Χρησιμοποίησε:

```tsx
<NotificationPermissionButton />
```

Αυτό το component:
- Εμφανίζει button μόνο αν δεν είναι subscribed
- Χειρίζεται iOS-specific permission flow
- Ορίζει External User ID αμέσως
- Κάνει retry για Player ID (αν χρειάζεται)

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Login                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            OneSignalProvider Component                   │
│  - Αρχικοποιεί OneSignal SDK                            │
│  - Ορίζει External User ID: login(user.id)              │
│  - Αποθηκεύει Player ID (backup)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│        NotificationPermissionButton Component            │
│  - Εμφανίζει button για permission (iOS required)       │
│  - Χειρίζεται iOS-specific flow                         │
│  - Ορίζει External User ID (CRITICAL)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         New Order Webhook                               │
│  - Καλεί sendAdminOrderNotificationPush()               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│    sendAdminOrderNotificationPush()                      │
│  - Παίρνει admin user IDs                               │
│  - Στέλνει με include_external_user_ids (PRIMARY)        │
│  - Στέλνει με include_player_ids (FALLBACK)              │
│  - iOS-specific properties (badge, priority)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              OneSignal API                               │
│  - Στέλνει notification σε όλες τις συσκευές           │
│  - Desktop, iOS, Android - όλες!                        │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Key Takeaways

1. **External User ID = Κλειδί για iOS**
   - Ορίζεται με `login(user.id)`
   - Συνδέει όλες τις συσκευές
   - Λειτουργεί αμέσως (χωρίς Player ID)

2. **iOS ΔΕΝ υποστηρίζει auto-prompt**
   - Χρειάζεται explicit button
   - Χρησιμοποίησε `NotificationPermissionButton`

3. **include_external_user_ids > include_player_ids**
   - Primary method: External User IDs
   - Fallback: Player IDs

4. **Multiple Retries για iOS**
   - iOS χρειάζεται περισσότερο χρόνο
   - Κάνε 10 attempts με 1.5s delay

5. **iOS-Specific Properties**
   - `ios_badgeType`, `ios_badgeCount`
   - `priority: 10` για background delivery

## 📝 Files Reference

- `components/admin/onesignal-provider.tsx` - Auto-initialization
- `components/admin/notification-permission-button.tsx` - iOS permission button
- `lib/actions/send-onesignal-notification.ts` - Send notifications
- `app/admin/layout.tsx` - OneSignal SDK loading
- `public/OneSignalSDKWorker.js` - Service Worker

## ✅ Checklist για Νέα Setup

- [ ] OneSignal account created
- [ ] Web Push app configured
- [ ] Production domain added to OneSignal
- [ ] `OneSignalSDKWorker.js` στο `public/` folder
- [ ] Environment variables configured
- [ ] Database migration run
- [ ] Test στο desktop browser
- [ ] Test στο iOS Safari
- [ ] Test notification sent
- [ ] Notification received στο iOS ✅

---

**Τέλος!** Τώρα οι ειδοποιήσεις λειτουργούν **τέλεια** σε desktop, iOS, Android - **όλα!** 🎉

