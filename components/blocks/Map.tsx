"use client";
export default function MapBlock({ data, style }: any) {
  const location = data.location || 'Wandegeya, Kampala';
  const query = encodeURIComponent(location);
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center">{data.heading || `Find Us - ${location}`}</h2>
        <p className="text-center text-gray-600 mt-2">{data.subheading || 'We are easy to find. Call before coming.'}</p>
        <div className="mt-8 rounded-2xl overflow-hidden border shadow-sm h-[350px] bg-gray-100">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
            title={`Map for ${location}`}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm text-gray-600">
          <span>📍 {location}</span>
          <span>•</span>
          <span>📞 {data.phone || ''}</span>
          <span>•</span>
          <span className="momo-badge">MTN MoMo Accepted</span>
        </div>
      </div>
    </section>
  );
}
