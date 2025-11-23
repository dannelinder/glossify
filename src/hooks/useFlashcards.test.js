import { renderHook, act } from '@testing-library/react';
import useFlashcards from '../hooks/useFlashcards';

describe('useFlashcards Hook', () => {
  const testWords = [
    { sv: 'Hej', ty: 'Hello' },
    { sv: 'Tack', ty: 'Thanks' },
    { sv: 'Hejdå', ty: 'Goodbye' }
  ];

  const mockNormalize = (str) => str.toLowerCase().trim();

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useFlashcards([], 1200));
    
    expect(result.current.current).toBeNull();
    expect(result.current.score).toBe(0);
    expect(result.current.totalAnswered).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.wrongPairs).toEqual([]);
  });

  test('loads words and sets first card as current', () => {
    const { result } = renderHook(() => useFlashcards([], 1200));
    
    act(() => {
      result.current.loadWords(testWords);
    });
    
    expect(result.current.current).toBeTruthy();
    expect(result.current.queue.length).toBe(3);
  });

  test('increments score on correct answer (sv-target direction)', () => {
    const { result } = renderHook(() => useFlashcards([], 0));
    
    act(() => {
      result.current.loadWords(testWords);
    });
    
    const correctAnswer = result.current.current.ty;
    
    act(() => {
      result.current.answerCurrent(
        correctAnswer,
        mockNormalize,
        (correct) => expect(correct).toBe(true),
        0,
        'sv-target'
      );
    });
    
    // Wait for state update
    setTimeout(() => {
      expect(result.current.score).toBe(1);
      expect(result.current.totalAnswered).toBe(1);
      expect(result.current.streak).toBe(1);
    }, 10);
  });

  test('increments score on correct answer (target-sv direction)', () => {
    const { result } = renderHook(() => useFlashcards([], 0));
    
    act(() => {
      result.current.loadWords(testWords);
    });
    
    const correctAnswer = result.current.current.sv;
    
    act(() => {
      result.current.answerCurrent(
        correctAnswer,
        mockNormalize,
        (correct) => expect(correct).toBe(true),
        0,
        'target-sv'
      );
    });
    
    setTimeout(() => {
      expect(result.current.score).toBe(1);
      expect(result.current.streak).toBe(1);
    }, 10);
  });

  test('adds to wrongPairs on incorrect answer', () => {
    const { result } = renderHook(() => useFlashcards([], 0));
    
    act(() => {
      result.current.loadWords(testWords);
    });
    
    const currentCard = result.current.current;
    
    act(() => {
      result.current.answerCurrent(
        'Wrong answer',
        mockNormalize,
        (correct) => expect(correct).toBe(false),
        0,
        'sv-target'
      );
    });
    
    setTimeout(() => {
      expect(result.current.score).toBe(0);
      expect(result.current.totalAnswered).toBe(1);
      expect(result.current.streak).toBe(0);
      expect(result.current.wrongPairs.length).toBe(1);
      expect(result.current.wrongPairs[0]).toEqual([currentCard.sv, currentCard.ty]);
    }, 10);
  });

  test('resets streak on wrong answer', () => {
    const { result } = renderHook(() => useFlashcards([], 0));
    
    act(() => {
      result.current.loadWords(testWords);
    });
    
    // Get first correct
    const correctAnswer = result.current.current.ty;
    act(() => {
      result.current.answerCurrent(correctAnswer, mockNormalize, () => {}, 0, 'sv-target');
    });
    
    // Wait and then get one wrong
    setTimeout(() => {
      act(() => {
        result.current.answerCurrent('Wrong', mockNormalize, () => {}, 0, 'sv-target');
      });
      
      setTimeout(() => {
        expect(result.current.streak).toBe(0);
      }, 10);
    }, 10);
  });

  test('can practice wrong answers', () => {
    const { result } = renderHook(() => useFlashcards([], 0));
    
    act(() => {
      result.current.loadWords(testWords);
    });
    
    // Get some wrong
    act(() => {
      result.current.answerCurrent('Wrong', mockNormalize, () => {}, 0, 'sv-target');
    });
    
    setTimeout(() => {
      expect(result.current.wrongPairs.length).toBeGreaterThan(0);
      
      act(() => {
        result.current.resetToWrong();
      });
      
      expect(result.current.current).toBeTruthy();
      expect(result.current.score).toBe(0);
      expect(result.current.totalAnswered).toBe(0);
    }, 10);
  });
});
