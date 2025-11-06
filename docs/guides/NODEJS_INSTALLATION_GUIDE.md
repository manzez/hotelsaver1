# 🚀 Node.js Installation Guide for Windows

## Current Issue
- `node`, `npm`, and `docker` commands are not recognized in PowerShell
- This means Node.js is not installed or not in your system PATH
- We need Node.js to run database migrations and test the app

## 📥 Step-by-Step Node.js Installation

### Option 1: Official Node.js Installer (Recommended)

1. **Download Node.js**
   - Go to: https://nodejs.org/
   - Download **LTS version** (currently v20.x.x or v22.x.x)
   - Choose "Windows Installer (.msi)" for x64

2. **Install Node.js**
   - Run the downloaded .msi file
   - ✅ **IMPORTANT**: Check "Add to PATH" during installation
   - Accept all default settings
   - Click "Install" and wait for completion

3. **Verify Installation**
   - Close ALL PowerShell windows
   - Open NEW PowerShell window
   - Run these commands:
   ```powershell
   node --version     # Should show v20.x.x or similar
   npm --version      # Should show 10.x.x or similar
   ```

### Option 2: Chocolatey Package Manager

If you have Chocolatey installed:
```powershell
# Run PowerShell as Administrator
choco install nodejs
```

### Option 3: Winget (Windows Package Manager)

If you have Windows 11 or newer Windows 10:
```powershell
# Run PowerShell as Administrator
winget install OpenJS.NodeJS
```

## 🔧 After Installation

Once Node.js is installed successfully:

1. **Restart PowerShell** (close and open new window)
2. **Navigate back to project**:
   ```powershell
   cd C:\Users\User\Desktop\PROJECTS\Hotelsaver\hotelsaver1
   ```
3. **Test commands**:
   ```powershell
   node --version
   npm --version
   npx --version
   ```

## 🗄️ Next Steps After Node.js Installation

Once you have Node.js working:

1. **Apply database schema**:
   ```powershell
   npx prisma db push
   ```

2. **Generate Prisma client**:
   ```powershell
   npx prisma generate
   ```

3. **Run hotel migration**:
   ```powershell
   npm run migrate-hotels
   ```

4. **Start development server**:
   ```powershell
   npm run dev
   ```

## ❌ Troubleshooting

### If Node.js still not recognized after installation:

**Check PATH manually**:
```powershell
$env:PATH -split ';' | Where-Object { $_ -like '*node*' }
```

**Add to PATH manually** (if needed):
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

**Permanent PATH fix**:
1. Open System Properties → Environment Variables
2. Add `C:\Program Files\nodejs` to System PATH
3. Restart PowerShell

### Alternative: Use VS Code Terminal
- Open VS Code in your project folder
- Use Ctrl+` to open integrated terminal
- VS Code terminal often resolves PATH issues automatically

## 🎯 Quick Test

After Node.js installation, run this to verify everything works:
```powershell
node -e "console.log('Node.js is working!'); console.log('Version:', process.version)"
```

---

**Next Action**: Install Node.js using Option 1 (official installer) and ensure "Add to PATH" is checked during installation.