import { 
  doc, 
  getDoc, 
  setDoc
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

// Parse semicolon-separated word list
// Format: svenska;tyska (one per line)
export function parseWordList(text) {
  if (!text || !text.trim()) return []
  
  const lines = text.trim().split('\n')
  const words = []
  
  for (let line of lines) {
    line = line.trim()
    // Skip empty lines and header
    if (!line || line.toLowerCase().startsWith('svenska;')) continue
    
    const parts = line.split(';')
    if (parts.length >= 2) {
      words.push({
        sv: parts[0].trim(),
        ty: parts[1].trim()
      })
    }
  }
  
  return words
}

// Load word list from Firestore (filtered by authenticated user)
export async function loadWordListFromDB(key) {
  try {
    const user = auth.currentUser
    if (!user) return []

    const docRef = doc(db, 'wordLists', `${user.uid}_${key}`)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data && data.content) {
        return parseWordList(data.content)
      }
    }
    return []
  } catch (error) {
    console.error('Error loading word list from Firestore:', error)
    return []
  }
}

// Save word list to Firestore (with user_id)
export async function saveWordListToDB(key, textContent) {
  try {
    const user = auth.currentUser
    if (!user) {
      console.error('No authenticated user')
      return false
    }

    const docRef = doc(db, 'wordLists', `${user.uid}_${key}`)
    await setDoc(docRef, {
      name: key,
      content: textContent,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    })

    return true
  } catch (error) {
    console.error('Error saving word list to Firestore:', error)
    return false
  }
}

// Load word list from localStorage or fallback to default
export function loadWordList(key, defaultWords) {
  const saved = localStorage.getItem(key)
  if (saved) {
    const parsed = parseWordList(saved)
    return parsed.length > 0 ? parsed : defaultWords
  }
  return defaultWords
}
