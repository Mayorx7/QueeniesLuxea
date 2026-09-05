import { Link } from "react-router-dom";
import OrderItem, { type Order } from "./OrderItem";

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-ivory overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-4 sm:p-6">
        <h3 className="font-display text-lg text-ink">Recent Orders</h3>
        <Link 
          to="/account/orders" 
          className="text-sm font-medium text-gold hover:text-gold-light transition-colors"
        >
          View All
        </Link>
      </div>
      
      {orders.length > 0 ? (
        <div className="w-full">
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-cream/50 text-xs uppercase text-espresso-light sm:table-header-group">
              <tr>
                <th scope="col" className="py-3 pl-4 font-medium sm:pl-6">Order ID</th>
                <th scope="col" className="py-3 font-medium">Date</th>
                <th scope="col" className="py-3 font-medium">Products</th>
                <th scope="col" className="py-3 font-medium">Total</th>
                <th scope="col" className="py-3 font-medium">Status</th>
                <th scope="col" className="py-3 pr-4 font-medium text-right sm:pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-espresso-light">
          <p>You haven't placed any orders yet.</p>
          <Link 
            to="/shop" 
            className="mt-4 inline-block text-gold hover:text-gold-light font-medium"
          >
            Start shopping
          </Link>
        </div>
      )}
    </div>
  );
}
