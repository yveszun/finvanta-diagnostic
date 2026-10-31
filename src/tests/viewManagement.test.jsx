import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useViewMode } from '../hooks/useViewMode';
import { ViewToggle } from '../components/ViewToggle';

describe('View Management System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('useViewMode hook', () => {
    it('should initialize with executive view by default', () => {
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('executive');
      expect(result.current.isExecutiveView).toBe(true);
      expect(result.current.isAnalystView).toBe(false);
    });

    it('should toggle between executive and analyst views', () => {
      const { result } = renderHook(() => useViewMode());
      
      act(() => {
        result.current.toggleView();
      });
      
      expect(result.current.viewMode).toBe('analyst');
      expect(result.current.isAnalystView).toBe(true);
      expect(result.current.isExecutiveView).toBe(false);
      
      act(() => {
        result.current.toggleView();
      });
      
      expect(result.current.viewMode).toBe('executive');
    });

    it('should persist view preference to localStorage', () => {
      const { result } = renderHook(() => useViewMode());
      
      act(() => {
        result.current.setAnalystView();
      });
      
      expect(localStorage.getItem('finvanta-view-mode')).toBe('analyst');
    });

    it('should restore view preference from localStorage', () => {
      localStorage.setItem('finvanta-view-mode', 'analyst');
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('analyst');
      expect(result.current.isAnalystView).toBe(true);
    });

    it('should provide setExecutiveView method', () => {
      const { result } = renderHook(() => useViewMode());
      
      act(() => {
        result.current.setAnalystView();
      });
      
      expect(result.current.viewMode).toBe('analyst');
      
      act(() => {
        result.current.setExecutiveView();
      });
      
      expect(result.current.viewMode).toBe('executive');
    });
  });

  describe('ViewToggle component', () => {
    it('should render both view buttons', () => {
      const mockToggle = vi.fn();
      render(<ViewToggle viewMode="executive" onToggle={mockToggle} />);
      
      expect(screen.getByText('Executive View')).toBeInTheDocument();
      expect(screen.getByText('Analyst View')).toBeInTheDocument();
    });

    it('should show executive view as active by default', () => {
      const mockToggle = vi.fn();
      render(<ViewToggle viewMode="executive" onToggle={mockToggle} />);
      
      const executiveBtn = screen.getByText('Executive View');
      const analystBtn = screen.getByText('Analyst View');
      
      expect(executiveBtn).toHaveAttribute('aria-pressed', 'true');
      expect(analystBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('should call onToggle when clicking inactive view', () => {
      const mockToggle = vi.fn();
      render(<ViewToggle viewMode="executive" onToggle={mockToggle} />);
      
      const analystBtn = screen.getByText('Analyst View');
      fireEvent.click(analystBtn);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call onToggle when clicking active view', () => {
      const mockToggle = vi.fn();
      render(<ViewToggle viewMode="executive" onToggle={mockToggle} />);
      
      const executiveBtn = screen.getByText('Executive View');
      fireEvent.click(executiveBtn);
      
      expect(mockToggle).not.toHaveBeenCalled();
    });

    it('should highlight analyst view when active', () => {
      const mockToggle = vi.fn();
      render(<ViewToggle viewMode="analyst" onToggle={mockToggle} />);
      
      const executiveBtn = screen.getByText('Executive View');
      const analystBtn = screen.getByText('Analyst View');
      
      expect(executiveBtn).toHaveAttribute('aria-pressed', 'false');
      expect(analystBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
