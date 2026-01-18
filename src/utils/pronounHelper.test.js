import { 
  PRONOUN_MAP, 
  formatPrompt, 
  getExpectedVerb, 
  getPartialPromptInfo 
} from './pronounHelper';

describe('pronounHelper', () => {
  describe('PRONOUN_MAP', () => {
    test('contains correct Swedish to German pronoun mappings', () => {
      expect(PRONOUN_MAP.jag).toBe('ich');
      expect(PRONOUN_MAP.du).toBe('du');
      expect(PRONOUN_MAP['han/hon/den']).toBe('er/sie/es');
      expect(PRONOUN_MAP.vi).toBe('wir');
      expect(PRONOUN_MAP.ni).toBe('ihr');
      expect(PRONOUN_MAP['de/Ni']).toBe('sie/Sie');
    });
  });

  describe('formatPrompt', () => {
    test('converts Swedish verb phrases to German partial prompts', () => {
      expect(formatPrompt('jag sover')).toBe('ich ___');
      expect(formatPrompt('du gör')).toBe('du ___');
      expect(formatPrompt('vi älskar')).toBe('wir ___');
      expect(formatPrompt('ni vinner')).toBe('ihr ___');
    });

    test('handles grouped pronouns', () => {
      expect(formatPrompt('han/hon/den arbetar')).toBe('er/sie/es ___');
      expect(formatPrompt('de/Ni arbetar')).toBe('sie/Sie ___');
    });

    test('returns null for invalid inputs', () => {
      expect(formatPrompt('sover')).toBeNull(); // single word
      expect(formatPrompt('')).toBeNull(); // empty string
      expect(formatPrompt(null)).toBeNull(); // null input
      expect(formatPrompt('xyz gör')).toBeNull(); // unknown pronoun
    });
  });

  describe('getExpectedVerb', () => {
    test('extracts verb from full German phrases', () => {
      expect(getExpectedVerb('ich schlafe')).toBe('schlafe');
      expect(getExpectedVerb('du machst')).toBe('machst');
      expect(getExpectedVerb('wir lieben')).toBe('lieben');
    });

    test('returns single word if already just the verb', () => {
      expect(getExpectedVerb('schlafe')).toBe('schlafe');
      expect(getExpectedVerb('machst')).toBe('machst');
      expect(getExpectedVerb('lieben')).toBe('lieben');
    });

    test('returns null for invalid inputs', () => {
      expect(getExpectedVerb('')).toBeNull();
      expect(getExpectedVerb(null)).toBeNull();
    });
  });

  describe('getPartialPromptInfo', () => {
    const verbCard = { sv: 'jag sover', ty: 'ich schlafe' };
    const mixedCard = { sv: 'du gör', ty: 'machst' }; // Swedish with pronoun, German without
    const baseCard = { sv: 'se', ty: 'sehen' }; // base verbs

    test('creates partial prompt info for verb phrases', () => {
      const result = getPartialPromptInfo(verbCard, 'sv-target');
      
      expect(result).toEqual({
        question: 'jag sover',
        prompt: 'ich ___',
        expectedAnswer: 'schlafe',
        fullAnswer: 'ich schlafe'
      });
    });

    test('handles mixed format (Swedish with pronoun, German without)', () => {
      const result = getPartialPromptInfo(mixedCard, 'sv-target');
      
      expect(result).toEqual({
        question: 'du gör',
        prompt: 'du ___',
        expectedAnswer: 'machst',
        fullAnswer: 'machst'
      });
    });

    test('returns null for base verbs without pronouns', () => {
      const result = getPartialPromptInfo(baseCard, 'sv-target');
      expect(result).toBeNull();
    });

    test('returns null for invalid inputs', () => {
      expect(getPartialPromptInfo(null)).toBeNull();
      expect(getPartialPromptInfo({})).toBeNull();
      expect(getPartialPromptInfo({ sv: 'test' })).toBeNull();
      expect(getPartialPromptInfo({ ty: 'test' })).toBeNull();
    });

    test('returns null for non-sv-target direction', () => {
      const result = getPartialPromptInfo(verbCard, 'target-sv');
      expect(result).toBeNull();
    });
  });
});