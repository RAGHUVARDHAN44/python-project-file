import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shikshasetu.attendance',
  appName: 'ShikshaSetu',
  webDir: 'dist',

  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: {
        camera: true
      }
    },
    Filesystem: {
      permissions: {
        storage: true
      }
    }
  }
};

export default config;