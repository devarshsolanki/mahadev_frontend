import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/api/products';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Loader2 } from 'lucide-react';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    unit: '',
    category: '',
    isFeatured: false,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
      setEditingProduct(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      mrp: '',
      stock: '',
      unit: '',
      category: '',
      isFeatured: false,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.mrp || !formData.stock || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    const productData: any = {
      ...formData,
      price: Number(formData.price),
      mrp: Number(formData.mrp),
      stock: Number(formData.stock),
      discount: Math.round(((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      mrp: product.mrp.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
      category: product.category._id,
      isFeatured: product.isFeatured,
    });
    setEditingProduct(product);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              formData={formData}
              setFormData={setFormData}
              categories={categories?.data || []}
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={categories?.data || []}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.data?.products?.map((product: any) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              )}
              {product.isFeatured && (
                <Badge className="absolute top-2 left-2">Featured</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{product.category.name}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-primary">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-muted-foreground line-through ml-2">₹{product.mrp}</span>
                  )}
                </div>
                <Badge variant="outline">Stock: {product.stock}</Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProductForm = ({ formData, setFormData, categories, onSubmit, isSubmitting }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="mrp">MRP *</Label>
          <Input
            id="mrp"
            type="number"
            value={formData.mrp}
            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            placeholder="e.g., 1kg, 500g"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat: any) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isFeatured"
          checked={formData.isFeatured}
          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          className="h-4 w-4"
        />
        <Label htmlFor="isFeatured">Featured Product</Label>
      </div>

      <Button className="w-full" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Product'
        )}
      </Button>
    </div>
  );
};

export default AdminProducts;
