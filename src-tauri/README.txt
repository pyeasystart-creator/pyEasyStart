pyEasyStart Icon Bundle (v2)

Source: icon8.png (provided)

Files:
- icons/icon.ico           (Windows multi-size)
- icons/icon-256.png
- icons/icon-128.png
- icons/icon-64.png
- icons/icon-48.png
- icons/icon-32.png
- icons/icon-16.png

Use with Tauri v2:
1) Copy 'icons' into your project's 'src-tauri' folder (so you have src-tauri/icons/icon.ico).
2) Ensure tauri.conf.json includes:
   "bundle": {
     "active": true,
     "targets": ["msi","nsis","dmg","app","deb","appimage"],
     "icon": ["icons/icon.ico"]
   }
3) Run:
   cargo tauri dev
   cargo tauri build
