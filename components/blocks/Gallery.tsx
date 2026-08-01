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

export default function Gallery({ data, style, editMode, onUpdateData }: Props) {
  const updateImage = (idx: number, newUrl: string) => {
    if (!onUpdateData) return;
    const newImages = [...data.images];
    newImages[idx] = newUrl;
    onUpdateData({ ...data, images: newImages });
  };

  return (
    <section id="gallery" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold">{data.heading || 'Our Work'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {data.images?.map((img: string, i: number) => (
            <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              {editMode && onUpdateData ? (
                <EditableImage
                  imageKeyword={img}
                  alt=""
                  editMode={editMode}
                  onChange={(url) => updateImage(i, url)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={img.startsWith('http') || img.startsWith('data:') ? img : `https://source.unsplash.com/500x375/?${encodeURIComponent(img)}`} alt="" className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
