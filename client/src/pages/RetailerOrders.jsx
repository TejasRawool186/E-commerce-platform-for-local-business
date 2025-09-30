import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Loader2, MapPin } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'ordered', label: 'Confirmed & Invoiced' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

function Timeline({ currentStatus }) {
  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const active = currentIndex >= index;
        return (
          <div key={step.key} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{index+1}</div>
            <div className="ml-2 mr-2">
              <div className={`text-sm ${active ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 ${currentIndex > index ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const RetailerOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['retailer-orders-page'],
    queryFn: () => api.getRetailerOrders({ limit: 20 })
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="card p-8 text-center text-text-secondary">No orders yet.</div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id || order._id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="text-sm text-text-secondary">Order ID</div>
                    <div className="font-mono font-semibold">#{(order.id || order._id).slice(-8)}</div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <div className="font-semibold text-text-primary">{order.Product?.name || order.productId?.name}</div>
                    <div className="text-sm text-text-secondary">Qty: {order.quantity} {order.Product?.unit || order.productId?.unit} • ₹{Number(order.totalAmount).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 md:mt-0 text-sm text-text-secondary flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {order.seller?.pincode || order.sellerId?.pincode}
                  </div>
                </div>
                <Timeline currentStatus={order.status} />
                <div className="mt-4 text-sm text-text-secondary">
                  {order.OrderTimelines?.length ? (
                    <ul className="list-disc ml-5">
                      {order.OrderTimelines.sort((a,b)=> new Date(a.occurredAt) - new Date(b.occurredAt)).map(t => (
                        <li key={t.id}>{new Date(t.occurredAt).toLocaleString()} — {t.status.replaceAll('_',' ')} {t.message ? `- ${t.message}` : ''}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>No timeline events yet.</div>
                  )}
                </div>
                {(order.status === 'ordered' || order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
                  <div className="mt-4">
                    <a href={`/uploads/invoices/${order.id || order._id}.pdf`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">View Invoice</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerOrders;


