import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from '../components/Flashcard';

describe('Flashcard Component', () => {
  const mockCard = {
    sv: 'Hej',
    ty: 'Hello'
  };

  const mockOnSubmit = jest.fn();
  const mockNormalize = (str) => str.toLowerCase().trim();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders the Swedish word as question by default', () => {
    render(
      <Flashcard 
        current={mockCard} 
        onSubmit={mockOnSubmit} 
        normalize={mockNormalize}
        direction="sv-target"
      />
    );
    
    expect(screen.getByText('Hej')).toBeInTheDocument();
  });

  test('renders the target language word when direction is reversed', () => {
    render(
      <Flashcard 
        current={mockCard} 
        onSubmit={mockOnSubmit} 
        normalize={mockNormalize}
        direction="target-sv"
      />
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('accepts user input', () => {
    render(
      <Flashcard 
        current={mockCard} 
        onSubmit={mockOnSubmit} 
        normalize={mockNormalize}
      />
    );
    
    const input = screen.getByPlaceholderText('Skriv ditt svar här...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    expect(input.value).toBe('Hello');
  });

  test('submits answer on form submit', () => {
    render(
      <Flashcard 
        current={mockCard} 
        onSubmit={mockOnSubmit} 
        normalize={mockNormalize}
      />
    );
    
    const input = screen.getByPlaceholderText('Skriv ditt svar här...');
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(form);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Hello', null);
  });

  test('clears input when card changes', () => {
    const { rerender } = render(
      <Flashcard 
        current={mockCard} 
        onSubmit={mockOnSubmit} 
        normalize={mockNormalize}
      />
    );
    
    const input = screen.getByPlaceholderText('Skriv ditt svar här...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input.value).toBe('Hello');
    
    // Change to new card
    const newCard = { sv: 'Tack', ty: 'Thanks' };
    rerender(
      <Flashcard 
        current={newCard} 
        onSubmit={mockOnSubmit} 
        normalize={mockNormalize}
      />
    );
    
    expect(input.value).toBe('');
  });

  describe('Verb Mode', () => {
    const mockVerbCard = {
      sv: 'jag sover',
      ty: 'ich schlafe'
    };

    test('shows partial prompt in verb mode', () => {
      render(
        <Flashcard 
          current={mockVerbCard} 
          onSubmit={mockOnSubmit} 
          normalize={mockNormalize}
          direction="sv-target"
          isVerbMode={true}
        />
      );
      
      expect(screen.getByText('jag sover')).toBeInTheDocument();
      expect(screen.getByText('ich ___')).toBeInTheDocument();
    });

    test('shows different placeholder in verb mode', () => {
      render(
        <Flashcard 
          current={mockVerbCard} 
          onSubmit={mockOnSubmit} 
          normalize={mockNormalize}
          direction="sv-target"
          isVerbMode={true}
        />
      );
      
      const input = screen.getByPlaceholderText('Skriv bara verbet...');
      expect(input).toBeInTheDocument();
    });

    test('submits with partial prompt info in verb mode', () => {
      render(
        <Flashcard 
          current={mockVerbCard} 
          onSubmit={mockOnSubmit} 
          normalize={mockNormalize}
          direction="sv-target"
          isVerbMode={true}
        />
      );
      
      const input = screen.getByPlaceholderText('Skriv bara verbet...');
      const form = input.closest('form');
      
      fireEvent.change(input, { target: { value: 'schlafe' } });
      fireEvent.submit(form);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('schlafe', expect.objectContaining({
        question: 'jag sover',
        prompt: 'ich ___',
        expectedAnswer: 'schlafe',
        fullAnswer: 'ich schlafe'
      }));
    });

    test('falls back to normal mode for non-verb phrases', () => {
      render(
        <Flashcard 
          current={mockCard} 
          onSubmit={mockOnSubmit} 
          normalize={mockNormalize}
          direction="sv-target"
          isVerbMode={true}
        />
      );
      
      expect(screen.getByText('Hej')).toBeInTheDocument();
      expect(screen.queryByText('ich ___')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Skriv verbet...')).toBeInTheDocument();
    });
  });
});
