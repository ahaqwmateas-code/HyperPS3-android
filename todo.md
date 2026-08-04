# HyperPS3 Dashboard — Development Roadmap

## Database & Schema
- [x] Create `bugReports` table (gameSerial, deviceInfo, issueDescription, status, createdAt, userId)
- [x] Create `gameCompatibility` table (gameTitle, gameSerial, recommendedSettings, createdAt)
- [x] Create `performanceProfiles` table (name, configYaml, description, createdAt)
- [x] Create `emulatorVersions` table (version, changelogText, downloadUrl, releaseDate, isLatest)
- [x] Create `notifications` table (userId, type, message, isRead, createdAt)
- [x] Create `settingsGuide` table (categoryName, settingKey, description, recommendedValue, createdAt)

## Backend API & Services
- [x] Implement bug report submission endpoint (POST /api/trpc/bugReports.submit)
- [x] Implement bug report listing for admins (GET /api/trpc/bugReports.list)
- [x] Implement bug report status update (PATCH /api/trpc/bugReports.update)
- [x] Implement game compatibility search (GET /api/trpc/gameCompatibility.search)
- [x] Implement performance profile download (GET /api/trpc/profiles.download)
- [x] Implement emulator version tracker (GET /api/trpc/versions.latest)
- [x] Implement settings guide data endpoint (GET /api/trpc/settingsGuide.list)
- [x] Create Smart Fix Bot service (LLM-powered diagnostics)
- [ ] Create LLM chat assistant service (site-wide chat)
- [ ] Implement email notification service
- [ ] Implement in-app notification service
- [ ] Setup scheduled job for APK release checking

## Frontend Pages & Components
- [x] Build landing page with hero section and feature highlights
- [x] Build game compatibility search page
- [ ] Build settings guide page (Core, Video, Audio categories)
- [x] Build performance profiles page with download buttons
- [ ] Build emulator update tracker page
- [x] Build bug report submission form page
- [ ] Build user dashboard (view submitted reports, notifications)
- [x] Build admin dashboard (view all reports, mark as fixed, publish notes)
- [x] Embed Smart Fix Bot chatbot on relevant pages
- [ ] Embed LLM chat assistant site-wide

## UI Components & Design
- [ ] Design and implement premium color palette and typography
- [ ] Create reusable card components for game listings
- [ ] Create settings category accordion components
- [ ] Create profile download card components
- [ ] Create bug report list table component
- [ ] Create chat interface component for bots
- [ ] Create notification toast/banner components
- [ ] Implement responsive design for mobile and desktop

## Authentication & User Management
- [ ] Verify Manus OAuth integration is working
- [ ] Implement user role system (admin, user)
- [ ] Protect admin dashboard routes
- [ ] Add user profile page

## Testing & Quality
- [ ] Write vitest tests for bug report submission
- [ ] Write vitest tests for game compatibility search
- [ ] Write vitest tests for profile generation
- [ ] Write vitest tests for notification service
- [ ] Test all LLM integrations
- [ ] Test email notification delivery
- [ ] Perform cross-browser testing

## Deployment & Launch
- [ ] Create checkpoint before final deployment
- [ ] Deploy to production
- [ ] Setup monitoring and error tracking
- [ ] Create user documentation

## Completed Features
- [x] Project initialized with web-db-user scaffold
- [x] SmartFixEngine integrated into HyperPS3 APK
- [x] Boot watchdog and session tracking implemented
