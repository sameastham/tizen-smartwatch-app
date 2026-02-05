# Tizen Watch Calculator

A simple, touch-friendly calculator app designed for Samsung Tizen smartwatches with circular displays.

## Features

- ✨ Clean, modern interface optimized for 360x360 circular displays
- 🔢 Basic arithmetic operations (+, −, ×, ÷)
- 🎯 Touch-optimized buttons for easy input on small screens
- 🌙 Dark theme to save battery on AMOLED displays
- ⌫ Backspace function for easy error correction
- 🔄 Hardware back button support

## File Structure

```
tizen-calculator/
├── config.xml          # Tizen app configuration
├── index.html          # Main app interface
├── icon.png            # App icon (512x512)
├── icon.svg            # Source SVG icon
├── css/
│   └── style.css       # Styles optimized for circular watch
└── js/
    └── main.js         # Calculator logic
```

## Installation Instructions

### Prerequisites

1. **Tizen Studio** - Download from: https://developer.tizen.org/development/tizen-studio/download
2. **Samsung Watch** connected via Wi-Fi or paired with phone
3. **Developer mode** enabled on your watch

### Enable Developer Mode on Galaxy Watch

1. Go to **Settings** → **About watch**
2. Tap **Software** multiple times until Developer mode is enabled
3. Go back to Settings → **Developer options**
4. Enable **Debugging** and note your watch's IP address

### Building and Installing

#### Method 1: Using Tizen Studio IDE

1. Open **Tizen Studio**
2. Create a new **Tizen Wearable Web App** project
3. Replace the generated files with these project files
4. Right-click the project → **Run As** → **Tizen Web Application**
5. Select your connected watch device

#### Method 2: Using Command Line (tizen-cli)

```bash
# Navigate to project directory
cd tizen-calculator

# Connect to your watch (replace with your watch's IP)
sdb connect 192.168.1.XXX:26101

# Verify connection
sdb devices

# Build the app (creates a .wgt package)
tizen build-web

# Install on watch
tizen install -n Calculator.wgt -t <device-id>

# Launch the app
tizen run -p abcdefghij.TizenCalculator -t <device-id>
```

#### Method 3: Package and Install via Device Manager

```bash
# Package the app
tizen package -t wgt -s <your-certificate-profile>

# The .wgt file will be created in the project directory
# Install it using Tizen Studio's Device Manager
```

### Creating icon.png

The project includes `icon.svg`. Convert it to PNG:

**Using ImageMagick:**
```bash
convert icon.svg -resize 512x512 icon.png
```

**Using Inkscape:**
```bash
inkscape icon.svg --export-filename=icon.png --export-width=512 --export-height=512
```

**Using online tools:**
- Upload `icon.svg` to https://cloudconvert.com/svg-to-png
- Set dimensions to 512x512
- Download and save as `icon.png`

## Configuration

### Change App ID

In `config.xml`, update these fields:

```xml
<widget id="http://yourdomain.org/TizenCalculator" ...>
    <tizen:application id="abcdefghij.TizenCalculator" package="abcdefghij" .../>
```

Replace `abcdefghij` with your unique 10-character app ID (lowercase letters only).

### Signing Certificate

Before installing, you need to create a certificate profile in Tizen Studio:

1. **Tools** → **Certificate Manager**
2. Create a new **Samsung Certificate**
3. Follow the wizard to generate author and distributor certificates
4. Use this profile when packaging the app

## Usage

### Calculator Functions

- **Number buttons (0-9)**: Enter numbers
- **Decimal point (.)**: Add decimal values
- **C**: Clear all (reset calculator)
- **⌫**: Backspace (delete last digit)
- **÷, ×, −, +**: Arithmetic operators
- **=**: Calculate result

### Button Layout

```
┌─────────────────────┐
│      Display        │
├────┬────┬────┬─────┤
│ C  │ ⌫  │ ÷  │  ×  │
├────┼────┼────┼─────┤
│ 7  │ 8  │ 9  │  −  │
├────┼────┼────┼─────┤
│ 4  │ 5  │ 6  │  +  │
├────┼────┼────┼─────┤
│ 1  │ 2  │ 3  │     │
├────┴────┼────┤  =  │
│    0    │  . │     │
└─────────┴────┴─────┘
```

## Manual Test Matrix

Run these quick checks on device or emulator before release:

- Single ops: `2 + 3 = 5`, `9 − 4 = 5`, `6 × 7 = 42`, `8 ÷ 2 = 4`
- Chained ops: `2 + 3 + 4 = 9`, `12 ÷ 3 × 2 = 8`
- Operator overwrite: `2 + − 3 = -1` (tap `+` then `−` before next number)
- Decimal after operator: `5 + . 2 = 5.2` (entry should show `0.2`)
- Decimal start: `. 5 + 1 = 1.5`
- Multiple decimals blocked: `1 . . 2` stays `1.2`
- Leading zeros: `0 0 1` results `1`
- Divide by zero: `5 ÷ 0` shows `Error`, then `C` resets to `0`
- Backspace: `12 ⌫` becomes `1`, `1 ⌫` becomes `0`
- Backspace while waiting: `2 + ⌫` does not alter the entry state
- Long numbers: input `1234567890123` and confirm truncation/formatting
- Taps: quick edge taps still register, no accidental zoom

## Customization

### Change Colors

Edit `css/style.css`:

```css
/* Number buttons */
.btn-number {
    background: #2d2d2d;  /* Change this */
}

/* Operator buttons */
.btn-operator {
    background: #ff9500;  /* Change this */
}

/* Equals button */
.btn-equals {
    background: #34c759;  /* Change this */
}
```

### Adjust Button Size

For different watch sizes, modify `calc-grid` gap in `css/style.css`:

```css
.calc-grid {
    gap: 6px;  /* Increase for larger spacing */
}
```

## Troubleshooting

### App won't install
- Verify developer mode is enabled on watch
- Check if watch is connected: `sdb devices`
- Ensure certificate profile is properly configured

### Display looks wrong
- The app is optimized for 360x360 displays
- For different sizes, adjust `.calculator-container` width/height in CSS

### Touch not responding
- Ensure you're tapping the center of buttons

## Release Build Script

Use the helper script to build and package a `.wgt` file:

```bash
./scripts/build.sh
```

If you want to install immediately after packaging, run:

```bash
sdb devices
tizen install -n Calculator.wgt -t <device-id>
```
- Try increasing button size by reducing gap in grid

### "Package ID already exists"
- Change the app ID in `config.xml` to something unique
- Uninstall previous version from watch

## Development

To modify the calculator logic, edit `js/main.js`. Key functions:

- `handleNumber()`: Process number input
- `handleOperator()`: Process operator input  
- `calculate()`: Perform calculations
- `updateDisplay()`: Update display text

## Browser Testing

Open `index.html` in Chrome/Firefox with these DevTools settings:
- Device: Custom (360x360)
- This allows testing before deploying to watch

## License

Free to use and modify for personal and commercial projects.

## Credits

Designed for Samsung Galaxy Watch and Tizen OS wearables.
