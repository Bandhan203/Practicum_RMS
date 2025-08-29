# Smart Dine RMS

A modern Restaurant Management System (RMS) frontend built with React, Redux Toolkit, Vite, and Tailwind CSS.

## Features
- React 18, Redux Toolkit, React Router
- Modular component architecture
- API integration ready (connects to backend via Axios)
- Responsive design with Tailwind CSS
- Local storage and authentication support
- Ready for deployment on Netlify

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
3. **Build for production:**
   ```sh
   npm run build
   ```

## Deployment
- Use the included `netlify.toml` for Netlify deployment.
- Set environment variables (e.g., `VITE_API_URL`) in Netlify dashboard if needed.

## API Integration
- The frontend expects a backend API as described in `API_INTEGRATION_GUIDE.md`.
- Update `.env` or Netlify environment variables to point to your backend.

## License
MIT
