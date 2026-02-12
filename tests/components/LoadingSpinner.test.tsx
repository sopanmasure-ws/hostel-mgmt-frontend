import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../src/component/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have correct styling classes for overlay', () => {
    const { container } = render(<LoadingSpinner />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center');
  });

  it('should render spinner animation', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinningElement = container.querySelector('.animate-spin');
    expect(spinningElement).toBeInTheDocument();
  });

  it('should have proper z-index for overlay', () => {
    const { container } = render(<LoadingSpinner />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass('z-50');
  });
});
