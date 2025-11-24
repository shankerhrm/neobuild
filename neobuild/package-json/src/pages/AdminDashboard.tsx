import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AttendanceLog, Quote } from '@/types/database';
import { Users, MapPin, FileText, TrendingUp, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
import QuoteGenerator from '@/components/QuoteGenerator';
import EditVisitModal from '@/components/EditVisitModal';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState({ visits: 0, enquiries: 0, quotes: 0 });
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedVisitIdForQuote, setSelectedVisitIdForQuote] = useState<string | null>(null);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visits' | 'quotes'>('visits');
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: logsData } = await supabase.from('attendance_logs').select('*, profiles(full_name, email), enquiry_items(count)').order('check_in_time', { ascending: false });
      const { data: quotesData } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
      const today = new Date().toISOString().split('T')[0];
      const todaysVisits = logsData?.filter(l => l.check_in_time.startsWith(today)).length || 0;
      const totalEnquiries = logsData?.reduce((acc, log) => acc + (log.enquiry_items?.[0]?.count || 0), 0) || 0;

      setLogs((logsData as any) || []);
      setQuotes(quotesData || []);
      setStats({ visits: todaysVisits, enquiries: totalEnquiries, quotes: quotesData?.length || 0 });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteVisit = async (logId: string) => {
    if (!window.confirm("Are you sure you want to delete this visit? This will also delete related enquiries and quotes.")) return;
    setActioningId(logId);
    try {
      const { error } = await supabase.from('attendance_logs').delete().eq('id', logId);
      if (error) throw error;
      setLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err) { console.error(err); alert('Failed to delete visit.'); } finally { setActioningId(null); }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!window.confirm("Are you sure you want to delete this quote?")) return;
    setActioningId(quoteId);
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
      if (error) throw error;
      setQuotes(prev => prev.filter(q => q.id !== quoteId));
    } catch (err) { console.error(err); alert('Failed to delete quote.'); } finally { setActioningId(null); }
  };

  const closeModals = () => {
    setSelectedVisitIdForQuote(null);
    setEditingQuoteId(null);
    setEditingVisitId(null);
    fetchData(); // Refresh data after closing any modal
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Visits Today</p><p className="text-2xl font-bold">{stats.visits}</p></div><div className="p-3 bg-brand-100 rounded-full"><MapPin className="h-6 w-6 text-brand-600" /></div></div></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Total Enquiries</p><p className="text-2xl font-bold">{stats.enquiries}</p></div><div className="p-3 bg-blue-100 rounded-full"><TrendingUp className="h-6 w-6 text-blue-600" /></div></div></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Total Quotes</p><p className="text-2xl font-bold">{stats.quotes}</p></div><div className="p-3 bg-green-100 rounded-full"><FileText className="h-6 w-6 text-green-600" /></div></div></div>
      </div>
      <div className="border-b"><nav className="-mb-px flex space-x-8"><button onClick={() => setActiveTab('visits')} className={`${activeTab === 'visits' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Visits</button><button onClick={() => setActiveTab('quotes')} className={`${activeTab === 'quotes' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Quotes</button></nav></div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? <div className='p-4 text-center'>Loading...</div> : null}
          {activeTab === 'visits' ? logs.map((log) => (
            <li key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex-1"><p className="font-medium text-brand-600">{log.site_name}</p><p className="text-sm text-gray-500">{log.profiles?.full_name}</p></div>
                <div className="text-sm text-gray-500"><Calendar className="inline h-4 w-4 mr-1"/>{format(new Date(log.check_in_time), 'MMM d, h:mm a')}</div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => setSelectedVisitIdForQuote(log.id)} className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded">Quote</button>
                  <button onClick={() => setEditingVisitId(log.id)} className="p-2 text-gray-400 hover:text-brand-600"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteVisit(log.id)} disabled={actioningId === log.id} className="p-2 text-gray-400 hover:text-red-600">{actioningId === log.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                </div>
              </div>
            </li>
          )) : quotes.map((quote) => (
            <li key={quote.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex-1"><p className="font-medium text-brand-600">#{quote.quote_number} - {quote.customer_name}</p><p className="text-sm text-gray-500">Total: ₹{quote.total_amount.toLocaleString()}</p></div>
                <div className="text-sm text-gray-500">{format(new Date(quote.created_at), 'MMM d, yyyy')}</div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => setEditingQuoteId(quote.id)} className="p-2 text-gray-400 hover:text-brand-600"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteQuote(quote.id)} disabled={actioningId === quote.id} className="p-2 text-gray-400 hover:text-red-600">{actioningId === quote.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(selectedVisitIdForQuote || editingQuoteId) && (
        <QuoteGenerator 
          visitId={selectedVisitIdForQuote} 
          quoteId={editingQuoteId}
          customerName={logs.find(l => l.id === selectedVisitIdForQuote)?.customer_name || ''}
          onClose={closeModals} 
        />
      )}
      {editingVisitId && (
        <EditVisitModal 
          logId={editingVisitId} 
          onClose={() => setEditingVisitId(null)} 
          onSave={fetchData} 
        />
      )}
    </div>
  );
}