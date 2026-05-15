import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { productsApi } from '@/api/products';
import { Product } from '@/api/types';
import { ProductCardAddToCart } from '@/components/ProductCardAddToCart';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId, categoryId }) => {
  const navigate = useNavigate();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['relatedProducts', categoryId],
    queryFn: () => productsApi.getProducts({ category: categoryId, limit: 11 }), // fetch 11 to show 10 after excluding current
    enabled: !!categoryId,
  });

  const relatedProducts = React.useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data
      .filter((p: Product) => p._id !== currentProductId)
      .slice(0, 10); // Show max 10 in a grid (2 rows of 5 on large screen)
  }, [productsData, currentProductId]);

  if (isLoading) {
    return (
      <div className="mt-12 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedProducts.length) {
    return null; // Hide if no related products
  }

  return (
    <div className="mt-12 mb-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
        <button
          onClick={() => navigate(`/products?category=${categoryId}`)}
          className="text-sm font-medium text-[#0C8A00] hover:underline"
        >
          View all
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {relatedProducts.map((product) => (
          <Card
            key={product._id}
            className="group overflow-hidden rounded-2xl border bg-background hover:shadow-md transition duration-200 flex flex-col cursor-pointer"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            {/* IMAGE */}
            <div className="relative aspect-square bg-muted overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={
                    typeof product.images[0] === 'string'
                      ? product.images[0]
                      : product.images[0]?.url
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}

              {/* Discount Badge */}
              {product.discount > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  {product.discount}% OFF
                </span>
              )}
              {product.mrp > product.price && (
                <span className="absolute top-2 right-2 bg-[#0C8A00] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Save ₹{product.mrp - product.price}
                </span>
              )}
            </div>

            {/* CONTENT */}
            <div className="p-3 flex flex-col flex-1 bg-[#9af19a36]">
              {/* Title */}
              <div className="mb-2 min-h-[1rem]">
                <h3 className="text-sm font-medium leading-snug line-clamp-1">
                  {product.name}
                </h3>
                {product.unit && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {product.unit}
                  </p>
                )}
              </div>

              {/* Price Block */}
              <div className="mb-3 flex-1">
                <div className="flex items-end gap-1.5 flex-wrap">
                  <span className="text-base font-bold text-primary whitespace-nowrap">
                    ₹{product.price}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-muted-foreground line-through whitespace-nowrap">
                      ₹{product.mrp}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart CTA */}
              <div
                className="mt-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <ProductCardAddToCart
                  productId={product._id}
                  productStock={product.stock}
                  size="sm"
                  className="w-full h-9 text-xs font-medium"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
