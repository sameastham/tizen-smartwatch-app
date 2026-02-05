# Quick Start Guide - Tizen Calculator

## Fastest Way to Test

### 1. Test in Browser (No Watch Needed)
```bash
# Simply open index.html in your browser
open index.html  # Mac
xdg-open index.html  # Linux
# Or drag index.html into Chrome/Firefox
```

Set browser to mobile view (360x360) to see how it looks on the watch.

### 2. Install on Samsung Galaxy Watch

**Enable Developer Mode:**
1. Watch → Settings → About watch
2. Tap "Software" 5-7 times
3. Settings → Developer options → Enable "Debugging"
4. Note the IP address shown

**Quick Install (if you have Tizen Studio):**
```bash
# Connect to watch (replace IP with your watch's IP)
sdb connect 192.168.1.XXX:26101

# Verify connection  
sdb devices

# Build
./build.sh

# Or manually with tizen CLI:
tizen build-web
tizen install -n Calculator.wgt
tizen run -p abcdefghij.TizenCalculator
```

**Using Tizen Studio IDE:**
1. File → Open Projects from File System
2. Select the tizen-calculator folder
3. Right-click project → Run As → Tizen Web Application
4. Select your connected watch

## Don't Have Tizen Studio?

Download from: https://developer.tizen.org/development/tizen-studio/download

**What you need:**
- Tizen Studio IDE
- Web App Development tools
- Certificate Manager (for signing)

## First Time Setup

1. **Create Certificate** (one-time)
   - Tools → Certificate Manager
   - Create Samsung Certificate
   - Follow wizard

2. **Connect Watch**
   - Enable developer mode (see above)
   - Connect via WiFi: `sdb connect WATCH_IP:26101`

3. **Run the App**
   - Build and run from IDE
   - Or use command line tools

## Customizing the App

**Change Colors** - Edit `css/style.css`:
- `.btn-number` - number button color
- `.btn-operator` - operator button color  
- `.btn-equals` - equals button color

**Change Layout** - Edit `css/style.css`:
- `.calc-grid gap` - space between buttons
- `.btn font-size` - button text size

**Change App Name/ID** - Edit `config.xml`:
- Widget ID and application package name
- Display name

## Troubleshooting

**Can't connect to watch?**
- Make sure watch and computer are on same WiFi
- Check IP address in watch settings
- Try: `sdb kill-server` then reconnect

**App won't install?**
- Create a certificate first (see above)
- Check if app ID is unique
- Uninstall old version if upgrading

**Display looks wrong?**
- App is designed for 360x360 circular displays
- For other sizes, adjust CSS dimensions

## File Overview

```
├── config.xml       ← App configuration and permissions
├── index.html       ← Main UI structure
├── css/style.css    ← Visual styling and layout
├── js/main.js       ← Calculator logic
└── icon.png         ← App icon (512x512)
```

Need help? Check the full README.md for detailed instructions.
