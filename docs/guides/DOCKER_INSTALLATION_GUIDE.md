# 🐳 Docker Desktop Installation Guide for Windows

## Prerequisites
- Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 and higher)
- Windows 11 64-bit: Home or Pro version 21H2 or higher
- WSL 2 feature enabled on Windows
- BIOS-level hardware virtualization support enabled

## Step 1: Download Docker Desktop

1. Go to: **https://www.docker.com/products/docker-desktop/**
2. Click **"Download for Windows"**
3. Download the Docker Desktop Installer.exe file

## Step 2: Install Docker Desktop

1. **Run the installer** (Docker Desktop Installer.exe)
2. **Accept the license agreement**
3. **Configuration options**:
   - ✅ Check "Enable Hyper-V Windows Features" (if available)
   - ✅ Check "Install required Windows components for WSL 2"
4. **Click "Install"** and wait for completion
5. **Restart your computer** when prompted

## Step 3: Initial Setup

After restart:
1. **Launch Docker Desktop** from Start menu
2. **Accept the Docker Subscription Service Agreement**
3. **Complete the tutorial** (optional but recommended)
4. Wait for Docker Engine to start (green status in system tray)

## Step 4: Verify Installation

Open PowerShell and run:
```powershell
docker --version
docker run hello-world
```

You should see:
- Docker version information
- "Hello from Docker!" message

## Step 5: Configure for HotelSaver.ng Development

Once Docker is installed, you can use it for Node.js:

```powershell
# Pull Node.js image
docker pull node:20-alpine

# Run Node.js in container for your project
docker run -it --rm -v ${PWD}:/app -w /app node:20-alpine sh

# Inside container, you'll have node and npm available:
node --version
npm --version
```

## Alternative: WSL 2 Setup (If Required)

If WSL 2 isn't enabled:

1. **Open PowerShell as Administrator**
2. **Enable WSL**:
   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-for-Linux /all /norestart
   ```
3. **Enable Virtual Machine Platform**:
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```
4. **Restart computer**
5. **Install WSL 2 Linux kernel**: Download from Microsoft's website
6. **Set WSL 2 as default**:
   ```powershell
   wsl --set-default-version 2
   ```

## Troubleshooting

### Common Issues:

**Error: "Docker Desktop requires Windows 10 Pro/Enterprise"**
- Solution: Enable WSL 2 backend during installation

**Error: "Hardware assisted virtualization and data execution protection must be enabled"**
- Solution: Enable virtualization in BIOS settings

**Error: "WSL 2 installation is incomplete"**
- Solution: Install WSL 2 Linux kernel update package

### System Requirements Check:
```powershell
# Check Windows version
winver

# Check if Hyper-V is available
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V
```

## After Installation: HotelSaver.ng Usage

With Docker installed, you can run your project:

```powershell
# Navigate to project
cd C:\Users\User\Desktop\PROJECTS\Hotelsaver\hotelsaver1

# Run Node.js environment with your project mounted
docker run -it --rm -v ${PWD}:/app -w /app -p 3000:3000 node:20-alpine sh

# Inside container:
npm install
npm run dev
```

---

## ⚠️ Note: Simpler Alternative

**If you just need Node.js for development**, installing Node.js directly is much simpler:
- Download from https://nodejs.org/
- 5-minute install vs 15+ minute Docker setup
- Better performance for development
- No container complexity

Docker is great for production deployment but may be overkill for local development.