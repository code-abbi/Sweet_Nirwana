# 🍭 Sweet Images Folder

Add your sweet images here with these exact filenames:

## Required Image Files:

1. **gulab_jamun.jpeg** - Gulab Jamun (Syrup-based)
2. **rasgulla.jpeg** - Rasgulla (Syrup-based) 
3. **jalebi.jpeg** - Jalebi (Fried)
4. **kaju_katli.jpeg** - Kaju Katli (Dry Fruits)
5. **rasmalai.jpeg** - Rasmalai (Milk-based)
6. **ladoo.jpeg** - Ladoo (Flour-based)
7. **barfi.jpeg** - Barfi (Milk-based)
8. **sandesh.jpeg** - Sandesh (Bengali)
9. **halwa.jpeg** - Halwa (Flour-based)
10. **malai_roll.jpeg** - Malai Roll (Bengali)

## Image Specifications:
- **Format**: JPEG (.jpeg or .jpg)
- **Recommended Size**: 400x300 pixels or similar aspect ratio
- **File Size**: Keep under 500KB for better performance
- **Quality**: High quality food photography preferred

## How to Add Images:
1. Save your sweet images with the exact filenames listed above
2. Place them in this folder (`backend/sweet-images/`)
3. Restart the backend server (`npm run dev`)
4. Re-seed the database (`npm run seed`) to update image paths

## Example:
```
backend/sweet-images/
├── gulab_jamun.jpeg
├── rasgulla.jpeg  
├── jalebi.jpeg
├── kaju_katli.jpeg
├── rasmalai.jpeg
├── ladoo.jpeg
├── barfi.jpeg
├── sandesh.jpeg
├── halwa.jpeg
└── malai_roll.jpeg
```

The images will be served at: `http://localhost:3001/images/[filename]`