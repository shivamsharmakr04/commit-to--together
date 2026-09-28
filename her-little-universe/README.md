# Her Little Universe ❤️

A personalized romantic website built with **React 19**, **Vite**, **Framer Motion**, **Lucide React**, and **Canvas Confetti**.

## 🚀 Run Locally

From this directory:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## ✨ Features

- Personalized names, memories, reasons, future plans, and messages
- Secret-password entry flow
- Smooth animated interactions
- Custom photos
- Optional background music
- Celebration effects

## 🎨 Personalize

Open:

```text
src/main.jsx
```

Then edit the `DATA` object near the top:

- `herName`
- `nickname`
- `yourName`
- `secretPassword`
- reasons
- memories
- future plans
- final message

## 📸 Photos

Add images to:

```text
public/photos/
```

Example:

```text
public/photos/photo1.jpg
public/photos/photo2.jpg
public/photos/photo3.jpg
```

## 🎵 Music

Add your audio file here:

```text
public/music/our-song.mp3
```

Playback begins after the user clicks the music control because browsers restrict automatic audio playback.

## 📦 Build

```bash
npm run build
npm run preview
```

## ☁️ Deploy

The app is ready to deploy on Vercel or Netlify. When deploying from the repository, use `her-little-universe` as the application root directory.
