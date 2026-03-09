# DOOR GREETER, SEKBID 1!

This is a member selection app built in Firebase Studio for DOOR GREETER, SEKBID 1!. It is designed to facilitate equitable member selection for community greeting duties.

## 🚀 How to Upload to GitHub

Firebase Studio is a prototyping environment. To move your project to GitHub, follow these steps:

### 1. Download the Project
Click the **Download** button in the Firebase Studio header (top right). This will give you a ZIP file containing all your code and configuration.

### 2. Prepare Locally
1. Extract the ZIP file to a folder on your computer.
2. Open your terminal (or Command Prompt) inside that folder.

### 3. Initialize & Push
Run these commands one by one. Replace `<YOUR_NEW_REPOSITORY_URL>` with the URL of a new, empty repository you've created on GitHub.

```bash
# Initialize git
git init

# Add all files (the .gitignore will automatically hide unnecessary files)
git add .

# Create the first commit
git commit -m "Initial commit from Firebase Studio"

# Set the branch to main
git branch -M main

# Link to your GitHub repo
git remote add origin <YOUR_NEW_REPOSITORY_URL>

# Push the code
git push -u origin main
```

## Features
- **Equitable Selection:** The app automatically puts the most recently selected person at the bottom of the list.
- **Scrolling Categories:** Balanced 3-column layout on desktop that remains readable on mobile.
- **Bulk Selection:** Copy a team of suggested members and increment their frequency in one click.
- **Selection History:** Logs every selection with the ability to undo.
- **Admin Mode:** Secure management of members (Password: `sekbid1haleluya`).

## Deployment
Once your code is on GitHub, you can connect it to [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) in the Firebase Console for automatic live deployments.

---
*Sekbid 1 Haleluya!*
