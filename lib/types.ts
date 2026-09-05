// voidbuild - Core Types - JSON Template System
// Template = JSON, not HTML. AI generates DATA, not code.

export type BlockType = 
  | 'navbar'
  | 'hero'
  | 'services'
  | 'features'
  | 'gallery'
  | 'testimonials'
  | 'pricing'
  | 'contact'
  | 'whatsapp'
  | 'map'
  | 'stats'
  | 'footer';

export interface BlockStyle {
  primaryColor?: string; // e.g. "#EC4899" - salon pink
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: 'inter' | 'outfit' | 'space';
  alignment?: 'left' | 'center';
}

export interface BlockData {
  [key: string]: any;
}

export interface TemplateBlock {
  id: string;
  type: BlockType;
  data: BlockData;
  style?: BlockStyle;
}

export interface Template {
  id: string;
  name: string;
  category:
    | 'salon'
    | 'hardware'
    | 'restaurant'
    | 'church'
    | 'portfolio'
    | 'shop'
    | 'boda'
    | 'school'
    | 'clinic'
    | 'boutique'
    | 'barbershop'
    | 'pharmacy'
    | 'bakery'
    | 'carwash'
    | 'hotel'
    | 'gym';
  description: string;
  blocks: TemplateBlock[];
  meta: {
    target: string; // "Salon in Wandegeya"
    language: 'en' | 'luganda' | 'swahili';
    createdWith?: string;
  };
}

// Example data shape for each block type (for AI to follow)
export const BlockSchemas = {
  navbar: { businessName: "string", phone: "string", whatsapp: "string" },
  hero: { title: "string", subtitle: "string", ctaText: "string", ctaLink: "string", image: "string (unsplash keyword)" },
  services: { heading: "string", services: [{ name: "string", price: "string (UGX)", description: "string", icon: "string" }] },
  contact: { phone: "string", whatsapp: "string", location: "string", hours: "string", email: "string" },
  footer: { businessName: "string", year: "number", tagline: "string" }
}
