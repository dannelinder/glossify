# 🔊 Sound Guide

## Current Sound Implementation

The app now has **built-in sound effects** using the Web Audio API (no files needed!):

### Sound Effects:
- ✅ **Correct Answer**: Happy ascending notes (C-E-G)
- ❌ **Wrong Answer**: Descending buzz sound
- 🖱️ **Button Click**: Quick click sound

### How It Works:
Sounds are generated programmatically in `PracticePage.jsx` using the `playSound()` function.

---

## Want Custom Sound Files?

If you want to use custom MP3/WAV files instead:

### 1. Add sound files to `/public/sounds/`:
```
public/
  sounds/
    correct.mp3
    wrong.mp3
    click.mp3
```

### 2. Replace the `playSound()` function in `PracticePage.jsx`:

```javascript
const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`)
  audio.volume = 0.5
  audio.play().catch(e => console.log('Sound play failed:', e))
}
```

### 3. Find free sounds at:
- **Freesound.org** - Great for game sounds
- **Mixkit.co** - Free sound effects
- **Zapsplat.com** - Huge library

---

## Disable Sounds

To turn off sounds, just comment out the `playSound()` calls:
```javascript
// playSound('correct')
// playSound('wrong')
// playSound('click')
```

Or add a mute toggle button in the UI!
