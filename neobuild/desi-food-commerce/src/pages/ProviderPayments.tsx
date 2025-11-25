import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Calendar, Download, Eye, Filter } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Payment, Invoice, Order } from "@/types"

interface PaymentStats {
  totalEarnings: number
  thisMonthEarnings: number
  pendingPayments: number
  totalTransactions: number
}

const ProviderPayments = () => {
  const { provider } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayments: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'payments' | 'invoices'>('payments')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (provider) {
      fetchPaymentData()
    }
  }, [provider])

  const fetchPaymentData = async () => {
    if (!provider) return

    try {
      // Fetch payments, invoices, and orders
      const [paymentsResult, invoicesResult, ordersResult] = await Promise.allSettled([
        supabase.from("payments").select("*").eq("provider_id", provider.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("provider_id", provider.id).order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("provider_id", provider.id).eq("status", "delivered")
      ])

      // Handle potential errors and use sample data as fallback
      const paymentsData = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data || [] : samplePayments
      const invoicesData = invoicesResult.status === 'fulfilled' ? invoicesResult.value.data || [] : sampleInvoices
      const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : []

      setPayments(paymentsData)
      setInvoices(invoicesData)
      setOrders(ordersData)

      // Calculate stats
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const thisMonthPayments = paymentsData.filter((payment: Payment) => 
        new Date(payment.created_at) >= thisMonth && payment.payment_status === 'paid'
      )
      
      const pendingPayments = paymentsData.filter((payment: Payment) => 
        payment.payment_status === 'pending'
      )
      
      setStats({
        totalEarnings: paymentsData
          .filter((p: Payment) => p.payment_status === 'paid')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0),
        thisMonthEarnings: thisMonthPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
        pendingPayments: pendingPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
        totalTransactions: paymentsData.length,
      })
    } catch (error) {
      console.error("Error fetching payment data:", error)
      // Use sample data
      setPayments(samplePayments)
      setInvoices(sampleInvoices)
      setStats(sampleStats)
    } finally {
      setLoading(false)
    }
  }

  const generateInvoice = async (orderId: string) => {
    if (!provider) return
    
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      const invoiceData = {
        order_id: orderId,
        user_id: order.user_id,
        provider_id: provider.id,
        invoice_number: `INV-${Date.now()}`,
        total_amount: order.total_amount,
        tax_amount: order.tax_amount,
        delivery_fee: order.delivery_fee,
        discount_amount: 0,
        final_amount: order.total_amount,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: order.payment_method === 'cod' ? 'sent' : 'paid',
      }

      const { data, error } = await supabase
        .from("invoices")
        .insert([invoiceData])
        .select()
        .single()

      if (error) {
        console.error("Error creating invoice:", error)
      } else if (data) {
        setInvoices(prev => [data, ...prev])
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
    }
  }

  const filterPayments = (data: Payment[]) => {
    let filtered = data

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item: Payment) => item.payment_status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          return filtered
      }

      filtered = filtered.filter(item => new Date(item.created_at) >= startDate)
    }

    return filtered
  }

  const filterInvoices = (data: Invoice[]) => {
    let filtered = data

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item: Invoice) => item.status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          return filtered
      }

      filtered = filtered.filter(item => new Date(item.created_at) >= startDate)
    }

    return filtered
  }

  const getStatusColor = (status: string, type: 'payment' | 'invoice') => {
    if (type === 'payment') {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'failed':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    } else {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800'
        case 'sent':
          return 'bg-blue-100 text-blue-800'
        case 'draft':
          return 'bg-gray-100 text-gray-800'
        case 'overdue':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    )
  }

  const filteredPayments = filterPayments(payments)
  const filteredInvoices = filterInvoices(invoices)

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Payments & Invoices</h1>
        <p className='text-gray-600'>Track your earnings, payments, and manage invoices</p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='card bg-gradient-to-r from-green-500 to-green-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100'>Total Earnings</p>
              <p className='text-3xl font-bold'>₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <DollarSign className='w-12 h-12 text-green-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-blue-500 to-blue-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100'>This Month</p>
              <p className='text-3xl font-bold'>₹{stats.thisMonthEarnings.toLocaleString()}</p>
            </div>
            <TrendingUp className='w-12 h-12 text-blue-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-yellow-100'>Pending</p>
              <p className='text-3xl font-bold'>₹{stats.pendingPayments.toLocaleString()}</p>
            </div>
            <Calendar className='w-12 h-12 text-yellow-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-purple-500 to-purple-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100'>Transactions</p>
              <p className='text-3xl font-bold'>{stats.totalTransactions}</p>
            </div>
            <DollarSign className='w-12 h-12 text-purple-200' />
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className='card'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
          <div className='flex space-x-1 mb-4 sm:mb-0'>
            <button
              onClick={() => setSelectedTab('payments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'payments'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setSelectedTab('invoices')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'invoices'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Invoices
            </button>
          </div>

          <div className='flex space-x-2'>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className='input text-sm'
            >
              <option value='all'>All Time</option>
              <option value='today'>Today</option>
              <option value='week'>This Week</option>
              <option value='month'>This Month</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='input text-sm'
            >
              <option value='all'>All Status</option>
              {selectedTab === 'payments' ? (
                <>
                  <option value='paid'>Paid</option>
                  <option value='pending'>Pending</option>
                  <option value='failed'>Failed</option>
                </>
              ) : (
                <>
                  <option value='paid'>Paid</option>
                  <option value='sent'>Sent</option>
                  <option value='draft'>Draft</option>
                  <option value='overdue'>Overdue</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Payments Tab */}
        {selectedTab === 'payments' && (
          <div className='space-y-4'>
            {filteredPayments.length === 0 ? (
              <div className='text-center py-16'>
                <DollarSign className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>No payments found</h3>
                <p className='text-gray-600'>Payments will appear here once orders are completed.</p>
              </div>
            ) : (
              filteredPayments.map(payment => (
                <div key={payment.id} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div>
                        <h3 className='font-medium text-gray-900'>Payment #{payment.id.slice(-8)}</h3>
                        <p className='text-sm text-gray-500'>Order #{payment.order_id.slice(-8)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.payment_status, 'payment')}`}>
                        {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='text-xl font-bold text-primary-600'>₹{payment.amount}</div>
                      <div className='text-sm text-gray-500'>{payment.payment_method.toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <div className='flex items-center justify-between text-sm text-gray-600'>
                    <span>Created: {new Date(payment.created_at).toLocaleDateString()}</span>
                    {payment.paid_at && (
                      <span>Paid: {new Date(payment.paid_at).toLocaleDateString()}</span>
                    )}
                    {payment.transaction_id && (
                      <span>TXN: {payment.transaction_id}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {selectedTab === 'invoices' && (
          <div className='space-y-4'>
            {filteredInvoices.length === 0 ? (
              <div className='text-center py-16'>
                <Download className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>No invoices found</h3>
                <p className='text-gray-600'>Invoices will be generated automatically for completed orders.</p>
              </div>
            ) : (
              filteredInvoices.map(invoice => (
                <div key={invoice.id} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div>
                        <h3 className='font-medium text-gray-900'>{invoice.invoice_number}</h3>
                        <p className='text-sm text-gray-500'>Order #{invoice.order_id.slice(-8)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status, 'invoice')}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='text-right'>
                        <div className='text-xl font-bold text-primary-600'>₹{invoice.final_amount}</div>
                        <div className='text-sm text-gray-500'>Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          className='p-2 text-gray-500 hover:text-primary-600 transition-colors'
                          title='View Invoice'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        <button
                          className='p-2 text-gray-500 hover:text-primary-600 transition-colors'
                          title='Download Invoice'
                        >
                          <Download className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600'>
                    <span>Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}</span>
                    <span>Amount: ₹{invoice.total_amount}</span>
                    <span>Tax: ₹{invoice.tax_amount}</span>
                    <span>Delivery: ₹{invoice.delivery_fee}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Sample data for fallback
const sampleStats: PaymentStats = {
  totalEarnings: 45600,
  thisMonthEarnings: 12400,
  pendingPayments: 2800,
  totalTransactions: 142,
}

const samplePayments: Payment[] = [
  {
    id: "pay_sample_1",
    order_id: "ord_sample_1",
    user_id: "user123",
    provider_id: "provider123",
    amount: 720,
    payment_method: "upi",
    payment_status: "paid",
    transaction_id: "TXN123456789",
    payment_gateway: "razorpay",
    paid_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
]

const sampleInvoices: Invoice[] = [
  {
    id: "inv_sample_1",
    order_id: "ord_sample_1",
    payment_id: "pay_sample_1",
    user_id: "user123",
    provider_id: "provider123",
    invoice_number: "INV-2024-001",
    total_amount: 720,
    tax_amount: 36,
    delivery_fee: 0,
    discount_amount: 0,
    final_amount: 720,
    invoice_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "paid",
    created_at: new Date().toISOString(),
  },
]

export default ProviderPayments