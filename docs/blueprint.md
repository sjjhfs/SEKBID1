# **App Name**: FairGreeter

## Core Features:

- Member Display & Grouping: Displays all 'INTI' and 'ANGGOTA' members in separate tables, each with their name and current selection frequency.
- Greeter Selection & Frequency Tracking: Allows users to tap a 'Select' button next to a member's name, incrementing their selection frequency by one.
- Real-time Firebase Data Management: Utilizes Firebase Realtime Database to store member selection data, ensuring real-time synchronization across all users and atomic updates to prevent data loss.
- Data Initialization & Persistence: Automatically initializes all member frequencies to 0 if the database is empty, and ensures all selection data persists across application sessions.
- Dynamic Sorting & Priority Highlighting: Automatically sorts both member tables from lowest to highest frequency and visually highlights members with the lowest selection count.
- Overall Statistics Display: Displays key statistics at the top, including the total number of selections made and the count of members selected at least once.
- Admin Data Reset Function: Provides an admin-only 'Reset All Data' button, protected by a simple password, to set all member frequencies back to zero.

## Style Guidelines:

- Primary interactive color: A dependable blue (#4B0084) symbolizing organization and clarity, used for active elements and accents.
- Background color: A very light, subtle blue-gray (#121214) providing a clean and calm canvas for content.
- Accent color: A vibrant cyan (#845394) to draw attention to call-to-action buttons and important feedback.
- Priority highlight color: A light, soft red (#FF7F7F) for highlighting members with the lowest selection frequency, as per requirement.
- Headline and body font: 'Inter' (sans-serif) for its modern, neutral, and highly readable qualities, suitable for clear data presentation on all screen sizes.
- Mobile-first design with two distinct sections ('INTI' and 'ANGGOTA') presented as cleanly labeled tables, ensuring usability on small screens.
- Each member row should have a 'frame-like' appearance, making individual members visually distinct and easier to interact with.
- Ensure 'Select' buttons are large and easy to tap, alongside intuitive UI elements for statistics and general navigation.
- Subtle visual feedback animations on button presses and frequency updates to confirm user actions without distraction.