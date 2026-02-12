import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../src/component/Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();
  const mockOnPageSizeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination with correct page numbers', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    });

    it('should not render when totalItems is 0', () => {
      const { container } = render(
        <Pagination
          totalItems={0}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalItems is negative', () => {
      const { container } = render(
        <Pagination
          totalItems={-10}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should display page information', () => {
      render(
        <Pagination
          totalItems={100}
          currentPage={2}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Check the text exists by looking for numbers only
      const allText = screen.getByText((content, element) => {
        return element?.textContent === 'Showing 11-20 of 100';
      });
      expect(allText).toBeInTheDocument();
    });

    it('should show ellipsis for many pages', () => {
      render(
        <Pagination
          totalItems={200}
          currentPage={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const ellipsis = screen.getAllByText('…');
      expect(ellipsis.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should call onPageChange when clicking on page number', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const page3Button = screen.getByText('3');
      fireEvent.click(page3Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange when clicking Previous button', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={3}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByText('Prev');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking Next button', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={2}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should disable Previous button on first page', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByText('Prev');
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange even when clicking current page', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={2}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByRole('button', { name: '2' });
      fireEvent.click(currentPageButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should not call onPageChange when clicking ellipsis', () => {
      render(
        <Pagination
          totalItems={200}
          currentPage={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const ellipsis = screen.getAllByText('…')[0];
      fireEvent.click(ellipsis);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Size Selector', () => {
    it('should render page size selector when onPageSizeChange is provided', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );

      expect(screen.getByText('Per page:')).toBeInTheDocument();
    });

    it('should not render page size selector when onPageSizeChange is not provided', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByText('Per page:')).not.toBeInTheDocument();
    });

    it('should call onPageSizeChange when changing page size', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '20' } });

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(20);
    });

    it('should render custom page size options', () => {
      render(
        <Pagination
          totalItems={100}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('10');
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('10');
      expect(options[1]).toHaveValue('25');
      expect(options[2]).toHaveValue('50');
      expect(options[3]).toHaveValue('100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      render(
        <Pagination
          totalItems={5}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
    });

    it('should calculate correct total pages', () => {
      render(
        <Pagination
          totalItems={95}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // 95 items with pageSize 10 should give 10 pages
      const page10Button = screen.getByRole('button', { name: '10' });
      expect(page10Button).toBeInTheDocument();
    });

    it('should handle exact page boundary', () => {
      render(
        <Pagination
          totalItems={100}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const page10Button = screen.getByRole('button', { name: '10' });
      expect(page10Button).toBeInTheDocument();
    });

    it('should clamp current page within valid range', () => {
      render(
        <Pagination
          totalItems={50}
          currentPage={100}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Should show last page info even if currentPage is out of bounds
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByText('41')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Pagination
          totalItems={50}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
          className="custom-pagination"
        />
      );

      expect(container.firstChild).toHaveClass('custom-pagination');
    });
  });

  describe('Page Model Building', () => {
    it('should show all pages when total pages <= 7', () => {
      render(
        <Pagination
          totalItems={70}
          currentPage={4}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Should show pages 1-7
      for (let i = 1; i <= 7; i++) {
        const button = screen.getByRole('button', { name: i.toString() });
        expect(button).toBeInTheDocument();
      }
    });

    it('should show ellipsis when in middle of many pages', () => {
      render(
        <Pagination
          totalItems={200}
          currentPage={10}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      
      const ellipsis = screen.getAllByText('…');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should always show first and last page', () => {
      render(
        <Pagination
          totalItems={200}
          currentPage={10}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    });
  });
});
