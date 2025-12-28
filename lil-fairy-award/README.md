# Lil Fairy Award - Production Build

This is a production-ready classroom management application with Supabase backend integration. Teachers can award points to students, track progress, and manage classes with real-time updates.

## Features Implemented

### 1. Supabase Backend Integration
- **Auto-Fetch on Load**: Uses React useEffect hooks in the Root Layout to fetch the Teacher's profile and classes immediately upon session detection.
- **Instant Point Persistence**: When a point is awarded, the app triggers a background INSERT to points_log and an UPDATE to the student's total_stars/total_reminders in the students table simultaneously.
- **Smart Roster Management**: When a student is added or deleted, the database reflects this immediately with cascade delete logic.

### 2. Real-Time "Zero-Latency" Feed
- **Supabase Realtime listeners** on the points_log table
- Any new entry in the database automatically pushes an update to the "Live Snapshot" UI component
- Updates happen across all active sessions (if a teacher awards a point on a phone, the classroom projector updates instantly)

### 3. Production Media Handling (Avatars)
- **Automatic Upload**: In the Account and Roster settings, whenever a file is selected, it automatically uploads to the avatars bucket
- **Public URL Resolution**: Stores only the file path in the database with a helper function to automatically resolve the Public URL for display in the UI

### 4. Seamless State Management
- **Global state** using React Context as the "Source of Truth" from Supabase
- All charts, game data, and student cards react to this global state automatically
- When the database changes, the UI changes

### 5. Reliability
- **Silent Retries**: If a network blip occurs, the app silently retries the database operation in the background without interrupting the teacher's workflow

## Database Structure

The application uses the following Supabase tables:
- `teachers` - Teacher profiles and settings
- `classes` - Class information linked to teachers
- `students` - Student information linked to classes
- `tasks` - Award types and categories
- `points_log` - Record of all awarded points with real-time listeners

## How to Use

1. **Class Management**: Select and create classes using the class selector
2. **Student Management**: Add students to classes with avatars
3. **Award Points**: Click on a student card to award positive or reminder points
4. **Real-Time Feed**: Watch the Live Snapshot for instant updates across all sessions
5. **Account Settings**: Update profile information and avatar in the settings

## Technical Implementation

- **Supabase Client**: Initialized with provided credentials
- **Error Handling**: Silent retries with exponential backoff
- **Avatar Utilities**: Helper functions for resolving public URLs
- **Real-time Updates**: PostgreSQL change listeners for live updates
- **Auto-Sync**: All operations automatically persist to database without manual sync triggers

## Credentials

The application is configured with the following Supabase credentials:
- **URL**: https://jbmpfczuyspgxgqvejuf.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibXBmY3p1eXNwZ3hncXZlanVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NzI0NjUsImV4cCI6MjA4MjQ0ODQ2NX0.B-pyr_bsUYpU8eHAvBR-HWqj33ocEJw7EfCtFs8Meko
