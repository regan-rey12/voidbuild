import { Template } from './types';
import salonTemplate from '../templates/salon-ug-1.json';
import hardwareTemplate from '../templates/hardware-mbale-1.json';
import restaurantTemplate from '../templates/restaurant-ug-1.json';
import boutiqueTemplate from '../templates/boutique-ug-1.json';
import churchTemplate from '../templates/church-ug-1.json';
import bodaTemplate from '../templates/boda-ug-1.json';
import schoolTemplate from '../templates/school-ug-1.json';
import clinicTemplate from '../templates/clinic-ug-1.json';
import barbershopTemplate from '../templates/barbershop-ug-1.json';
import portfolioTemplate from '../templates/portfolio-ug-1.json';
import pharmacyTemplate from '../templates/pharmacy-ug-1.json';
import bakeryTemplate from '../templates/bakery-ug-1.json';
import carwashTemplate from '../templates/carwash-ug-1.json';
import hotelTemplate from '../templates/hotel-ug-1.json';
import gymTemplate from '../templates/gym-ug-1.json';

export const TEMPLATES_MAP: Record<string, Template> = {
  salon: salonTemplate as Template,
  hardware: hardwareTemplate as Template,
  restaurant: restaurantTemplate as Template,
  boutique: boutiqueTemplate as Template,
  church: churchTemplate as Template,
  boda: bodaTemplate as Template,
  school: schoolTemplate as Template,
  clinic: clinicTemplate as Template,
  barbershop: barbershopTemplate as Template,
  portfolio: portfolioTemplate as Template,
  pharmacy: pharmacyTemplate as Template,
  bakery: bakeryTemplate as Template,
  carwash: carwashTemplate as Template,
  hotel: hotelTemplate as Template,
  gym: gymTemplate as Template,
};

export function getTemplateByKey(key: string): Template {
  const normalized = (key || '').toLowerCase().trim();
  return TEMPLATES_MAP[normalized] || TEMPLATES_MAP.salon;
}
