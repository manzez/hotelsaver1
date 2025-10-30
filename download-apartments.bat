@echo off
REM Windows batch script to run apartment download with proper environment variable

echo Setting Google Places API key...
set GOOGLE_PLACES_API_KEY=AIzaSyAZyBiJ4AMsGsnUbIS6tsg-9iUbQpx-fRw

echo Running apartment download...
npm run download-apartments

echo Done!