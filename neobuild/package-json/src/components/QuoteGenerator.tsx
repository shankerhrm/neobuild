import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import { X, Save, FileText, Calculator, CheckCircle2, Download, FileType } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuoteGeneratorProps {
  quoteId?: string | null;
  visitId?: string | null;
  customerName?: string;
  onClose: () => void;
}

interface QuoteLineItem {
  product: Product;
  quantity: number;
  price: number;
}

export default function QuoteGenerator({ quoteId, visitId, customerName: initialCustomerName, onClose }: QuoteGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<QuoteLineItem[]>([]);
  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [taxPercent, setTaxPercent] = useState(18);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [terms, setTerms] = useState("1. Payment: 100% advance.\n2. Delivery: 2-3 weeks.\n3. Validity: 30 days.");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState<number | null>(null);

  useEffect(() => {
    if (quoteId) fetchExistingQuote(quoteId);
    else if (visitId) fetchEnquiryItems(visitId);
  }, [quoteId, visitId]);

  const fetchExistingQuote = async (id: string) => {
    try {
      const { data: quote, error: qError } = await supabase.from('quotes').select('*').eq('id', id).single();
      if (qError) throw qError;
      setCustomerName(quote.customer_name);
      setTaxPercent(quote.tax_percent);
      setDiscountPercent(quote.discount_percent);
      setTerms(quote.terms_conditions || '');
      setQuoteNumber(quote.quote_number);
      const { data: qItems, error: iError } = await supabase.from('quote_items').select('*, products(*)').eq('quote_id', id);
      if (iError) throw iError;
      setItems((qItems || []).map((item: any) => ({ product: item.products, quantity: item.quantity, price: item.unit_price })));
    } catch (err) { console.error("Error loading quote:", err); } finally { setLoading(false); }
  };

  const fetchEnquiryItems = async (vid: string) => {
    try {
      const { data, error } = await supabase.from('enquiry_items').select('*, products(*)').eq('visit_id', vid);
      if (error) throw error;
      setItems((data || []).map((item: any) => ({ product: item.products, quantity: item.quantity, price: item.products.price })));
    } catch (err) { console.error("Error loading items:", err); } finally { setLoading(false); }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);
    return { subtotal, discountAmount, taxAmount, total: taxableAmount + taxAmount };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const handleSaveQuote = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      let currentQuoteId = quoteId;
      const quoteData = { customer_name: customerName, subtotal, tax_percent: taxPercent, discount_percent: discountPercent, total_amount: total, terms_conditions: terms, status: 'sent' };

      if (currentQuoteId) {
        await supabase.from('quotes').update(quoteData).eq('id', currentQuoteId);
        await supabase.from('quote_items').delete().eq('quote_id', currentQuoteId);
      } else {
        const { data: quote } = await supabase.from('quotes').insert({ ...quoteData, visit_id: visitId || null, created_by: userData.user?.id }).select().single();
        currentQuoteId = quote.id;
        setQuoteNumber(quote.quote_number);
      }

      const quoteItems = items.map(item => ({ quote_id: currentQuoteId!, product_id: item.product.id, quantity: item.quantity, unit_price: item.price, line_total: item.quantity * item.price }));
      await supabase.from('quote_items').insert(quoteItems);
      setSuccess(true);
      if (!quoteId) setTimeout(() => onClose(), 2000);
    } catch (err) { console.error("Error saving:", err); alert("Failed to save."); } finally { setSaving(false); }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(196, 106, 0); doc.text("LAKHOTIA ENTERPRISE", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text("Premier Industrial Supplier", 14, 26);
    doc.setFontSize(12); doc.setTextColor(0); doc.text(`Quote #: ${quoteNumber || 'DRAFT'}`, 140, 20);
    doc.text(`To: ${customerName}`, 14, 45);
    autoTable(doc, { startY: 55, head: [['Article No', 'Description', 'Qty', 'Unit Price', 'Total']], body: items.map(i => [i.product.article_no || i.product.sku, i.product.name, i.quantity, i.price, i.quantity * i.price]), theme: 'striped', headStyles: { fillColor: [196, 106, 0] } });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total: INR ${total.toLocaleString('en-IN')}`, 140, finalY + 20);
    doc.save(`Quote_${quoteNumber}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-brand-600" /> {quoteId ? `Edit Quote #${quoteNumber}` : 'New Quote'}</h2>
          <button onClick={onClose}><X className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success && !quoteId ? <div className="text-center text-green-600"><CheckCircle2 className="h-16 w-16 mx-auto" /><h3>Saved!</h3></div> : (
            <>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border p-2 rounded" placeholder="Customer Name" />
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50"><tr><th className="p-2 text-left">Product</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Total</th></tr></thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{item.product.name}<br/><span className="text-xs text-gray-500">{item.product.article_no}</span></td>
                      <td className="p-2 text-right"><input type="number" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = +e.target.value; setItems(n); }} className="w-16 border rounded p-1 text-right" /></td>
                      <td className="p-2 text-right"><input type="number" value={item.price} onChange={(e) => { const n = [...items]; n[idx].price = +e.target.value; setItems(n); }} className="w-24 border rounded p-1 text-right" /></td>
                      <td className="p-2 text-right">{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 p-4 rounded flex flex-col gap-2">
                 <div className="flex justify-between"><span>Subtotal</span><span>{subtotal}</span></div>
                 <div className="flex justify-between"><span>Total</span><span className="font-bold text-brand-700">{total}</span></div>
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
          {(quoteId || success) && <button onClick={generatePDF} className="flex items-center px-3 py-2 border rounded bg-white"><Download className="h-4 w-4 mr-2" /> PDF</button>}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded bg-white">Close</button>
            {!success && <button onClick={handleSaveQuote} disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">{saving ? 'Saving...' : 'Save'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}