'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [productIds, setProductIds] = useState('')

  const syncProducts = async () => {
    setSyncing(true)
    setMessage('')

    try {
      // Parse product IDs from textarea
      const ids = productIds
        .split(/[\n,]/)
        .map(id => id.trim())
        .filter(id => id.length > 0)

      const response = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds: ids })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync products')
      }

      if (result.errors && result.errors.length > 0) {
        setMessage(`Synced ${result.products} products. Errors: ${result.errors.join(', ')}`)
      } else {
        setMessage(`Successfully synced ${result.products} products!`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
    }
  }

  const seedFromCSV = async () => {
    setSyncing(true)
    setMessage('')

    try {
      // For now, we'll run the seed script manually
      setMessage('To seed from CSV, run: bun supabase:seed')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

      <div className="grid gap-6">
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Product Management</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Sync from Lucky Supply API</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enter product IDs to fetch from Lucky Supply (one per line or comma-separated)
              </p>
              <textarea
                value={productIds}
                onChange={(e) => setProductIds(e.target.value)}
                placeholder="Enter product IDs...&#10;Example:&#10;123456&#10;789012&#10;345678"
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-brand focus:border-brand mb-3"
                rows={5}
              />
              <button
                onClick={syncProducts}
                disabled={syncing || !productIds.trim()}
                className="bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync Products'}
              </button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Bulk Import Options</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Import from CSV file in public/assets/
                  </p>
                  <button
                    onClick={seedFromCSV}
                    disabled={syncing}
                    className="bg-secondary text-foreground px-4 py-2 rounded-xl hover:bg-accent disabled:opacity-50"
                  >
                    Import CSV Products
                  </button>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Run complete Lucky Supply scraper (2-step process):
                  </p>
                  <div className="space-y-2">
                    <code className="block text-xs bg-secondary p-2 rounded">
                      1. bun run scripts/scrape-lucky-ids.ts
                    </code>
                    <code className="block text-xs bg-secondary p-2 rounded">
                      2. bun run scripts/fetch-lucky-products.ts
                    </code>
                    <code className="block text-xs bg-secondary p-2 rounded">
                      3. bun run scripts/import-lucky-to-supabase.ts
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded ${
              message.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Lucky Supply API Information</h2>
          <p className="text-sm text-muted-foreground mb-3">
            The Lucky Supply API is available at:
          </p>
          <pre className="p-3 bg-secondary rounded text-xs overflow-x-auto">
{`https://luckysupplyapps.com/product_api/getProduct.php?product_id={product_id}`}
          </pre>
          <p className="text-sm text-muted-foreground mt-3">
            This API provides product data including title, description, images, variants, pricing, and availability.
            No authentication is required.
          </p>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Example Product IDs from CSV:</h3>
            <p className="text-sm text-muted-foreground">
              spirit-classic-thermal-8-1-2-x-11<br/>
              spirit-classic-thermal-8-1-2-x-14
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}