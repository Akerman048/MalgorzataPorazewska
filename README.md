# Artist Portfolio Website

A dynamic artist portfolio website built with HTML, CSS and vanilla JavaScript.  
The project includes authentication, Firebase database integration, artwork categories, and an admin panel for editing website content.

## Features

- Responsive artist portfolio website
- User login system
- Firebase authentication
- Firebase database integration
- Artwork categories
- Dynamic content management
- Admin panel
- Edit text content from admin panel
- Change website colors from admin panel
- Change website fonts from admin panel
- Manage portfolio content without changing code

## Tech Stack

- HTML
- CSS
- JavaScript
- Firebase Authentication
- Firebase Firestore / Realtime Database

## Project Structure

```txt
project/
├── index.html
├── login.html
├── admin.html
├── css/
├── js/
├── assets/
└── README.md
```

## Installation

Clone the repository:

```bash
git clone your_repository_url
```

Open the project folder:

```bash
cd your_project_name
```

Install dependencies if your project uses any:

```bash
npm install
```

## Firebase Setup

Create a Firebase project and add your Firebase configuration.

Example:

```js
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
};
```

Do not commit real private keys or sensitive configuration files.

## Usage

Open the website in a browser or run it with a local development server.

Example:

```bash
npx serve
```

or use the Live Server extension in VS Code.

## Admin Panel

The admin panel allows authorized users to update:

- Text content
- Portfolio categories
- Website colors
- Website fonts
- Displayed artworks or projects

Changes are saved in Firebase and displayed dynamically on the website.

## Future Improvements

- Image upload from admin panel
- Better admin dashboard UI
- Role-based access control
- Improved form validation
- Deployment to Vercel, Netlify or Firebase Hosting

## Author

Created by Valerii Oleksiienko.
