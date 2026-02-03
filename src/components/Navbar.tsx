import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Wallet, Package, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  const cartItemsCount = cart?.data?.items?.length || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center space-x-6'}>
      <Link to="/products" className="text-foreground hover:text-primary transition-colors">
        Products
      </Link>
      <Link to="/categories" className="text-foreground hover:text-primary transition-colors">
        Categories
      </Link>
      {isAuthenticated && (
        <>
          <Link to="/subscriptions" className="text-foreground hover:text-primary transition-colors">
            Subscriptions
          </Link>
          <Link to="/orders" className="text-foreground hover:text-primary transition-colors">
            Orders
          </Link>
        </>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="./favicon.ico" alt="Mahadev Shop" className="h-12 w-15  sm:block rounded-lg" />
            <span className="md:text-xl   font-bold">Mahadev Shop</span>
          </Link>

          {/* Desktop Nav Links */}
          <NavLinks />

          {/* Right Section */}
          <div className="flex items-center md:space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/products?search=')}>
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated && (
              <>
                <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/cart')}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.phone}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                        <Package className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isAuthenticated && (
              <Button onClick={() => navigate('/auth')}>Login</Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="mt-8">
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
