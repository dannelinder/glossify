// Mapping of Swedish pronouns to German pronouns
export const PRONOUN_MAP = {
  "jag": "ich",
  "du": "du", 
  "han/hon/den": "er/sie/es",
  "vi": "wir", 
  "ni": "ihr",
  "de/Ni": "sie/Sie"
}

/**
 * Formats a Swedish verb phrase into a German partial prompt
 * @param {string} svensktUttryck - e.g., "jag sover"
 * @returns {string|null} - e.g., "ich ___" or null if not applicable
 */
export function formatPrompt(svensktUttryck) {
  if (!svensktUttryck) return null;
  
  const delar = svensktUttryck.split(" ", 2);
  if (delar.length !== 2) return null;
  
  const [pronomenSv] = delar;
  // Try exact match first, then lowercase
  const pronomenDe = PRONOUN_MAP[pronomenSv] || PRONOUN_MAP[pronomenSv.toLowerCase()];
  
  if (!pronomenDe) return null;
  
  return `${pronomenDe} ___`;
}

/**
 * Gets the expected verb answer from German translation
 * @param {string} germanTranslation - e.g., "ich schlafe" or just "schlafe"
 * @returns {string|null} - e.g., "schlafe" or null
 */
export function getExpectedVerb(germanTranslation) {
  if (!germanTranslation) return null;
  
  const words = germanTranslation.trim().split(/\s+/);
  
  // If it's already just one word (just the verb), return it
  if (words.length === 1) {
    return germanTranslation.trim();
  }
  
  // If it's multiple words, return everything after the first word (assumes first is pronoun)
  if (words.length >= 2) {
    return words.slice(1).join(' ');
  }
  
  return null;
}

/**
 * Gets the partial prompt info for a word pair if applicable
 * @param {object} wordPair - { sv: "jag sover", ty: "ich schlafe" }
 * @param {string} direction - 'sv-target' or 'target-sv'
 * @returns {object|null} - { question: 'jag sover', prompt: 'ich ___', expectedAnswer: 'schlafe' }
 */
export function getPartialPromptInfo(wordPair, direction = 'sv-target') {
  if (!wordPair || !wordPair.sv || !wordPair.ty) return null;
  
  if (direction === 'sv-target') {
    const prompt = formatPrompt(wordPair.sv);
    const expectedAnswer = getExpectedVerb(wordPair.ty);
    
    if (prompt && expectedAnswer) {
      return {
        question: wordPair.sv,
        prompt: prompt,
        expectedAnswer: expectedAnswer,
        fullAnswer: wordPair.ty
      };
    }
  }
  
  return null;
}