import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Truck, ShoppingBag } from "lucide-react";
import OrderStatusStepper from "../components/orders/OrderStatusStepper";

interface OrderState {
  orderNumber: string;
  email: string;
  name: string;
  address: string;
  delivery: string;
  total: number;
  itemCount: number;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state as OrderState | null;

  useEffect(() => {
    if (!order) {
      navigate("/shop", { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      {/* Success mark */}
      <div className="flex flex-col items-center text-center">
        <CheckCircle
          size={52}
          className="text-gold"
          strokeWidth={1.25}
          aria-hidden="true"
        />
        <p className="eyebrow mt-6 text-gold">Order Confirmed</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Thank You, {order.name.split(" ")[0]}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-espresso-light">
          We've received your order and are preparing it with care. A
          confirmation will be sent to{" "}
          <span className="font-semibold text-espresso">{order.email}</span>.
        </p>
      </div>

      {/* Order details card */}
      <div className="mt-12 border border-line">
        <div className="border-b border-line px-6 py-5">
          <p className="eyebrow text-espresso-light">Order Reference</p>
          <p className="mt-1 font-display text-2xl text-ink">{order.orderNumber}</p>
        </div>

        <div className="divide-y divide-line">
          <div className="flex items-start gap-4 px-6 py-5">
            <ShoppingBag
              size={18}
              className="mt-0.5 shrink-0 text-gold"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <p className="eyebrow text-espresso-light">Items</p>
              <p className="mt-1 text-sm text-ink">
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ·{" "}
                {formatPrice(order.total)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-5">
            <MapPin
              size={18}
              className="mt-0.5 shrink-0 text-gold"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <p className="eyebrow text-espresso-light">Delivery Address</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {order.address}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-5">
            <Truck
              size={18}
              className="mt-0.5 shrink-0 text-gold"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <p className="eyebrow text-espresso-light">Delivery Method</p>
              <p className="mt-1 text-sm text-ink">{order.delivery} Shipping</p>
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="mt-12 rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <p className="eyebrow mb-6 text-espresso-light text-center">Order Progress</p>
        <div className="mx-auto max-w-lg">
          <OrderStatusStepper status="confirmed" />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          to="/shop"
          className="eyebrow bg-ink px-8 py-4 text-ivory transition-colors hover:bg-espresso"
        >
          Continue Shopping
        </Link>
        <Link
          to="/account/orders"
          className="eyebrow border border-espresso px-8 py-4 text-espresso transition-colors hover:bg-cream"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
