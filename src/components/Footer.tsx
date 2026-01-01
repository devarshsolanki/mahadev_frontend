import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setSubscribing(true);
    try {
      // Add your newsletter subscription API call here
      toast.success('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-gray-100">
      {/* Main Footer Content */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src="./public/favicon.ico" alt="Mahadev Shop" className="h-10 w-10 rounded-lg" />
                <h3 className="text-xl font-bold">Mahadev Shop</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Your trusted online marketplace for quality products delivered right to your door.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-primary transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-gray-400 hover:text-primary transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-gray-400 hover:text-primary transition-colors">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link to="/subscriptions" className="text-gray-400 hover:text-primary transition-colors">
                    Subscriptions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Customer Service</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/cart" className="text-gray-400 hover:text-primary transition-colors">
                    My Cart
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" className="text-gray-400 hover:text-primary transition-colors">
                    Wallet
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-400 hover:text-primary transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Returns & Exchanges
                  </a>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Information</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to get special offers and updates delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
                  disabled={subscribing}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={subscribing}
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Bar */}
      <div className="bg-slate-800 border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h5 className="font-semibold mb-1">Email</h5>
                <a href="mailto:support@mahadevshop.com" className="text-gray-400 hover:text-primary transition-colors">
                  support@mahadevshop.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h5 className="font-semibold mb-1">Phone</h5>
                <a href="tel:+919876543210" className="text-gray-400 hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h5 className="font-semibold mb-1">Address</h5>
                <p className="text-gray-400 text-sm">
                  123 Market Street<br />
                  New Delhi, Delhi 110001<br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-slate-950 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Mahadev Shop. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 text-sm hover:text-primary transition-colors">
                Sitemap
              </a>
              <a href="#" className="text-gray-400 text-sm hover:text-primary transition-colors">
                Security
              </a>
              <a href="#" className="text-gray-400 text-sm hover:text-primary transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
