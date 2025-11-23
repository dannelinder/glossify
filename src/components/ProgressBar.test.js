import { render, screen } from '@testing-library/react';
import ProgressBar from '../components/ProgressBar';

describe('ProgressBar Component', () => {
  test('renders score and total', () => {
    render(<ProgressBar value={5} max={10} />);
    
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  test('calculates correct percentage', () => {
    const { container } = render(<ProgressBar value={7} max={10} />);
    
    // 7/10 = 70%
    const progressFill = container.querySelector('[style*="width: 70%"]');
    expect(progressFill).toBeInTheDocument();
  });

  test('handles zero total', () => {
    const { container } = render(<ProgressBar value={0} max={0} />);
    
    // Should show 0%
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  test('handles perfect score', () => {
    const { container } = render(<ProgressBar value={10} max={10} />);
    
    const progressFill = container.querySelector('[style*="width: 100%"]');
    expect(progressFill).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});
