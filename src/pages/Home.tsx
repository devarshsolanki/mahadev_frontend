import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/api/products';
import { apiClient } from '@/api/client';
import { ShoppingBag, Truck, Clock, Shield, ArrowRight } from 'lucide-react';
import { Product } from '@/api/types';
import { ProductCardAddToCart } from '@/components/ProductCardAddToCart';

type CategoryType = { _id: string; name: string; image?: string | { url?: string } };

const CategorySlider = ({ category }: { category: CategoryType }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-by-category', category._id],
    queryFn: () =>
      productsApi.getProducts({ category: category._id, inStock: true, limit: 12 }),
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    setIsGrabbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isGrabbing) return;

    const el = containerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    setIsGrabbing(false);
  };

  const handleMouseLeave = () => {
    setIsGrabbing(false);
  };

  const productList: Product[] = products?.data || [];

  return (
    <div className="mt-10 relative">
      {/* Category Title */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3 px-1">{category.name}</h3>

      {/* Scrollable Container with hidden scrollbar */}
      <div
        ref={containerRef}
        className={`flex gap-4 overflow-x-auto scroll-smooth pb-2 px-1 snap-x snap-mandatory transition-all ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hide scrollbar using CSS */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-40 sm:w-44 md:w-48 h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl animate-pulse flex-shrink-0"
            />
          ))
        ) : productList.length === 0 ? (
          <div className="text-gray-500 text-sm italic px-4 py-8">No products in this category</div>
        ) : (
          productList.map((product) => (
            <div
              key={product._id}
              className="w-40 sm:w-44 md:w-48 h-84 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex-shrink-0 overflow-hidden cursor-pointer snap-start select-none group "
              onClick={() => (window.location.href = `/products/${product._id}`)}
              draggable={false}
            >
              {/* Product Image */}
              <div className="h-40 bg-gray-50 relative overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={
                      Array.isArray(product.images) && product.images.length
                        ? (typeof product.images[0] === 'string'
                          ? product.images[0]
                          : (product.images[0] as any).url)
                        : '/placeholder.svg'
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 "
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col justify-between h-[calc(100%-10rem)]">
                <h4 className="text-m font-medium text-gray-800 line-clamp-2">{product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-m font-semibold text-primary">₹{product.price}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ProductCardAddToCart productId={product._id} productStock={product.stock} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Add your slider images here
  const sliderImages = [
    'https://img.freepik.com/free-photo/supermarket-banner-concept-with-ingredients_23-2149421147.jpg?semt=ais_hybrid&w=740&q=80',
    'https://res.cloudinary.com/dyxjqw88z/image/upload/v1770281366/slider_axc85o.jpg',
    'https://img.freepik.com/free-photo/supermarket-banner-concept-with-ingredients_23-2149421132.jpg?semt=ais_hybrid&w=740&q=80',
    'https://img.freepik.com/premium-photo/helping-with-groceries-christmas-easter-food-banner-with-bank-charity-donations_817921-41231.jpg?semt=ais_hybrid&w=740&q=80',
    'https://img.freepik.com/premium-photo/white-phone-basket-with-green-background_950053-23424.jpg?semt=ais_hybrid&w=740&q=80',

  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: productsApi.getFeaturedProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategoryTree,
  });

  // Public home slider config (served without admin auth)
  const { data: homeSliders } = useQuery({
    queryKey: ['home-sliders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/home-sliders');
      return res.data;
    },
    // keep cached for a minute
    staleTime: 1000 * 60,
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
      <section className="relative h-[280px] sm:h-[280px] md:h-[400px] overflow-hidden">
        {/* Background Slider */}
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full "
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 h-full flex items-left justify-left text-white text-center md:text-left">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mt-10 mx-auto animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-green-50">
                Fresh Groceries
                <br />
                Delivered Fast
              </h1>
              <p className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90">
                Shop for high-quality groceries from the comfort of your <br/>home. Fast delivery, great prices, and fresh products.
              </p>
              <div className="flex flex-row gap-3 sm:gap-4 justify-left px-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-sm sm:text-lg sm:px-8 sm:py-6 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  onClick={() => navigate('/products')}
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-sm sm:text-lg sm:px-8 sm:py-6 bg-white/10 border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto"
                  onClick={() => navigate('/subscriptions')}
                >
                  Subscribe & Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {categories?.data?.slice(0, 8).map((category) => (
              <Card
                key={category._id}
                onClick={() => navigate(`/products?category=${category._id}`)}
                className="relative h-36 cursor-pointer overflow-hidden rounded-xl card-hover"
                style={{
                  backgroundImage: `url(${category.image
                      ? typeof category.image === "string"
                        ? category.image
                        : (category.image as any).url
                      : "/placeholder.svg"
                    })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Blur layer */}
                <div className="absolute inset-0  bg-black/40" />

                {/* Content */}
                <div className="relative z-10 flex h-full items-center justify-center">
                  <h3 className="text-white font-semibold text-sm text-center px-2">
                    {category.name}
                  </h3>
                </div>
              </Card>

            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate('/categories')} className='bg-green-500'>
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Most Ordered Products</h2>
            <p className="text-muted-foreground">Products our customers order the most</p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 h-80 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
              {featuredProducts?.data?.slice(0, 8).map((product: Product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden cursor-pointer card-hover"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="aspect-square bg-muted relative">
                    {product.images?.[0] && (
                      <img
                        src={
                          Array.isArray(product.images) && product.images.length
                            ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url)
                            : '/placeholder.svg'
                        }
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
                        <span className="text-lg font-bold text-primary">
                          ₹{product.price}
                          {product.mrp > product.price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">₹{product.mrp}</span>
                          )}
                        </span>
                        {product.unit && (
                          <span className="text-sm text-muted-foreground ml-2"> {product.unit}</span>
                        )}
                      </div>
                      <ProductCardAddToCart productId={product._id} productStock={product.stock} size="sm" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate('/products')} className='bg-green-500'>
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Category sliders per category (below featured products) */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          {/* <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Explore products grouped by categories</p>
          </div> */}

          {homeSliders?.data && homeSliders.data.length > 0 ? (
            homeSliders.data.map((s: any) => (
              s.category ? <CategorySlider key={s.category._id} category={s.category} /> : null
            ))
          ) : (
            categories?.data?.map((category: any) => (
              <CategorySlider key={category._id} category={category} />
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 rounded-3xl mx-5  gradient-warm text-white">
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
    </div>
  );
};

export default Home;
