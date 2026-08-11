"use client";
import EditableImage from '../editor/EditableImage';

interface Props {
  data: {
    heading?: string;
    images: string[];
  };
  style?: any;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

// Default placeholder images so empty space doesn't feel black - user sees how their images will look
const DEFAULT_IMAGES = [
  'african salon braids beautiful',
  'african braids style',
  'african natural hair',
  'business team',
  'african boutique fashion',
  'african food restaurant',
];

export default function Gallery({ data, style, editMode, onUpdateData }: Props) {
  const images = data.images && data.images.length > 0 ? data.images : DEFAULT_IMAGES.slice(0, 6);

  const updateImage = (idx: number, newUrl: string) => {
    if (!onUpdateData) return;
    const newImages = [...images];
    newImages[idx] = newUrl;
    onUpdateData({ ...data, images: newImages });
  };

  return (
    <section id="gallery" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold">{data.heading || 'Our Work'}</h2>
        <p className="text-xs text-gray-500 mt-1">Real photos of your work - click image to upload your own (in Edit Mode)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {images.map((img: string, i: number) => (
            <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border shadow-sm group">
              {editMode && onUpdateData ? (
                <EditableImage
                  imageKeyword={img}
                  alt=""
                  editMode={editMode}
                  onChange={(url) => updateImage(i, url)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={img.startsWith('http') || img.startsWith('data:') ? img : `https://source.unsplash.com/500x375/?${encodeURIComponent(img)}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <div className="mt-4 text-[11px] text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
            Click any image to upload your real shop photo. These placeholder images show how your gallery will look - replace with your own.
          </div>
        )}
      </div>
    </section>
  );
}
