import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceLog } from '@/types/database';
import { Calendar, MapPin, Clock, Edit, Trash2, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import EditVisitModal from '@/components/EditVisitModal';

export default function History() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('attendance_logs').select('*').eq('user_id', user.id).order('check_in_time', { ascending: false });
      if (error) throw error;
      setLogs((data as any) || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!window.confirm("Are you sure you want to delete this visit log? This action cannot be undone.")) return;
    setDeletingId(logId);
    try {
      const { error } = await supabase.from('attendance_logs').delete().eq('id', logId);
      if (error) throw error;
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    } catch (err: any) {
      console.error('Failed to delete log:', err);
      alert(`Could not delete the visit log: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-brand-500" />Loading history...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Visit History</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
      {logs.length === 0 ? <div className="text-gray-500 bg-white p-6 rounded shadow text-center">No history found. Start your first visit from the dashboard!</div> : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white shadow rounded-lg p-5 border-l-4 border-brand-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{log.site_name}</h3>
                  <p className="text-sm text-gray-500 mt-1"><MapPin className="inline h-4 w-4 text-brand-500"/> {log.customer_name || 'No Company Name'}</p>
                  {log.visit_summary && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded block"><FileText className="inline h-3 w-3 mr-1"/> {log.visit_summary}</p>}
                </div>
                <div className='flex items-center gap-2 flex-col sm:flex-row'>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${log.check_out_time ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {log.check_out_time ? 'Completed' : 'Active'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingLogId(log.id)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded-full" title="Edit Details">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(log.id)} disabled={deletingId === log.id} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete Log">
                      {deletingId === log.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-3">
                <div><Calendar className="inline h-4 w-4 mr-1"/> {format(new Date(log.check_in_time), 'MMM d, yyyy')}</div>
                <div><Clock className="inline h-4 w-4 mr-1"/> {format(new Date(log.check_in_time), 'h:mm a')} - {log.check_out_time ? format(new Date(log.check_out_time), 'h:mm a') : 'Now'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingLogId && (
        <EditVisitModal 
          logId={editingLogId} 
          onClose={() => setEditingLogId(null)} 
          onSave={fetchHistory} 
        />
      )}
    </div>
  );
}