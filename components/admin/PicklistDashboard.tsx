'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Package,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_time: number
  picked_at: string | null
  packed_at: string | null
  picked_by: string | null
  packed_by: string | null
  product: {
    name: string
    sku: string
    images: string[]
  }
  order: {
    order_number: string
    status: string
    delivery_date: string | null
    delivery_address: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
    } | null
    user: {
      first_name: string
      last_name: string
      business_name: string
    }
  }
}

export function PicklistDashboard() {
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    date: '',
    status: 'all',
    search: '',
  })
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPicklistItems()
  }, [filters])

  const fetchPicklistItems = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('order_items')
        .select(
          `
          *,
          product:products (name, sku, images),
          order:orders (
            order_number,
            status,
            delivery_date,
            delivery_address,
            user:users (first_name, last_name, business_name)
          )
        `
        )
        .order('created_at', { ascending: false })

      // Filter by delivery date
      if (filters.date) {
        query = query.eq('order.delivery_date', filters.date)
      }

      // Filter by status
      if (filters.status !== 'all') {
        if (filters.status === 'unpicked') {
          query = query.is('picked_at', null)
        } else if (filters.status === 'picked') {
          query = query.not('picked_at', 'is', null).is('packed_at', null)
        } else if (filters.status === 'packed') {
          query = query.not('packed_at', 'is', null)
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      let filteredData = data || []

      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredData = filteredData.filter(
          item =>
            item.product?.name?.toLowerCase().includes(searchLower) ||
            item.product?.sku?.toLowerCase().includes(searchLower) ||
            item.order?.order_number?.toLowerCase().includes(searchLower) ||
            item.order?.user?.business_name?.toLowerCase().includes(searchLower)
        )
      }

      setItems(filteredData as OrderItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load picklist')
    } finally {
      setLoading(false)
    }
  }

  const markAsPicked = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('order_items')
        .update({
          picked_at: new Date().toISOString(),
          picked_by: user?.id,
        })
        .eq('id', itemId)

      if (error) throw error

      await fetchPicklistItems()
    } catch (err) {
      console.error('Error marking as picked:', err)
    } finally {
      setUpdating(null)
    }
  }

  const markAsPacked = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('order_items')
        .update({
          packed_at: new Date().toISOString(),
          packed_by: user?.id,
        })
        .eq('id', itemId)

      if (error) throw error

      await fetchPicklistItems()
    } catch (err) {
      console.error('Error marking as packed:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    const csv = [
      ['Order Number', 'Product', 'SKU', 'Quantity', 'Customer', 'Delivery Address', 'Status'],
      ...items.map(item => [
        item.order.order_number,
        item.product.name,
        item.product.sku,
        item.quantity.toString(),
        item.order.user.business_name ||
          `${item.order.user.first_name} ${item.order.user.last_name}`,
        item.order.delivery_address
          ? `${item.order.delivery_address.street}, ${item.order.delivery_address.city}, ${item.order.delivery_address.state} ${item.order.delivery_address.zipCode}`
          : 'N/A',
        item.packed_at ? 'Packed' : item.picked_at ? 'Picked' : 'Unpicked',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `picklist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-background border border-border rounded-xl p-6 print:hidden">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="search"
                type="text"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-brand focus:border-brand"
                placeholder="Order, product, customer..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Delivery Date
            </label>
            <input
              id="date"
              type="date"
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-brand focus:border-brand"
            >
              <option value="all">All Items</option>
              <option value="unpicked">Unpicked</option>
              <option value="picked">Picked (Not Packed)</option>
              <option value="packed">Packed</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-md hover:opacity-90"
          >
            <Printer className="h-4 w-4" />
            Print Picklist
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-background border border-border rounded-xl p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading picklist...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-destructive">Error loading picklist</h3>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Picklist Items */}
      {!loading && !error && (
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back when there are orders to fulfill.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider print:hidden">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-accent">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {item.order.order_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.order.delivery_date
                            ? new Date(item.order.delivery_date).toLocaleDateString()
                            : 'No date set'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-muted-foreground">SKU: {item.product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl font-bold text-foreground">{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">
                          {item.order.user.business_name ||
                            `${item.order.user.first_name} ${item.order.user.last_name}`}
                        </div>
                        {item.order.delivery_address && (
                          <div className="text-sm text-muted-foreground">
                            {item.order.delivery_address.street}, {item.order.delivery_address.city}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {item.packed_at ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Packed
                            </span>
                          ) : item.picked_at ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
                              <Package className="h-3 w-3" />
                              Picked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">
                              Unpicked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                        <div className="flex justify-end gap-2">
                          {!item.picked_at && (
                            <button
                              onClick={() => markAsPicked(item.id)}
                              disabled={updating === item.id}
                              className="inline-flex items-center gap-1 px-3 py-1 border border-brand text-brand rounded-md hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Pick
                            </button>
                          )}
                          {item.picked_at && !item.packed_at && (
                            <button
                              onClick={() => markAsPacked(item.id)}
                              disabled={updating === item.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-success text-white rounded-md hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Package className="h-3 w-3" />
                              )}
                              Pack
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          table,
          table * {
            visibility: visible;
          }
          nav,
          header,
          footer,
          .print\\:hidden,
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
