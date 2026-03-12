# Dashboard Wireframe & UI Design

This document describes the user interface for the Mobile App Monitoring System.

## Visual Mockup
![Dashboard Mockup](file:///C:/Users/Nicolas%20France/.gemini/antigravity/brain/3d534f12-10a5-48e6-8faf-e883c394d457/app_monitoring_dashboard_mockup_1773346129306.png)

## Layout Breakdown

### 1. Sidebar (Navigation)
- **Dashboard**: Link to the main table view.
- **App Management**: Add/Remove apps to monitor.
- **Store Credentials**: Securely manage API Keys/Service Accounts.
- **Settings**: Notification preferences (Email/Slack).

### 2. Header
- **Search bar**: Filter apps by name or bundle ID.
- **Sync Status**: Indicator of the last manual/auto sync.
- **User Profile**: Profile and logout.

### 3. Summary Cards (KPIs)
- **Total Apps**: Count of all monitored apps.
- **Issues/Alerts**: Count of Rejected or Action Required states.
- **In Review**: Count of apps currently being reviewed by stores.

### 4. Main Table (The Core)
| Column | Component | Description |
|--------|-----------|-------------|
| Platform | Icon | Apple or Google Play logo. |
| App Name | Text | Name of the app + Bundle ID. |
| Version | Badge | Current version + build number. |
| Status | StatusBadge | Color-coded status (e.g., 🟢 Productiva). |
| Last Sync | Date | Time elapsed since last update. |
| Actions | Buttons | "Refresh" specific app / "View Logs". |

## UX Interaction
- **Filtering**: Instant filtering by Platform (iOS/Android) and Status.
- **Manual Sync**: A global 'Sync All' button to trigger immediate API polling.
- **Details Modal**: Clicking an app row opens a modal with the full review history and rejection messages if applicable.
