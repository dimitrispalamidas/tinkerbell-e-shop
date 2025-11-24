'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function TestEmailPage() {
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Array<{ viva_order_code: string; total: number; created_at: string; payment_status: string }>>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('orders')
          .select('viva_order_code, total, created_at, payment_status')
          .order('created_at', { ascending: false })
          .limit(10);

        if (data) {
          setRecentOrders(data.filter((o: any) => o.viva_order_code));
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const handleTest = async () => {
    if (!orderCode.trim()) {
      setError('Please enter an order code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/test/email?orderCode=${encodeURIComponent(orderCode.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to test email');
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Email Sending</CardTitle>
          <CardDescription>
            Test email sending for a specific order. This will send both customer and admin emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter order code (e.g., 6491664591072602)"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleTest();
                }
              }}
              disabled={loading}
            />
            <Button onClick={handleTest} disabled={loading || !orderCode.trim()}>
              {loading ? 'Testing...' : 'Test Email'}
            </Button>
          </div>

          {recentOrders.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm font-semibold text-gray-700 mb-2">📋 Recent Orders (Click to use):</p>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((order) => (
                  <button
                    key={order.viva_order_code}
                    onClick={() => {
                      setOrderCode(order.viva_order_code);
                      setError(null);
                      setResult(null);
                    }}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors"
                    disabled={loading}
                  >
                    <span className="font-mono">{order.viva_order_code}</span>
                    <span className="ml-2 text-gray-500">
                      €{parseFloat(order.total.toString()).toFixed(2)}
                    </span>
                    {order.payment_status === 'paid' && (
                      <span className="ml-2 text-green-600">✓ Paid</span>
                    )}
                  </button>
                ))}
              </div>
              {loadingOrders && (
                <p className="text-xs text-gray-500 mt-2">Loading orders...</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-semibold mb-2">✅ Test Completed</p>
                <p className="text-green-600 text-sm">
                  Order Code: <strong>{result.orderCode}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.results.customerEmail.success ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-semibold">✅ Sent Successfully</p>
                        {result.results.customerEmail.messageId && (
                          <p className="text-sm text-gray-600">
                            Message ID: <code className="bg-gray-100 px-1 rounded">{result.results.customerEmail.messageId}</code>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-600 font-semibold">❌ Failed</p>
                        <p className="text-sm text-red-500 mt-1">
                          {result.results.customerEmail.error}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.results.adminEmail.success ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-semibold">✅ Sent Successfully</p>
                        <p className="text-sm text-gray-600">
                          Recipients: <strong>{result.results.adminEmail.recipients}</strong>
                        </p>
                      </div>
                    ) : result.results.adminEmail.skipped ? (
                      <div>
                        <p className="text-yellow-600 font-semibold">⏭️ Skipped</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Order not paid yet
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-600 font-semibold">❌ Failed</p>
                        <p className="text-sm text-red-500 mt-1">
                          {result.results.adminEmail.error}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm font-semibold mb-1">📋 Debugging Info:</p>
                <p className="text-blue-600 text-xs">
                  Check server logs for detailed information about discounts and email data.
                </p>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                  View Full Response (JSON)
                </summary>
                <pre className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

