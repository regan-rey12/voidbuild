"use client";
export default function Pricing({ data, style }: any) {
  const primary = style?.primaryColor || '#111827';
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex px-3 py-1 rounded-full bg-white border text-xs font-semibold mb-4">Fair Prices • UGX • No Hidden Fees</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{data.heading || 'Fair Prices - UGX'}</h2>
          <p className="mt-3 text-gray-600">All prices in UGX. Pay via MTN MoMo. No dollars.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {(data.plans || [
            {name:"Basic", price:"UGX 35,000", features:["Box Braids","Wash included","1 week guarantee"]},
            {name:"Popular", price:"UGX 60,000", popular:true, features:["Braids + Nails","Makeup","Free retouch","Priority"]},
            {name:"Bridal", price:"UGX 150,000", features:["Full bridal","Trial + Day","Home service","Veil"]},
          ]).map((p: any, i: number) => (
            <div key={i} className={`relative rounded-[24px] p-7 border bg-white ${p.popular ? 'border-gray-900 shadow-2xl shadow-gray-900/10 scale-[1.03] -rotate-[0.5deg]' : 'border-gray-100 shadow-sm'} hover:shadow-xl hover:-translate-y-1 transition-all`}>
              {p.popular && <div className="absolute -top-3 left-7 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">MOST POPULAR</div>}
              <div className="font-bold text-sm opacity-70 uppercase tracking-widest">{p.name}</div>
              <div className="text-3xl font-extrabold mt-3">{p.price}</div>
              <div className="mt-1 text-xs text-gray-500">One time • No monthly</div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f: string, j: number) => (
                  <li key={j} className="flex gap-2"><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${primary}15`, color: primary }}>✓</span><span className="text-gray-700">{f}</span></li>
                ))}
              </ul>
              <button className="w-full mt-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{backgroundColor: primary}}>Book on WhatsApp →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
