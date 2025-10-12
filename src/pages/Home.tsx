import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/api/products';
import { ShoppingBag, Truck, Clock, Shield, ArrowRight } from 'lucide-react';
import { Product } from '@/api/types';

const Home = () => {
  const navigate = useNavigate();

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: productsApi.getFeaturedProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategoryTree,
  });

  const features = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Get your groceries delivered within hours',
    },
    {
      icon: Clock,
      title: '24/7 Service',
      description: 'Shop anytime, anywhere',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Fresh and premium products guaranteed',
    },
    {
      icon: ShoppingBag,
      title: 'Wide Selection',
      description: 'Thousands of products to choose from',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Fresh Groceries
              <br />
              Delivered Fast
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Shop for high-quality groceries from the comfort of your home. Fast delivery, great prices, and fresh products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => navigate('/products')}
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white/10 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => navigate('/subscriptions')}
              >
                Subscribe & Save
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center card-hover border-none shadow-md"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our wide range of fresh products</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.data?.slice(0, 8).map((category) => (
              <Card
                key={category._id}
                className="p-6 cursor-pointer card-hover text-center"
                onClick={() => navigate(`/products?category=${category._id}`)}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">{category.name}</h3>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/categories')}>
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Hand-picked products just for you</p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 h-80 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.data?.slice(0, 8).map((product: Product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden cursor-pointer card-hover"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="aspect-square bg-muted relative">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-semibold">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-sm text-muted-foreground line-through ml-2">₹{product.mrp}</span>
                        )}
                      </div>
                      <Button size="sm" className="btn-primary">
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate('/products')}>
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-warm text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Subscribe & Save More</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Get your favorite products delivered automatically. Never run out of essentials again!
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-secondary hover:bg-white/90"
            onClick={() => navigate('/subscriptions')}
          >
            Start Subscribing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
