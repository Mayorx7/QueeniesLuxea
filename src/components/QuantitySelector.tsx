import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center border border-espresso/30">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="flex h-11 w-11 items-center justify-center text-espresso transition-colors hover:bg-cream disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="flex h-11 w-11 items-center justify-center text-espresso transition-colors hover:bg-cream disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
