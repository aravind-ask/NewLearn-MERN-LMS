# NewLearn MERN LMS

NewLearn is a Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a platform for managing courses, user authentication, real-time interactions, and payments, deployed on Google Cloud Platform (GCP) with GitHub Actions for CI/CD.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Setup Locally](#setup-locally)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Course Management**: Create, view, and enroll in courses.
- **User Authentication**: JWT-based login with Google OAuth support.
- **Real-Time Updates**: Socket.io for live notifications and interactions.
- **Payments**: Razorpay integration for course purchases.
- **File Storage**: AWS S3 for storing course materials.
- **AI Integration**: Google Gemini API for enhanced features.
- **Responsive Design**: Works across desktop and mobile devices.

## Tech Stack
- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB (Atlas)
- **Cloud Services**: 
  - Google App Engine (Frontend)
  - Google Compute Engine (Backend with NGINX)
  - AWS S3 (Storage)
- **CI/CD**: GitHub Actions
- **Others**: PM2 (Process Manager), Let’s Encrypt (SSL)

## Architecture
- **Frontend**: Hosted on Google App Engine at `https://newlearn-lms.el.r.appspot.com`.
- **Backend**: Hosted on Google Compute Engine at `https://newlearnlms.work.gd`, proxied via NGINX.
- **Database**: MongoDB Atlas cluster for persistent storage.
- **Storage**: AWS S3 bucket (`newlearn-lms-mern`) for media files.
- **CI/CD**: GitHub Actions deploys frontend and backend on `main` branch pushes.

## Deployment
### Frontend
- **URL**: `https://newlearn-lms.el.r.appspot.com`
- **Platform**: Google App Engine (Standard Environment)
- **Workflow**: `.github/workflows/deploy-frontend.yml`
  - Trigger: Push to `main` with changes in `Client/**`.
  - Builds with Vite, deploys using `newlearn-lms@appspot.gserviceaccount.com`.

### Backend
- **URL**: `https://newlearnlms.work.gd`
- **Platform**: Google Compute Engine (e2-micro) with NGINX
- **Workflow**: `.github/workflows/deploy-backend.yml`
  - Trigger: Push to `main` with changes in `Server/**`.
  - Pulls repo, builds, and restarts PM2 process `lms-backend`.

## Environment Variables
### Client (`Client/.env`)
Stored in GitHub Secrets as `CLIENT_ENV`:
VITE_GOOGLE_CLIENT_ID=<your_google_client_id>
VITE_API_URL=<your_server_url>
VITE_RAZORPAY_KEY_ID=<razorpay_key>
VITE_GEMINI_API_KEY=<gemini_key>


### Server (`Server/.env`)
Stored in GitHub Secrets as `SERVER_ENV`:
MONGO_URI=mongodb+srv://<username>:<password>@lms-cluster0.xag16.mongodb.net/?retryWrites=true&w=majority&appName=LMS-Cluster0
PORT=3003
BASE_URL=<server_base_url>
CLIENT_URL=<client_url>
NODE_ENV=development
JWT_SECRET=<secret>
ACCESS_TOKEN_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
OTP_EXPIRY_MINUTES=10
REFRESH_TOKEN_EXPIRY_DAYS=7
EMAIL_USER=<email>
EMAIL_PASS=<app-password>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=newlearn-lms-mern
RAZORPAY_KEY_ID=<razorpay_key>
RAZORPAY_KEY_SECRET=<razorpay_secret>


**Note**: Replace sensitive values (e.g., `<secret>`, `<username>:<password>`) with your own in local setups or GitHub Secrets.

## Setup Locally
### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- AWS, Razorpay, Google, and Gemini API credentials
- GCP project with App Engine and Compute Engine enabled

### Steps
1. **Clone the Repository**:
   git clone https://github.com/<your-username>/NewLearn-MERN-LMS.git
   cd NewLearn-MERN-LMS

2. **Install Dependencies**:
- Frontend:
  cd Client
  npm install
  
- Backend:
  cd Server
  npm install
  
3. **Set Up Environment Variables**:
- Create `Client/.env` and `Server/.env` with the variables above, replacing placeholders with your credentials.

4. **Run Locally**:
- Backend:
  cd Server
  npm run build
  npm run start

- Frontend:
  cd Client
  npm run dev

- Access at `http://localhost:5173` (frontend) and `http://localhost:3003` (backend).

5. **Test**:
- Ensure MongoDB, Socket.io, and API endpoints work as expected.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/<name>`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature/<name>`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License
