# Smart Trash Bin Web

This is the web interface for the Smart Trash Bin project. It is used to display waste classification results, send and receive signals between hardware and backend servers, and notify users when a bin is full.

The system combines hardware (ESP32, sensors, servos), a Python server for AI-based waste classification, and a Node.js (TypeScript) backend to manage the system and serve this web application.

## Features

- Real-time display of detected waste type (plastic, paper, metal, trash)
- Full-bin detection using infrared sensors
- REST API communication between Python and Node.js backends
- Servo control for opening/closing bin lids
- User authentication and admin dashboard

## Technologies Used

- Frontend: HTML, CSS, TypeScript (React or Vanilla depending on your setup)
- Backend: Node.js (TypeScript)
- AI Model: Python with PyTorch
- Hardware: ESP32, infrared sensor, servo motors
- Communication: REST API

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Python backend already running (for AI classification)
- Node.js backend running (for API communication and notifications)

### Steps

1. Clone the repository:

git clone https://github.com/imlawcs/smart-trash-bin-web.git
cd smart-trash-bin-web

2. Install dependencies:

npm install

3. Configure environment variables:

Create a `.env` file in the root directory and add variables if required, for example:

VITE_API_URL=http://localhost:3000/api

4. Start the development server:

npm run dev

The app should be running at `http://localhost:5173` or similar depending on your setup.

### Build for production:

npm run build

Then serve the `dist/` folder using a static server.
