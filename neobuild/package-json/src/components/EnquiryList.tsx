import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EnquiryItem } from '@/types/database';
import { Trash2, ShoppingCart, Loader2, Check } from 'lucide-react';

interface EnquiryListProps {
  visitId: string;
  refreshTrigger: number;
}

export default function EnquiryList({ visitId, refreshTrigger }: EnquiryListProps) {
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; quantity: number } | null>(null);

  useEffect(() => {
    fetchItems();
  }, [visitId, refreshTrigger]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('enquiry_items').select('*, products(*)').eq('visit_id', visitId).order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data as EnquiryItem[]);
    } catch (err) { console.error('Error fetching items:', err); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    setActioningId(id);
    try {
      await supabase.from('enquiry_items').delete().eq('id', id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error('Error deleting:', err); } finally { setActioningId(null); }
  };

  const handleUpdateQuantity = async () => {
    if (!editingItem) return;
    setActioningId(editingItem.id);
    try {
      const { data, error } = await supabase
        .from('enquiry_items')
        .update({ quantity: editingItem.quantity })
        .eq('id', editingItem.id)
        .select()
        .single();
      if (error) throw error;
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, quantity: data.quantity } : item));
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <div className="py-4 text-center text-gray-500 text-xs">Loading items...</div>;
  if (items.length === 0) return null;

  return (
    <div className="mt-4 bg-white rounded-md border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center text-xs font-semibold text-gray-700">
        <ShoppingCart className="h-3.5 w-3.5 mr-2" /> Enquiry Items ({items.length})
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 gap-2">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-sm font-medium text-gray-900 truncate">{item.products?.article_no} - {item.products?.name}</div>
            </div>
            <div className="flex items-center gap-2">
              {editingItem?.id === item.id ? (
                <input 
                  type="number" 
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  autoFocus
                  onBlur={handleUpdateQuantity}
                />
              ) : (
                <div className="text-sm text-gray-700 px-2 py-1 rounded bg-gray-100 cursor-pointer" onClick={() => setEditingItem({ id: item.id, quantity: item.quantity })}>
                  Qty: {item.quantity}
                </div>
              )}
              {editingItem?.id === item.id ? (
                <button onClick={handleUpdateQuantity} disabled={actioningId === item.id} className="text-green-600 hover:text-green-800 p-1">
                  {actioningId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
              ) : (
                <button onClick={() => handleDelete(item.id)} disabled={actioningId === item.id} className="text-gray-400 hover:text-red-600 p-1">
                  {actioningId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}