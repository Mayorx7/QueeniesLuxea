import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type OrderStepStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUS_STEPS: OrderStepStatus[] = ["confirmed", "processing", "shipped", "delivered"];

export const STATUS_LABEL: Record<OrderStepStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

interface OrderStatusStepperProps {
  status: OrderStepStatus;
}

export default function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  // Use state to trigger progressive animations on mount
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Slight delay to ensure paint happens first
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isTerminal = status === "cancelled" || status === "refunded";
  if (isTerminal) return null;

  // "pending" means we are at step -1 essentially (before confirmed)
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="w-full pb-8 pt-4">
      <div className="flex items-center">
        {STATUS_STEPS.map((step, i) => {
          const done = currentIndex >= 0 && i <= currentIndex;
          const active = i === currentIndex;
          
          return (
            <div key={step} className={`flex ${i === STATUS_STEPS.length - 1 ? "" : "flex-1"} items-center relative`}>
              
              {/* Step Indicator */}
              <div className="flex flex-col items-center relative z-10 shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-700 ease-out ${
                    mounted && done
                      ? "border-gold bg-gold text-ivory scale-100 shadow-[0_0_15px_rgba(198,161,91,0.4)]"
                      : "border-line bg-cream text-espresso-light scale-95"
                  } ${mounted && active ? "ring-4 ring-gold/20 animate-pulse" : ""}`}
                  style={{
                    transitionDelay: `${i * 150}ms`
                  }}
                >
                  {done ? (
                    <CheckCircle 
                      size={18} 
                      className={`transition-all duration-500 ease-out`}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "scale(1)" : "scale(0.5)",
                        transitionDelay: `${i * 150 + 200}ms`
                      }} 
                    />
                  ) : (
                    <span className="text-sm font-semibold">{i + 1}</span>
                  )}
                </div>
                
                {/* Label (absolute so it doesn't break flex spacing) */}
                <span
                  className={`absolute -bottom-7 text-[0.65rem] font-semibold uppercase tracking-wider transition-colors duration-500 whitespace-nowrap ${
                    mounted && done ? "text-gold" : "text-espresso-light/50"
                  }`}
                  style={{
                    transitionDelay: `${i * 150 + 100}ms`
                  }}
                >
                  {STATUS_LABEL[step]}
                </span>
              </div>
              
              {/* Connector Line */}
              {i < STATUS_STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 relative h-1 bg-line/60 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gold rounded-full transition-all duration-1000 ease-in-out"
                    style={{
                      width: mounted && currentIndex > i ? "100%" : "0%",
                      transitionDelay: `${i * 150 + 200}ms`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Pending Note */}
      {status === "pending" && (
        <div 
          className="mt-12 rounded-xl border border-amber-200/50 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 text-center transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)"
          }}
        >
          Payment confirmation pending — your order will be confirmed shortly.
        </div>
      )}
    </div>
  );
}
