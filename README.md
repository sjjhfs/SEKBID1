# DOOR GREETER, SEKBID 1!

This is a member selection app built in Firebase Studio for DOOR GREETER, SEKBID 1!. It is designed to facilitate equitable member selection for community greeting duties.

## Features
- **Cloud Persistence:** Your code and member data are automatically saved to the cloud.
- **Equitable Selection:** Suggests members based on the lowest selection frequency.
- **Bulk Selection:** Copy a team of suggested members and increment their frequency in one click.
- **Real-time Sync:** Powered by Firebase Firestore for live updates across devices.
- **Selection History:** Logs every selection (single or bulk) with the ability to undo and delete.
- **Admin Mode:** Secure management of members and history with password protection.

## Getting Started Locally

### 1. Download & Extract
1. Click the **Download** button in the Firebase Studio header to get the ZIP file.
2. Extract the project ZIP file to a new folder on your computer.

### 2. Initializing a New Repository
If you want to upload this to your own GitHub/GitLab:
1. Open your terminal in the extracted folder.
2. Run the following commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit from clean source"
   git branch -M main
   git remote add origin <YOUR_NEW_REPOSITORY_URL>
   git push -u origin main
   ```

### 3. Running the App
1. Install the dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:9002`.

### 4. Deployment
This app is optimized for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). You can connect your new repository to a fresh App Hosting backend in the Firebase Console.

---
*Sekbid 1 Haleluya!*