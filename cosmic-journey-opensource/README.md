# Cosmic Journey

An interactive cosmic visualization web application built with React, Three.js, and React Three Fiber.

![Cosmic Journey Screenshot](./screenshot.png)

## 🌠 Features

- **Interactive Cosmic Scene**: A 3D visualization of space with planets, stars, and galaxies
- **Mouse-Responsive Elements**: All cosmic elements respond to mouse movements with parallax effects
- **Retro Earth Logo**: A customizable Earth logo with both 2D (SVG) and 3D (Three.js) versions
- **Performance Optimized**: Memoization, throttling, and other optimizations for smooth animations

## 🚀 Demo

Check out the interactive demo at [https://cosmic-journey.example.com](https://cosmic-journey.example.com)

## 💻 Tech Stack

- **React**: For UI components and state management
- **Three.js / React Three Fiber**: For 3D visualization
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cosmic-journey.git
   cd cosmic-journey
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cosmic-journey/
├── components/          # React components
│   ├── CosmicScene.tsx  # Main 3D space visualization
│   ├── RetroEarthLogo.tsx # Earth logo (2D and 3D versions)
│   └── Navbar.tsx       # Navigation component
├── pages/               # Next.js pages
│   ├── index.tsx        # Home page
│   ├── interactive-demo.tsx # Interactive demo page
│   └── logo.tsx         # Logo showcase page
├── public/              # Static assets
│   ├── images/          # General images
│   └── textures/        # Textures for 3D objects
└── styles/              # CSS styles
```

## 🎮 Usage

### CosmicScene Component

The `CosmicScene` component is the main 3D visualization:

```jsx
<CosmicScene 
  currentSection="interactive" 
  scrollPosition={0} 
/>
```

Props:
- `currentSection`: Controls which cosmic section to show ("earth", "solar-system", "galaxy", "universe", "interactive")
- `scrollPosition`: Used for scroll-based animations

### RetroEarthLogo Component

The `RetroEarthLogo` component is available in both 2D and 3D versions:

```jsx
<RetroEarthLogo 
  type="2d" // or "3d"
  size={120}
  pixelated={true}
  animated={true}
  interactive={true}
/>
```

Props:
- `type`: "2d" (SVG) or "3d" (Three.js)
- `size`: Size in pixels
- `pixelated`: Apply retro pixelated effect
- `animated`: Enable animations
- `interactive`: Make logo responsive to mouse movements

## 🧪 Performance Tips

For optimal performance:
1. Use memoization for expensive calculations
2. Throttle mouse events to reduce render frequency
3. Use `requestAnimationFrame` for smooth animations
4. Implement texture caching for 3D objects

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/cosmic-journey](https://github.com/yourusername/cosmic-journey) 