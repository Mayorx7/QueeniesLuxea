import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  title: string;
  content: ReactNode;
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.title}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-wide text-ink"
              >
                {item.title}
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5 text-sm leading-relaxed text-espresso-light"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
