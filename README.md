# Commit to Together ❤️

A personalized romantic interactive web experience built with **React 19**, **Vite**, **Framer Motion**, **Lucide React**, and **Canvas Confetti**.

The project is designed as a private, customizable digital experience with personalized messages, memories, photos, music, animations, and a secret-password entry flow.

## ✨ Highlights

- 💖 Personalized romantic content
- 🔐 Secret-password gated experience
- 🎞️ Smooth animations with Framer Motion
- 📸 Support for custom photos
- 🎵 Optional background music
- 🎉 Celebration effects with Canvas Confetti
- 🖥️ Responsive Vite + React frontend
- 🎨 Icon support through Lucide React

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| React 19 | UI development |
| Vite 7 | Development server and build tooling |
| Framer Motion | Animations and transitions |
| Lucide React | UI icons |
| Canvas Confetti | Celebration effects |
| JavaScript | Application logic |

## 📁 Project Structure

```text
commit-to--together/
├── README.md
└── her-little-universe/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── public/
    │   ├── photos/
    │   └── music/
    └── src/
        └── main.jsx
```

## 🚀 Getting Started

Clone the repository and move into the application directory:

```bash
git clone https://github.com/shivamsharmakr04/commit-to--together.git
cd commit-to--together/her-little-universe
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in your terminal.

## 🎨 Personalization

The main personalized content is stored in the `DATA` object near the top of:

```text
her-little-universe/src/main.jsx
```

You can customize:

- `herName`
- `nickname`
- `yourName`
- `secretPassword`
- reasons
- memories
- future plans
- final message

## 📸 Add Photos

Place your images in:

```text
her-little-universe/public/photos/
```

Example:

```text
public/photos/photo1.jpg
public/photos/photo2.jpg
public/photos/photo3.jpg
```

## 🎵 Add Music

Place your audio file at:

```text
her-little-universe/public/music/our-song.mp3
```

The music starts after a user interaction because modern browsers generally restrict automatic audio playback.

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## ☁️ Deployment

The app can be deployed to platforms that support Vite, including **Vercel** and **Netlify**.

For Vercel, use the repository root as the project source and set the project root directory to:

```text
her-little-universe
```

Vercel can detect the Vite build configuration automatically.

## 🔒 Privacy Note

This repository contains a client-side web application. Avoid committing private photos, sensitive information, real passwords, or other personal data that should not be publicly accessible.

## 📄 License

No license has been specified yet.
