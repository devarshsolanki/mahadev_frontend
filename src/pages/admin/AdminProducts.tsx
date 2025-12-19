import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/api/products';
import { adminApi, ProductUpdatePayload, CategoryCreatePayload, CategoryUpdatePayload } from '@/api/admin';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryForm, setEditingCategoryForm] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    unit: '',
    category: '',
    isFeatured: false,
    image: null as File | null,
    imageUrl: '',
    imageSource: 'upload', // 'upload' | 'url'
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: () => productsApi.getProducts({
      limit: 100,
      search: searchQuery || undefined,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    // Try the flat categories endpoint first; if it returns an empty array
    // fall back to the category tree endpoint and flatten it for selects.
    queryFn: async () => {
      try {
        const res = await categoriesApi.getCategories();
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          return res;
        }

        // Fallback to tree
        const treeRes = await categoriesApi.getCategoryTree();
        const tree = treeRes?.data || [];

        // Flatten tree into array
        const flat: any[] = [];
        const traverse = (nodes: any[]) => {
          nodes.forEach((n) => {
            // Keep top-level fields expected by the UI
            flat.push({
              _id: n._id,
              name: n.name,
              description: n.description,
              level: n.level || 0,
              parentCategory: n.parentCategory || null,
            });
            if (n.children && n.children.length) traverse(n.children);
          });
        };
        traverse(tree);

        return { success: true, data: flat };
      } catch (err) {
        throw err;
      }
    },
  });

  // Normalize categories to an array to avoid rendering errors when the
  // API returns an unexpected shape or during loading/failure states.
  const categoryList = Array.isArray(categories?.data) ? categories.data : [];

  // Category mutations for admin
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryCreatePayload) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
    },
    onError: (err: any) => toast.error(String(err?.message || err || 'Failed to create category')),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryCreatePayload> }) => adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setEditingCategoryId(null);
      setEditingCategoryForm(null);
    },
    onError: (err: any) => toast.error(String(err?.message || err || 'Failed to update category')),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');

      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => adminApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); // Refresh dashboard stats
      toast.success('Product created successfully');
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | ProductUpdatePayload }) => adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); // Refresh dashboard stats
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
      image: null,
      imageUrl: '',
      imageSource: 'upload',
    });
  };

  const handleSubmit = async () => {
    // For new products, validate all required fields
    if (!editingProduct && (!formData.name || !formData.price || !formData.mrp || !formData.stock || !formData.category)) {
      toast.error('Please fill all required fields');
      return;
    }

    // For editing, only validate fields that have been changed
    if (editingProduct) {
      const updates: Record<string, any> = {};
      let hasUpdates = false;

      // Compare each field with the original product
      Object.entries(formData).forEach(([key, value]) => {
        // Skip image-related fields - they're handled separately
        if (key === 'image' || key === 'imageUrl' || key === 'imageSource') return;

        // Convert numbers to strings for comparison
        const originalValue = typeof editingProduct[key] === 'number' ? String(editingProduct[key]) : editingProduct[key];
        const currentValue = typeof value === 'number' ? String(value) : value;

        if (originalValue !== currentValue && value !== '') {
          updates[key] = value;
          hasUpdates = true;
        }
      });

      // Handle image updates
      if (formData.image || (formData.imageSource === 'url' && formData.imageUrl)) {
        if (formData.image) {
          const productData = new FormData();
          productData.append('image', formData.image);
          Object.entries(updates).forEach(([key, value]) => {
            productData.append(key, String(value));
          });
          updateMutation.mutate({ id: editingProduct._id, data: productData });
          return;
        } else if (formData.imageSource === 'url' && formData.imageUrl) {
          updates.imageUrl = formData.imageUrl;
        }
      }

      // If there are updates, send them
      if (hasUpdates) {
        updateMutation.mutate({ id: editingProduct._id, data: updates });
      } else {
        toast.info('No changes to update');
      }
      return;
    }

    // Handle new product creation
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('mrp', formData.mrp);
    productData.append('stock', formData.stock);
    productData.append('unit', formData.unit);
    productData.append('category', formData.category);
    productData.append('isFeatured', String(formData.isFeatured));

    if (formData.image) {
      productData.append('image', formData.image);
    } else if (formData.imageSource === 'url' && formData.imageUrl) {
      productData.append('imageUrl', formData.imageUrl);
    }

    createMutation.mutate(productData);
  }


  const handleEdit = (product: any) => {
    // Defensive assignments: some products may not have price/mrp/stock
    // (for example when using variants) or `category` may already be a
    // string id. Use safe coercion to avoid calling `.toString()` on
    // undefined which caused the runtime error.
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      mrp: product.mrp != null ? String(product.mrp) : '',
      stock: product.stock != null ? String(product.stock) : '',
      unit: product.unit || '',
      // category can be an object or a string id depending on API shape
      category: typeof product.category === 'string' ? product.category : product.category?._id || '',
      isFeatured: !!product.isFeatured,
      image: null,
      imageUrl: (Array.isArray(product.images) && product.images.length) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : '',
      imageSource: (Array.isArray(product.images) && product.images.length) ? 'url' : 'upload',
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
        <div className="flex items-center gap-4">
          {/* Search input */}
          <div className="relative w-64">
            {/* <Button size="sm" onClick={() => { setEditingCategoryId(cat._id); setEditingCategoryForm({ name: cat.name, description: cat.description || '', image: cat.image || '', displayOrder: cat.displayOrder || 0, parentCategory: (cat.parentCategory && typeof cat.parentCategory === 'object') ? cat.parentCategory._id : (cat.parentCategory || '') }); }}>Edit</Button> */}
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
          </div>
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
                onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          {/* Manage Categories dialog (controlled so ProductForm can open it) */}
          <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsManageCategoriesOpen(true)}>Manage Categories</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <CategoryForm
                  categories={categoryList}
                  onCreate={(data: any) => createCategoryMutation.mutate(data)}
                />

                <div className="space-y-2">
                  {categoryList.map((cat: any) => (
                    <div key={cat._id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{cat.level}</Badge>
                        <Button size="sm" onClick={() => {
                          setEditingCategoryId(cat._id);
                          setEditingCategoryForm({
                            name: cat.name || '',
                            description: cat.description || '',
                            image: cat.image || '',
                            displayOrder: cat.displayOrder ?? 0,
                            parentCategory: (cat.parentCategory && typeof cat.parentCategory === 'object') ? cat.parentCategory._id : (cat.parentCategory || ''),
                            // preload slug/url if available
                            slug: (cat.slug || cat.url || ''),
                          });
                        }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeletingCategoryId(cat._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Category Dialog (smaller dedicated modal) */}
                <Dialog open={!!editingCategoryId} onOpenChange={(open) => { if (!open) { setEditingCategoryId(null); setEditingCategoryForm(null); } }}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label>Name *</Label>
                        <Input value={editingCategoryForm?.name || ''} onChange={(e) => setEditingCategoryForm({ ...editingCategoryForm, name: e.target.value })} />
                      </div>

                      <div>
                        <Label>URL / Slug</Label>
                        <Input value={editingCategoryForm?.slug || ''} onChange={(e) => setEditingCategoryForm({ ...editingCategoryForm, slug: e.target.value })} />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea value={editingCategoryForm?.description || ''} onChange={(e) => setEditingCategoryForm({ ...editingCategoryForm, description: e.target.value })} rows={2} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Image URL</Label>
                          <Input value={editingCategoryForm?.image || ''} onChange={(e) => setEditingCategoryForm({ ...editingCategoryForm, image: e.target.value })} />
                        </div>
                        <div>
                          <Label>Display Order</Label>
                          <Input type="number" value={editingCategoryForm?.displayOrder ?? 0} onChange={(e) => setEditingCategoryForm({ ...editingCategoryForm, displayOrder: Number(e.target.value) })} />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingCategoryId(null); setEditingCategoryForm(null); }}>Cancel</Button>
                        <Button size="sm" onClick={() => {
                          if (!editingCategoryId) return;
                          const dataToSend: any = {
                            name: editingCategoryForm.name,
                            description: editingCategoryForm.description,
                            image: editingCategoryForm.image || undefined,
                            displayOrder: Number(editingCategoryForm.displayOrder) || 0,
                          };
                          if (editingCategoryForm.parentCategory) dataToSend.parentCategory = editingCategoryForm.parentCategory;
                          if (editingCategoryForm.slug) dataToSend.slug = editingCategoryForm.slug;

                          updateCategoryMutation.mutate({ id: editingCategoryId, data: dataToSend });
                        }}>Save</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
            onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Products List (compact single-row per product) */}
      <div className="space-y-2">
                  {products?.data?.map((product: any) => (
          <div key={product._id} className="flex items-center gap-4 p-3 border rounded bg-card">
            <div className="flex-shrink-0 w-16 h-16 bg-muted rounded overflow-hidden flex items-center justify-center">
              <img
                src={
                  Array.isArray(product.images) && product.images.length
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                    : '/placeholder.svg'
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="truncate">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.category?.name || 'Uncategorized'}</p>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">₹{product.price}</div>
                    {product.mrp > product.price && (
                      <div className="text-xs text-muted-foreground line-through">₹{product.mrp}</div>
                    )}
                  </div>

                  <Badge variant={product.stock === 0 ? 'destructive' : 'outline'}>Stock: {product.stock}</Badge>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingCategoryId}
        onOpenChange={() => setDeletingCategoryId(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (deletingCategoryId) {
            deleteCategoryMutation.mutate(deletingCategoryId);
            setDeletingCategoryId(null);
          }
        }}
      />
    </div>
  );
};

const ProductForm = ({ formData, setFormData, categories, onSubmit, isSubmitting, onOpenManageCategories }: any) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file, imageSource: 'upload', imageUrl: '' });
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, imageUrl: e.target.value, imageSource: 'url', image: null });
  };

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
        {(!categories || categories.length === 0) ? (
          <div className="p-3 border rounded bg-muted/50">
            <p className="text-sm mb-2">No categories available. Create categories first to assign products.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenManageCategories && onOpenManageCategories()}>Manage Categories</Button>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <div>
        <Label htmlFor="image">Product Image</Label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="imageSource"
                checked={formData.imageSource === 'upload'}
                onChange={() => setFormData({ ...formData, imageSource: 'upload' })}
              />
              <span className="text-sm">Upload</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="imageSource"
                checked={formData.imageSource === 'url'}
                onChange={() => setFormData({ ...formData, imageSource: 'url' })}
              />
              <span className="text-sm">Use URL</span>
            </label>
          </div>

          {formData.imageSource === 'upload' ? (
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
          ) : (
            <Input id="imageUrl" type="text" placeholder="https://...jpg" value={formData.imageUrl} onChange={handleImageUrlChange} />
          )}
        </div>

        {/* Preview */}
        {formData.imageUrl && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Preview:</p>
            <img src={formData.imageUrl} alt="preview" className="h-32 object-contain mt-1" />
          </div>
        )}
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

const CategoryForm = ({ categories, onCreate }: any) => {
  const [form, setForm] = useState({ name: '', description: '', parentCategory: '', image: '', displayOrder: 0 });
  const NONE_PARENT_VALUE = '__none';

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    onCreate({
      name: form.name,
      description: form.description,
      parentCategory: form.parentCategory || undefined,
      image: form.image || undefined,
      displayOrder: Number(form.displayOrder) || 0,
    });
    // Keep the form/dialog open so admin can add multiple categories quickly.
    // Clear only the name field so user can continue adding under the same parent.
    setForm({ ...form, name: '' });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>Parent Category</Label>
        <Select value={form.parentCategory || NONE_PARENT_VALUE} onValueChange={(v) => setForm({ ...form, parentCategory: v === NONE_PARENT_VALUE ? '' : v })}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_PARENT_VALUE}>None</SelectItem>
            {categories.map((c: any) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Image URL</Label>
          <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <div>
          <Label>Display Order</Label>
          <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleCreate}>Create Category</Button>
      </div>
    </div>
  );
};

export default AdminProducts;
