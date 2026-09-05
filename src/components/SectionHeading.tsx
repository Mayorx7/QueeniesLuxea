interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({ eyebrow, title, align = "left", className = "" }: SectionHeadingProps) {
  return (
    <div className={`${align === "center" ? "text-center" : "text-left"} ${className}`}>
      {eyebrow && (
        <p className="eyebrow mb-3 text-gold">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-normal sm:text-4xl">{title}</h2>
    </div>
  );
}
