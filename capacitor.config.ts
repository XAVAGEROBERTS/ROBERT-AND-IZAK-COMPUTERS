import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.robertizak.computers',
  appName: 'Robert & Izak Computers',
  webDir: 'www', // We'll handle this in the next step
  server: {
    url: 'https://robert-and-izak-computers.vercel.app',
    cleartext: false
  }
};

export default config;