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
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Hello');
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
});
