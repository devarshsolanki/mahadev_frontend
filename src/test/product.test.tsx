import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import { AuthProvider } from '../context/AuthContext';

// Mock API responses
vi.mock('../api/products', () => ({
  productsApi: {
    getFeaturedProducts: vi.fn(),
    getProductById: vi.fn(),
  },
  categoriesApi: {
    getCategoryTree: vi.fn(),
  }
}));

import { productsApi } from '../api/products';

// Mock API client
vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/api/v1/home-sliders') {
        return Promise.resolve({
          data: {
            data: [
              {
                category: {
                  _id: 'cat123',
                  name: 'Snacks'
                }
              }
            ]
          }
        });
      }
      return Promise.resolve({ data: { data: [] } });
    })
  }
}));

const mockNavigate = vi.fn();
// Mock React Router
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'prod123' })
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity }
  }
});

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Product Navigation & Details', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = {
    _id: 'prod123',
    name: 'Test Product',
    price: 100,
    mrp: 120,
    discount: 16,
    unit: '1 kg',
    description: 'Test Description',
    images: ['test.jpg'],
    stock: 10,
    category: { _id: 'cat123', name: 'Snacks' }
  };

  it('Product detail page loads with correct product data', async () => {
    (productsApi.getProductById as any).mockResolvedValue({ success: true, data: mockProduct });

    renderWithProviders(<ProductDetail />);

    // Check loading state
    expect(screen.getByTestId('skeleton')).toBeDefined();

    // Wait for the product detail to render
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('₹100')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('Product detail page does NOT show 404 for valid product', async () => {
    (productsApi.getProductById as any).mockResolvedValue({ success: true, data: mockProduct });

    renderWithProviders(<ProductDetail />);

    await waitFor(() => {
        // Assert text "Product not found" is not there
        expect(screen.queryByText('Product not found')).not.toBeInTheDocument();
    });
  });

  it('Product Detail shows 404 correctly for non-existent product', async () => {
     (productsApi.getProductById as any).mockResolvedValue({ success: true, data: null });

     renderWithProviders(<ProductDetail />);

     await waitFor(() => {
        expect(screen.getByText('Product not found')).toBeInTheDocument();
     })
  });

  it('Back navigation from product detail returns correctly', async () => {
    (productsApi.getProductById as any).mockResolvedValue({ success: true, data: mockProduct });

    renderWithProviders(<ProductDetail />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const backBtn = screen.getByText('Back');
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
