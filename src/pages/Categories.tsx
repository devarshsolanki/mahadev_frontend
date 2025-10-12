import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '@/api/products';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Category } from '@/api/types';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categoriesData = categories?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop by Category</h1>
        <p className="text-muted-foreground">Browse our wide range of products organized by category</p>
      </div>

      <div className="space-y-8">
        {categoriesData.map((category: Category) => (
          <div key={category._id}>
            <Card
              className="p-6 cursor-pointer card-hover mb-4"
              onClick={() => navigate(`/products?category=${category._id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    {category.description && (
                      <p className="text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </Card>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-4">
                {category.children.map((subCategory: Category) => (
                  <Card
                    key={subCategory._id}
                    className="p-4 cursor-pointer card-hover"
                    onClick={() => navigate(`/products?category=${subCategory._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{subCategory.name}</h3>
                        {subCategory.children && subCategory.children.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {subCategory.children.length} subcategories
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
