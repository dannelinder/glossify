import { supabase } from '../lib/supabaseClient'

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

// Load word list from Supabase (filtered by authenticated user)
export async function loadWordListFromDB(key) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('word_lists')
      .select('content')
      .eq('name', key)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      // If no data found (404), return empty array instead of throwing
      if (error.code === 'PGRST116') return []
      throw error
    }
    if (data && data.content) {
      return parseWordList(data.content)
    }
    return []
  } catch (error) {
    console.error('Error loading word list from Supabase:', error)
    return []
  }
}

// Save word list to Supabase (with user_id)
export async function saveWordListToDB(key, textContent) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No authenticated user')
      return false
    }

    console.log('Saving word list:', key, 'for user:', user.id)

    // Use upsert with the composite unique constraint (name + user_id)
    const { error } = await supabase
      .from('word_lists')
      .upsert({ 
        name: key, 
        content: textContent,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name,user_id'
      })
    
    if (error) {
      console.error('Upsert error:', error)
      throw error
    }
    
    console.log('Save successful')
    return true
  } catch (error) {
    console.error('Error saving word list to Supabase:', error)
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
