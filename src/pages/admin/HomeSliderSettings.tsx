import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/api/products';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const HomeSliderSettings = () => {
  const qc = useQueryClient();
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories-list'],
    queryFn: categoriesApi.getCategories,
  });

  const { data: currentRes, isLoading } = useQuery({
    queryKey: ['admin-home-sliders'],
    queryFn: adminApi.getHomeSliderSettings,
  });

  const categories: any[] = categoriesRes?.data || [];

  const initialSelected = (currentRes?.data || []).map((s: any) => ({
    categoryId: s.category?._id || s.categoryId,
    name: s.category?.name || categories.find((c: any) => c._id === s.categoryId)?.name || 'Unknown',
  }));

  const [selected, setSelected] = useState<Array<{ categoryId: string; name: string }>>(initialSelected);

  const addCategory = (cat: any) => {
    if (selected.find((s) => s.categoryId === cat._id)) return;
    setSelected((s) => [...s, { categoryId: cat._id, name: cat.name }]);
  };

  const removeCategory = (id: string) => {
    setSelected((s) => s.filter((x) => x.categoryId !== id));
  };

  const move = (index: number, dir: number) => {
    setSelected((prev) => {
      const arr = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      const tmp = arr[newIndex];
      arr[newIndex] = arr[index];
      arr[index] = tmp;
      return arr;
    });
  };

  const mutation = useMutation({
    mutationFn: (payload: Array<{ categoryId: string; order: number }>) =>
      adminApi.updateHomeSliderSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-home-sliders'] });
      alert('Saved home slider settings');
    },
    onError: (err: any) => {
      alert('Error saving settings: ' + (err?.message || 'unknown'));
    },
  });

  const save = () => {
    const payload = selected.map((s, idx) => ({ categoryId: s.categoryId, order: idx }));
    mutation.mutate(payload);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Home Slider Settings</h1>
      <p className="text-muted-foreground mb-6">Select which categories should appear on the home page sliders and arrange their order.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Selected Categories (order matters)</h3>
            {isLoading ? (
              <div>Loading...</div>
            ) : selected.length === 0 ? (
              <div className="text-sm text-muted-foreground">No categories selected</div>
            ) : (
              <ul className="space-y-2">
                {selected.map((s, idx) => (
                  <li key={s.categoryId} className="flex items-center justify-between p-2 border rounded">
                    <div className="font-medium">{s.name}</div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 bg-muted rounded" onClick={() => move(idx, -1)} disabled={idx === 0}>↑</button>
                      <button className="px-2 py-1 bg-muted rounded" onClick={() => move(idx, 1)} disabled={idx === selected.length - 1}>↓</button>
                      <button className="px-2 py-1 bg-destructive text-white rounded" onClick={() => removeCategory(s.categoryId)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Button onClick={save} disabled={(mutation as any).isLoading}>Save Settings</Button>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Available Categories</h3>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {categories.map((cat: any) => (
                  <div key={cat._id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <img src={cat.image || '/placeholder.svg'} alt={cat.name} className="w-10 h-10 object-cover rounded" />
                    <div>{cat.name}</div>
                  </div>
                  <div>
                    <Button size="sm" onClick={() => addCategory(cat)} disabled={!!selected.find(s => s.categoryId === cat._id)}>Add</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeSliderSettings;
