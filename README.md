# 🌌 Cosmic Journey

An interactive web experience that offers an endless scrolling journey through the universe, blending realistic 3D visuals, smooth animations, and educational content. Users can navigate seamlessly from Earth's surface through the solar system, stars, galaxies, and beyond.

## ✨ Features

- **Infinite Scrolling**: Vertical scroll that continuously transitions between layers of space (Earth → Solar System → Galaxy → Universe).
- **Parallax 3D Effects**: Stars, planets, and galaxies react dynamically to user movements, creating a deep sense of immersion.
- **Interactive Objects**: Click on celestial bodies to reveal fun facts, animations, and detailed visuals.
- **Personalized Stargazing**: Enter your birthday to see a personalized snapshot of the night sky on that exact date with location-specific constellations.
- **Real-Time Cosmic Updates**: Displays live astronomical data like meteor showers, ISS position, and recently discovered exoplanets.
- **Accurate Astronomy Visualizations**: SVG representations of moon phases, star maps, and visible constellations based on date and location.
- **Astronomical Calculations**: Precise calculations for celestial positions, moon phases, and visible planets using astronomical algorithms.

## 🔭 Advanced Astronomy Features

- **Dynamic Star Maps**: Visualize the night sky as it appeared on any date from any location on Earth with accurate constellation positions.
- **Moon Phase Visualization**: See the exact moon phase for any date with accurate illumination percentage and visual representation.
- **Planet Visibility**: Discover which planets were visible from your location on a specific date, including their positions in the sky and brightness (magnitude).
- **Constellation Identification**: Explore the constellations that were visible based on your location, time of year, and time of day.
- **Astronomical Calculations**: All visualizations are powered by proper astronomical algorithms, not just placeholder data.

## 🚀 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Three.js, React Three Fiber, Framer Motion, GSAP, Tailwind CSS
- **3D Visualization**: WebGL, Three.js, React Three Fiber, Drei
- **Animations**: GSAP, Framer Motion
- **Styling**: Tailwind CSS
- **Astronomy Libraries**: Astronomia, SunCalc
- **Data**: Static JSON, astronomy calculations (in a production version, this would connect to NASA Open APIs, ESA data portals)

## 🛠️ Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/prafulaa/visual-website.git
cd visual-website
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create textures directory
```bash
mkdir -p public/textures
```

4. Add texture files
For this demo to work, you'll need to add planetary textures to the `public/textures` directory. You can find free planetary textures from NASA's image library or sites like Solar System Scope.

Required textures:
- earth.jpg
- sun.jpg
- mercury.jpg
- venus.jpg
- mars.jpg
- jupiter.jpg
- saturn.jpg

5. Run the development server
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser
//here is the website
https://birthday-cosmic.vercel.app/

## 🌟 Usage

- **Scroll** to navigate through the cosmic layers
- **Click** on planets and stars to reveal information
- **Fill in the form** in the Solar System section to see your birthday's night sky
  - Enter your birth date and location (city name or latitude,longitude coordinates)
  - View a detailed visualization of the night sky including:
    - Moon phase with exact illumination percentage
    - Visible constellations with interactive star map
    - Visible planets with positions and brightness information
- **Observe** the parallax effect as you move your cursor
- **Engage** with the live updates in the Galaxy section

## 🔮 Future Enhancements

- Integration with real-time astronomy APIs
- Mobile optimizations for touch interactions
- AR/VR extensions for immersive experiences
- Social sharing of personalized star maps
- Educational quiz and learning path
- More detailed astronomical calculations:
  - Planetary transit predictions
  - Eclipse visualizations
  - Meteor shower forecasts
  - Deep space object finder

## 📚 Technical Details

### Astronomy Calculations

The astronomy features in this application use several advanced algorithms:

- **Julian Day Calculation**: Converting Gregorian dates to Julian days for astronomical calculations
- **Local Sidereal Time**: Determining the sidereal time at the user's location for accurate star positions
- **Moon Phase Algorithm**: Computing the moon's phase based on lunar cycle calculations
- **Planetary Position Approximation**: Estimating planetary positions using simplified orbital mechanics
- **Constellation Visibility**: Determining which constellations are visible based on date, time, and location

All these calculations are performed client-side using JavaScript implementations of astronomical formulas from standard reference sources.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Acknowledgements

- NASA Open APIs for astronomical data
- ESA for space imagery
- Three.js community for 3D visualization examples
- React Three Fiber team for making Three.js reactive
- Planetary texture authors
- Astronomia and SunCalc libraries for astronomical calculations

---

Created with 💫 by [Your Name] 
