import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import { Search, Package, Loader2, Plus } from 'lucide-react';

interface ProductSearchProps {
  onAddToVisit?: (product: Product, qty: number) => Promise<void>;
}

export default function ProductSearch({ onAddToVisit }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  const searchProducts = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase.from('products').select('*').limit(20);
      if (searchTerm.trim()) {
        const searchFilter = [`name.ilike.%${searchTerm}%`, `sku.ilike.%${searchTerm}%`, `article_no.ilike.%${searchTerm}%`].join(',');
        queryBuilder = queryBuilder.or(searchFilter);
      } else {
        queryBuilder = queryBuilder.order('name');
      }
      const { data, error } = await queryBuilder;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && products.length === 0 && !query) searchProducts('');
  }, [isOpen, searchProducts, products.length, query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => { if (isOpen) searchProducts(query); }, 400);
    return () => clearTimeout(timeoutId);
  }, [query, isOpen, searchProducts]);

  const handleAdd = async (product: Product) => {
    if (!onAddToVisit) return;
    const qty = quantities[product.id] || 1;
    setAddingId(product.id);
    try {
      await onAddToVisit(product, qty);
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center font-medium text-gray-700">
          <Package className="h-5 w-5 mr-2 text-brand-500" />
          Product Catalog & Enquiry
        </div>
        <span className="text-brand-600 text-sm">{isOpen ? 'Hide' : 'Show'}</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by Article No, or Name..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4 text-gray-500"><Loader2 className="h-5 w-5 animate-spin mr-2" />Searching...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">No products found.</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-brand-200 transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {product.article_no ? <span className="text-brand-700 font-mono mr-2">{product.article_no}</span> : null}
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Price: ₹{product.price.toLocaleString()}</div>
                  </div>
                  {onAddToVisit && (
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <input type="number" min="1" value={quantities[product.id] || 1} onChange={(e) => setQuantities(prev => ({...prev, [product.id]: parseInt(e.target.value) || 1}))} className="w-16 px-2 py-1 text-sm border border-gray-300 rounded" />
                      <button onClick={() => handleAdd(product)} disabled={addingId === product.id} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50">
                        {addingId === product.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />} Add
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}