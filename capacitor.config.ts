import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hotelsaver.app',
  appName: 'HotelSaver',
  webDir: 'build',
  server: {
    // Using current preview URL so the WebView loads your hosted Next.js site.
    // Change this to your production URL when ready.
    url: 'https://hotelsaver1-r1a6078iy-amanzes-projects-2bbd5fbf.vercel.app',
    cleartext: false
  }
}

export default config
