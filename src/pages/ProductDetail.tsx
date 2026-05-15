import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Clock, Truck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';
import { ProductCardAddToCart } from '@/components/ProductCardAddToCart';
import ReviewSection from '@/components/ReviewSection';
import RelatedProducts from '@/components/RelatedProducts';

/* ─────────────────────────────────────────────
   Delivery Info Strip Item
───────────────────────────────────────────── */
const DeliveryItem = ({
  icon: Icon,
  label,
  sub,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  iconColor: string;
}) => (
  <div className="flex flex-col items-center gap-1.5 flex-1 px-2">
    <div className={`p-2 rounded-full bg-white shadow-sm ${iconColor}`}>
      <Icon className="h-5 w-5" />
    </div>
    <span className="text-xs font-semibold text-gray-800 text-center leading-tight">{label}</span>
    <span className="text-[11px] text-gray-500 text-center leading-tight hidden sm:block">{sub}</span>
  </div>
);

/* ─────────────────────────────────────────────
   Category colour map (pill colours)
───────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  fruits: 'bg-orange-100 text-orange-700',
  vegetables: 'bg-green-100 text-green-700',
  dairy: 'bg-blue-100 text-blue-700',
  bakery: 'bg-amber-100 text-amber-700',
  beverages: 'bg-purple-100 text-purple-700',
  snacks: 'bg-red-100 text-red-700',
  meat: 'bg-rose-100 text-rose-700',
  default: 'bg-teal-100 text-teal-700',
};

function getCategoryColor(name?: string) {
  if (!name) return CATEGORY_COLORS.default;
  const key = name.toLowerCase();
  return (
    Object.entries(CATEGORY_COLORS).find(([k]) => key.includes(k))?.[1] ??
    CATEGORY_COLORS.default
  );
}

/* ─────────────────────────────────────────────
   Loading Skeleton
───────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#F8F9FA]">
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Skeleton className="h-9 w-24 mb-6 rounded-lg" />
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image skeleton */}
        <div className="md:w-[42%]">
          <Skeleton className="aspect-square rounded-2xl w-full" />
        </div>
        {/* Details skeleton */}
        <div className="md:w-[58%] space-y-4">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (!product?.data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 max-w-sm w-full mx-4">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-1">Product not found</p>
          <p className="text-sm text-gray-400 mb-6">
            This product may have been removed or is no longer available.
          </p>
          <Button
            onClick={() => navigate('/products')}
            className="btn-primary rounded-xl w-full"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const p = product.data;

  /* Derive image URL (handles string[] or object[]) */
  const imageUrl =
    Array.isArray(p.images) && p.images.length
      ? typeof p.images[0] === 'string'
        ? p.images[0]
        : (p.images[0] as { url: string }).url
      : null;

  const saving = p.mrp > p.price ? p.mrp - p.price : 0;
  const isDiscounted = saving > 0;
  const inStock = p.stock > 0;
  const categoryColor = getCategoryColor(p.category?.name);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* ── Page wrapper ── */}
      <div className="max-w-5xl mx-auto px-4 py-5 pb-16">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 mb-5 transition-colors group"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm group-hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Back
        </button>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* ════════════════════════════════════════
              LEFT — Sticky image card
          ════════════════════════════════════════ */}
          <div className="w-full md:w-[42%] md:sticky md:top-20">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
              {/* Save badge on image */}
              {isDiscounted && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-[#0C8A00] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    Save ₹{saving}
                  </span>
                </div>
              )}

              {/* Discount % badge */}
              {p.discount > 0 && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    {p.discount}% OFF
                  </span>
                </div>
              )}

              {/* Product image */}
              <div className="aspect-square flex items-center justify-center bg-white p-6">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={p.name}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-300">
                    <ShoppingCart className="h-20 w-20" />
                    <span className="text-sm">No image available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT — Product details
          ════════════════════════════════════════ */}
          <div className="w-full md:w-[58%] space-y-5">

            {/* Category pill */}
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${categoryColor}`}
            >
              {p.category?.name ?? 'Uncategorised'}
            </span>

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug -mt-1">
              {p.name}
              {p.unit && (
                <span className="ml-2 text-base font-normal text-gray-400">/ {p.unit}</span>
              )}
            </h1>

            {/* ── Price block ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center flex-wrap gap-3">
                {/* Discounted / selling price */}
                <span className="text-3xl font-extrabold text-[#0C8A00]">
                  ₹{p.price}
                </span>

                {/* Original MRP */}
                {isDiscounted && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    ₹{p.mrp}
                  </span>
                )}

                {/* Save badge */}
                {isDiscounted && (
                  <Badge className="bg-green-50 text-green-700 border border-green-200 font-semibold text-xs rounded-full px-2.5 py-0.5">
                    Save ₹{saving}
                  </Badge>
                )}
              </div>

              {isDiscounted && (
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
              )}
            </div>

            {/* ── Description ── */}
            {p.description && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  About this product
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
              </div>
            )}

            {/* ── Stock status ── */}
            <div>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  In Stock &nbsp;·&nbsp; {p.stock} available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* ── Add to Cart + Subscribe ── */}
            {inStock ? (
              <div className="space-y-3">
                {/* Add to Cart (uses existing ProductCardAddToCart) */}
                <div className="w-full">
                  <ProductCardAddToCart
                    productId={p._id}
                    productStock={p.stock}
                    size="lg"
                    className="w-full h-12 text-base font-semibold rounded-xl"
                    onAddSuccess={() => toast.success('Added to cart!')}
                  />
                </div>

                {/* Subscribe */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 rounded-xl border-2 border-[#0C8A00] text-[#0C8A00] font-semibold hover:bg-green-50 transition-colors"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to subscribe');
                      navigate('/auth');
                      return;
                    }
                    setSubscriptionDialogOpen(true);
                  }}
                >
                  🔔 Subscribe &amp; Save
                </Button>
              </div>
            ) : (
              /* Out-of-stock state */
              <Button
                size="lg"
                disabled
                className="w-full h-12 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed"
              >
                Currently Unavailable
              </Button>
            )}

            {/* ── Delivery Info Strip ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-around divide-x divide-gray-100">
                <DeliveryItem
                  icon={Clock}
                  label="30 Min Delivery"
                  sub="Lightning fast"
                  iconColor="text-amber-500"
                />
                <DeliveryItem
                  icon={Truck}
                  label="Free Delivery"
                  sub="Above ₹199"
                  iconColor="text-blue-500"
                />
                <DeliveryItem
                  icon={ShieldCheck}
                  label="Quality Assured"
                  sub="Fresh & hygienic"
                  iconColor="text-green-600"
                />
              </div>
            </div>

            {/* ── Ratings & Reviews ── */}
            <ReviewSection productId={p._id} productName={p.name} />

          </div>
          {/* end RIGHT */}
        </div>

        {/* ── Related Products ── */}
        <RelatedProducts currentProductId={p._id} categoryId={p.category?._id} />
      </div>

      {/* Subscription Dialog */}
      {p && (
        <SubscriptionDialog
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
          product={p}
          initialQuantity={1}
        />
      )}
    </div>
  );
};

export default ProductDetail;
