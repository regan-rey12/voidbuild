"use client";
export default function Testimonials({ data, style }: any) {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center">{data.heading || 'What Clients Say'}</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {(data.testimonials || [
            {name:"Grace N.", role:"Wandegeya", text:"Aisha is the best! My braids lasted 1 month."},
            {name:"Musa K.", role:"Mbale", text:"Fast delivery, fair price for cement."},
            {name:"Sarah L.", role:"Kampala", text:"WhatsApp booking is so easy."},
          ]).map((t: any, i: number) => (
            <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="text-yellow-400">★★★★★</div>
              <p className="mt-3 text-gray-700 text-sm">"{t.text}"</p>
              <div className="mt-4 font-bold text-sm">{t.name}</div>
              <div className="text-xs text-gray-500">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
