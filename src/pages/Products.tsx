import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsApi, categoriesApi } from '@/api/products';
import { cartApi } from '@/api/cart';
import { Product } from '@/api/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Filter, Loader2, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Products = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const category = searchParams.get('category') || '';
  const ALL_CATEGORY_VALUE = '__all';
  const sort = searchParams.get('sort') || 'name';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // helper to convert the ``sort`` query param into backend-friendly values
  const parseSort = (value: string) => {
    // default behaviour mirrors existing UI defaults
    let sortBy = 'name';
    let order: 'asc' | 'desc' = 'asc';

    if (value.startsWith('-')) {
      sortBy = value.slice(1);
      order = 'desc';
    } else {
      sortBy = value;
      order = 'asc';
    }

    return { sortBy, order };
  };

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', category, searchQuery, sort, minPrice, maxPrice],
    queryFn: () => {
      const { sortBy, order } = parseSort(sort);

      return productsApi.getProducts({
        category: category || undefined,
        search: searchQuery || undefined,
        sortBy,
        order,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: true,
      });
    },
  });

  // also apply the same sort locally so that the list updates instantly and
  // to cover the case where backend might not respect the parameter
  const sortedProducts = useMemo<Product[]>(() => {
    const list = productsData?.data ? [...productsData.data] : [];
    if (!list.length) return list;

    const { sortBy, order } = parseSort(sort);

    list.sort((a: Product, b: Product) => {
      const va = (a as any)[sortBy];
      const vb = (b as any)[sortBy];

      if (va == null && vb == null) return 0;
      if (va == null) return order === 'asc' ? -1 : 1;
      if (vb == null) return order === 'asc' ? 1 : -1;

      if (typeof va === 'number' && typeof vb === 'number') {
        return order === 'asc' ? va - vb : vb - va;
      }

      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return order === 'asc' ? -1 : 1;
      if (sa > sb) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [productsData?.data, sort]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategoryTree,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    setAddingToCart(productId);
    try {
      await cartApi.addToCart(productId, 1);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-[#E1E9C9]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex gap-4">
            <Select
              value={category || ALL_CATEGORY_VALUE}
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams);
                if (value === ALL_CATEGORY_VALUE) {
                  params.delete('category');
                } else {
                  params.set('category', value);
                }
                setSearchParams(params);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORY_VALUE}>All Categories</SelectItem>
                {categories?.data?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams);
                params.set('sort', value);
                setSearchParams(params);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-discount">Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(category || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary">
                Search: {searchQuery}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    setSearchParams(params);
                  }}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            )}
            {category && (
              <Badge variant="secondary">
                Category: {categories?.data?.find((c) => c._id === category)?.name}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('category');
                    setSearchParams(params);
                  }}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : !sortedProducts || sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {sortedProducts.map((product: Product) => (
           <Card
  key={product._id}
  className="group overflow-hidden rounded-2xl border bg-background hover:shadow-md transition duration-200 flex flex-col"
>
  {/* IMAGE */}
  <div
    onClick={() => navigate(`/products/${product._id}`)}
    className="relative aspect-square bg-muted overflow-hidden"
  >
    {product.images?.[0] ? (
      <img
        src={
          typeof product.images[0] === "string"
            ? product.images[0]
            : product.images[0]?.url
        }
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <ShoppingCart className="h-14 w-14 text-muted-foreground/30" />
      </div>
    )}

    {/* Discount */}
    {product.discount > 0 && (
      <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow">
        {product.discount}% OFF
      </span>
    )}
    {product.mrp > product.price && (
    <span className="absolute top-2 right-2 bg-green-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg ring-2 ring-white/80">
      Save ₹{product.mrp - product.price}
    </span>
  )}

    {/* Stock */}
    {product.stock === 0 && (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span className="bg-white text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
          Out of Stock
        </span>
      </div>
    )}
  </div>

  {/* CONTENT */}
  <div className="p-3 flex flex-col flex-1 bg-[#9af19a36]">
    {/* Title */}
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="mb-1 min-h-[1rem]"
    >
      <h3 className="text-sm font-medium leading-snug line-clamp-2">
        {product.name}
      </h3>
      {product.unit && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {product.unit}
        </p>
      )}
    </div>

    {/* Price Block */}
    <div className="mb-3">
      <div className="flex items-end gap-2 flex-wrap">
        <span className="text-lg font-bold text-primary whitespace-nowrap">
          ₹{product.price}
        </span>

        {product.mrp > product.price && (
          <span className="text-sm text-muted-foreground line-through whitespace-nowrap">
            ₹{product.mrp}
          </span>
        )}
      </div>
    </div>

    {/* CTA */}
    <Button
      size="sm"
      className="w-full mt-auto font-medium"
      disabled={product.stock === 0 || addingToCart === product._id}
      onClick={(e) => {
        e.stopPropagation();
        handleAddToCart(product._id);
      }}
    >
      {addingToCart === product._id ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : product.stock === 0 ? (
        "Unavailable"
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  </div>
</Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
