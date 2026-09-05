import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface Order {
  id: string;
  date: string;
  products: number;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
}

interface OrderItemProps {
  order: Order;
}

export default function OrderItem({ order }: OrderItemProps) {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      {/* Desktop Table Row */}
      <tr className="hidden border-b border-line transition-colors hover:bg-cream/30 sm:table-row">
        <td className="py-4 pl-4 font-medium text-ink sm:pl-6">#{order.id}</td>
        <td className="py-4 text-espresso-light">{order.date}</td>
        <td className="py-4 text-espresso-light">{order.products} items</td>
        <td className="py-4 text-ink">${order.total.toFixed(2)}</td>
        <td className="py-4">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </td>
        <td className="py-4 pr-4 text-right sm:pr-6">
          <Link 
            to={`/account/orders/${order.id}`}
            className="inline-flex items-center text-sm font-medium text-gold transition-colors hover:text-gold-light"
          >
            View
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </td>
      </tr>

      {/* Mobile Card */}
      <div className="flex flex-col border-b border-line p-4 sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-ink">#{order.id}</span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="text-sm text-espresso-light mb-4">
          {order.date} &middot; {order.products} items &middot; <span className="text-ink font-medium">${order.total.toFixed(2)}</span>
        </div>
        <Link 
          to={`/account/orders/${order.id}`}
          className="flex items-center justify-center w-full rounded-md border border-line bg-cream/30 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
        >
          View Order Details
        </Link>
      </div>
    </>
  );
}
