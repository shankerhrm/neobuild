import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AttendanceLog } from '@/types/database';
import { X, Save, Loader2, FileText } from 'lucide-react';

interface EditVisitModalProps {
  logId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function EditVisitModal({ logId, onClose, onSave }: EditVisitModalProps) {
  const [log, setLog] = useState<Partial<AttendanceLog>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('attendance_logs').select('*').eq('id', logId).single();
        if (error) throw error;
        setLog(data || {});
      } catch (err: any) {
        setError('Failed to load visit details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [logId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLog(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from('attendance_logs').update({
        site_name: log.site_name,
        customer_name: log.customer_name,
        contact_person: log.contact_person,
        contact_number: log.contact_number,
        visit_summary: log.visit_summary,
      }).eq('id', logId);
      if (error) throw error;
      onSave();
      onClose();
    } catch (err: any) {
      setError('Failed to save changes.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-brand-600" /> Edit Visit Log</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
            ) : (
              <>
                <div>
                  <label htmlFor="site_name" className="block text-sm font-medium text-gray-700">Site Name</label>
                  <input type="text" id="site_name" name="site_name" value={log.site_name || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input type="text" id="customer_name" name="customer_name" value={log.customer_name || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <input type="text" id="contact_person" name="contact_person" value={log.contact_person || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input type="text" id="contact_number" name="contact_number" value={log.contact_number || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="visit_summary" className="block text-sm font-medium text-gray-700">Visit Summary / Notes</label>
                  <textarea id="visit_summary" name="visit_summary" value={log.visit_summary || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md bg-white text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving || loading} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}