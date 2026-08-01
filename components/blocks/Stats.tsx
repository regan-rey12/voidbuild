"use client";
export default function Stats({ data, style }: any) {
  const primary = style?.primaryColor || '#111827';
  const stats = data.stats || [
    { number: "500+", label: "Happy Clients" },
    { number: "5", label: "Years Experience" },
    { number: "30min", label: "Delivery Time" },
  ];
  return (
    <section className="py-12 px-6" style={{ backgroundColor: `${primary}0D` }}>
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 text-center">
        {stats.map((s: any, i: number) => (
          <div key={i}>
            <div className="text-3xl md:text-4xl font-extrabold" style={{ color: primary }}>{s.number}</div>
            <div className="mt-1 text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
