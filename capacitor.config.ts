import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.68bbfff816344ed19f7cec264e8125f3',
  appName: 'Silent Circle',
  webDir: 'dist',
  server: {
    url: 'https://68bbfff8-1634-4ed1-9f7c-ec264e8125f3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1625',
      showSpinner: false
    }
  }
};

export default config;