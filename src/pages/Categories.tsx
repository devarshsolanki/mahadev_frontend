import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '@/api/products';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Categories = () => {
  const navigate = useNavigate();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getCategoryTree,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-xl shadow-sm">
              <Skeleton className="h-40 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categoryList = categories?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>

      {/* Main Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categoryList.map((category) => (
          <div key={category._id}>
            <Card
              className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group transition-all"
              onClick={() => navigate(`/products?category=${category._id}`)}
            >
              {/* Background Image */}
              <img
                src={
                  category.image
                    ? typeof category.image === "string"
                      ? category.image
                      : category.image
                    : "/placeholder.svg"
                }
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>

              {/* Text */}
              <div className="absolute bottom-3 left-3 text-white">
                <h2 className="text-lg font-semibold">{category.name}</h2>
                {category.children?.length > 0 && (
                  <p className="text-xs opacity-80">
                    {category.children.length} subcategories
                  </p>
                )}
              </div>
            </Card>

            {/* Subcategory Slider */}
            {category.children && category.children.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-lg">{category.name} Subcategories</h3>

                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {category.children.map((sub) => (
                    <Card
                      key={sub._id}
                      className="min-w-[150px] h-36 rounded-xl overflow-hidden cursor-pointer relative group"
                      onClick={() => navigate(`/products?category=${sub._id}`)}
                    >
                      {/* Background Image */}
                      <img
                        src={
                          sub.image
                            ? typeof sub.image === "string"
                              ? sub.image
                              : sub.image
                            : "/placeholder.svg"
                        }
                        alt={sub.name}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                      />

                      {/* Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>

                      {/* Text */}
                      <div className="absolute bottom-2 left-2 text-white">
                        <p className="text-sm font-medium">{sub.name}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
