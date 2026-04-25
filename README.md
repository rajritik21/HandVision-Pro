# HandVision Pro - AI-Powered Hand Tracking & Air Canvas

HandVision Pro is a premium, real-time computer vision application that leverages MediaPipe and JavaScript to provide advanced hand tracking, finger counting, and a futuristic Air Canvas experience.

![HandVision Pro Demo](https://raw.githubusercontent.com/google/mediapipe/master/docs/solutions/hands_landmarks_style.png) <!-- Placeholder: Replace with your own screenshot -->

## 🚀 Features

- **Dual-Mode System**: Switch between high-accuracy hand tracking and a creative Air Canvas environment.
- **Advanced Finger Counting**: Recognize up to 10 fingers across both hands with precise Left/Right hand differentiation.
- **Air Canvas (Neon Writing)**: Write and draw in the air using your index finger. Features a glowing neon ink effect with adjustable brush sizes.
- **Gesture-Based Controls**:
  - **Pen Down**: Lift your index finger only to start drawing.
  - **Quick Clear**: Show all 5 fingers to automatically wipe the canvas clean.
- **Mirror Mode Correction**: Synchronized visual feedback that feels like looking into a mirror.
- **Privacy First**: All processing happens locally in your browser. No video data is ever sent to a server.
- **Premium UI**: Modern dark-mode interface with glassmorphism effects and responsive design.

## 🛠️ Tech Stack

- **Core**: HTML5, CSS3, JavaScript (Vanilla)
- **AI Engine**: [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Fonts**: [Outfit (Google Fonts)](https://fonts.google.com/specimen/Outfit)

## ⚡ Quick Start

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/HandVision-Pro.git
    ```
2.  **Open the project**:
    Simply open `index.html` in any modern web browser (Chrome or Edge recommended).
3.  **Grant Permission**:
    Allow camera access when prompted to begin the experience.

## 🎨 How to Use

### Tracking Mode
1. Click **START TRACKING**.
2. Place your hands in the camera view.
3. The system will detect your hand type (Left/Right) and count the number of fingers extended.

### Air Canvas Mode
1. Click **AIR CANVAS**.
2. **To Draw**: Extend only your **Index Finger**.
3. **To Stop Drawing**: Close your hand or tuck your index finger.
4. **To Clear Canvas**: Show your **Full Palm (5 fingers)** for a half-second to reset the screen.
5. Use the sidebar to change brush colors and thickness.

## 👨‍💻 Developed By

Created with ❤️ by **Ritik Ranjan**.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
