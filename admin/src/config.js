// config.js — satu file untuk kedua app
const config = {
  // Vite otomatis inject VITE_ prefix dari .env
  apiUrl:   import.meta.env.VITE_API_URL   || 'http://localhost:3001',
  isDemo:   import.meta.env.VITE_DEMO_MODE === 'true',
  appName:  import.meta.env.VITE_APP_NAME  || 'JasaDigital',
};

export default config;