
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { useAuth } from '@/context/AuthContext';
import { cartApi } from '@/api/cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the cartApi
jest.mock('@/api/cart', () => ({
  cartApi: {
    getCart: jest.fn(),
  },
}));

const queryClient = new QueryClient();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Navbar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the navbar with the logo and login button when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('Mahadev Shop')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders the navbar with navigation links and user dropdown when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Test User', phone: '1234567890', role: 'user' },
    });

    (cartApi.getCart as jest.Mock).mockResolvedValue({
      data: { items: [] },
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows the cart item count in the badge', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Test User', phone: '1234567890', role: 'user' },
    });

    (cartApi.getCart as jest.Mock).mockResolvedValue({
      data: { items: [{ id: 1 }, { id: 2 }] },
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('logs out the user when the logout button is clicked', async () => {
    const logout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Test User', phone: '1234567890', role: 'user' },
      logout,
    });

    (cartApi.getCart as jest.Mock).mockResolvedValue({
      data: { items: [] },
    });

    renderWithRouter(<Navbar />);

    fireEvent.click(screen.getByText('Test User'));
    fireEvent.click(await screen.findByText('Logout'));

    expect(logout).toHaveBeenCalled();
  });

  it('shows the admin panel link for admin users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User', phone: '1234567890', role: 'admin' },
    });

    (cartApi.getCart as jest.Mock).mockResolvedValue({
      data: { items: [] },
    });

    renderWithRouter(<Navbar />);

    fireEvent.click(screen.getByText('Admin User'));
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
