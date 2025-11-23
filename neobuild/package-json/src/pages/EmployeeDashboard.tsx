import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { AttendanceLog, LocationData, Json, Product } from "@/types/database";
import { MapPin, Clock, FileText } from "lucide-react";
import ProductSearch from "@/components/ProductSearch";
import EnquiryList from "@/components/EnquiryList";

export default function EmployeeDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeSession, setActiveSession] = useState<AttendanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [refreshEnquiry, setRefreshEnquiry] = useState(0);
  const [siteName, setSiteName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [visitSummary, setVisitSummary] = useState("");

  // Redirect admins away from the check-in screen
  if (!authLoading && profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => { 
    if (user && !authLoading && profile?.role !== 'admin') fetchActiveSession(); 
  }, [user, authLoading, profile]);

  const fetchActiveSession = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("attendance_logs").select("*").eq("user_id", user.id).is("check_out_time", null).order("check_in_time", { ascending: false }).maybeSingle();
      if (error) throw error;
      if (data) {
        setActiveSession(data as any);
        setCustomerName(data.customer_name || "");
        setContactPerson(data.contact_person || "");
        setContactNumber(data.contact_number || "");
        setVisitSummary(data.visit_summary || "");
      } else {
        setActiveSession(null);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error("No Geolocation"));
      navigator.geolocation.getCurrentPosition(p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }), e => reject(new Error("Location denied")));
    });
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !siteName.trim()) return setError("Site name required");
    setActionLoading(true); setError(null);
    try {
      const loc = await getCurrentLocation();
      const { error } = await supabase.from("attendance_logs").insert({ user_id: user.id, site_name: siteName, check_in_location: loc as unknown as Json });
      if (error) throw error;
      fetchActiveSession(); setSiteName("");
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handleUpdateDetails = async (silent = false) => {
    if (!activeSession) return;
    if (!silent) setActionLoading(true);
    try {
      const { error } = await supabase.from("attendance_logs").update({ customer_name: customerName, contact_person: contactPerson, contact_number: contactNumber, visit_summary: visitSummary }).eq("id", activeSession.id);
      if (error) throw error;
      if (!silent) setSuccessMsg("Saved.");
    } catch (err: any) { setError(err.message); } finally { if (!silent) setActionLoading(false); }
  };

  const handleAddProduct = async (product: Product, qty: number) => {
    if (!activeSession) return;
    try {
      await supabase.from('enquiry_items').insert({ visit_id: activeSession.id, product_id: product.id, quantity: qty });
      setRefreshEnquiry(p => p + 1); setSuccessMsg(`Added ${product.name}`); setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) { setError("Failed to add product"); }
  };

  const handleCheckOut = async () => {
    if (!activeSession) return;
    setActionLoading(true);
    try {
      await handleUpdateDetails(true);
      const loc = await getCurrentLocation();
      await supabase.from("attendance_logs").update({ check_out_time: new Date().toISOString(), check_out_location: loc as unknown as Json }).eq("id", activeSession.id);
      setActiveSession(null); setCustomerName(""); setContactPerson(""); setContactNumber(""); setVisitSummary("");
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  if (authLoading || (loading && !activeSession && profile?.role !== 'admin')) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {error && <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>}
      {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded">{successMsg}</div>}

      {activeSession ? (
        <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-brand-400">
          <div className="flex justify-between items-start mb-6">
            <div><h2 className="text-2xl font-bold">Active Visit</h2><div className="text-gray-600"><MapPin className="inline h-4 w-4"/> {activeSession.site_name}</div></div>
            <div className="text-brand-700 bg-brand-50 px-3 py-1 rounded-full"><Clock className="inline h-4 w-4"/> {new Date(activeSession.check_in_time).toLocaleTimeString()}</div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border space-y-3">
              <h3 className="font-semibold flex items-center"><FileText className="h-4 w-4 mr-2"/> Visit Details</h3>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Company Name" className="w-full border rounded p-2" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Contact Person" className="w-full border rounded p-2" />
                <input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="Phone" className="w-full border rounded p-2" />
              </div>
              <textarea value={visitSummary} onChange={e => setVisitSummary(e.target.value)} placeholder="Summary/Notes" rows={3} className="w-full border rounded p-2" />
              <button onClick={() => handleUpdateDetails(false)} className="text-xs bg-white border px-2 py-1 rounded">Save Draft</button>
            </div>
            <ProductSearch onAddToVisit={handleAddProduct} />
            <EnquiryList visitId={activeSession.id} refreshTrigger={refreshEnquiry} />
            <button onClick={handleCheckOut} disabled={actionLoading} className="w-full py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700">{actionLoading ? "Checking Out..." : "Check Out"}</button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-brand-400">
          <h2 className="text-2xl font-bold mb-4">Start New Visit</h2>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Site / Location Name" required className="w-full border rounded p-3" />
            <button type="submit" disabled={actionLoading} className="w-full py-3 bg-brand-600 text-white rounded font-bold hover:bg-brand-700">{actionLoading ? "Checking In..." : "Check In"}</button>
          </form>
        </div>
      )}
    </div>
  );
}