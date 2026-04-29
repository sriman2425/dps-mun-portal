# DPSA MUN Season 2 Portal

A premium management portal for Model United Nations conferences.

## Features
- **Multi-step Registration**: Collects user info, MUN preferences, and payment screenshots.
- **Role-Based Access Control (RBAC)**:
  - **Sec Gen**: Approve registrations and allocate committees/countries.
  - **Dir Gen**: View registrations and manage committees.
  - **Secretariat**: Verify payment screenshots.
  - **Participant**: Track status and view allocation details.
- **Public Pages**: Home, About, Committees, and Searchable Allocations.
- **Real-time Updates**: Powered by Firebase Firestore.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Admin Emails**:
   The logic uses the following hardcoded emails for RBAC as per requirements:
   - `dpssecgen@dpsmun.in` (Sec Gen)
   - `dpsdirgen@dpsmun.in` (Dir Gen)
   - `dpsmunaccess@dpsmun.in` (Secretariat)

4. **Run Locally**:
   ```bash
   npm run dev
   ```

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Vanilla CSS (Premium Theme)
- **Backend**: Firebase Auth, Firestore, Storage
- **Icons**: Lucide React
