import React from 'react';
import {
  UtensilsCrossed,
  Refrigerator,
  Microwave,
  Coffee,
  Sandwich,
  CupSoda,
  Flame,
  Wind,
  ShowerHead,
  BedDouble,
  Wifi,
  Tv,
  Laptop,
  Bed,
  BedSingle,
  Home,
  Trees,
  Sparkles,
  Car,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const AmenitiesSection: React.FC = () => {
  const amenityCategories = [
    {
      category: 'Cocina Totalmente Equipada',
      description: 'Todo lo necesario para preparar tus comidas, mate y desayunos con total comodidad.',
      items: [
        { name: 'Vajilla completa', desc: 'Platos, cubiertos, vasos, copas y accesorios', icon: UtensilsCrossed },
        { name: 'Heladera frigobar', desc: 'Mantiene tus bebidas y alimentos siempre frescos', icon: Refrigerator },
        { name: 'Microondas', desc: 'Para calentar y cocinar al instante', icon: Microwave },
        { name: 'Pava eléctrica', desc: 'Ideal para tus mates mañaneros o meriendas', icon: Coffee },
        { name: 'Tostadora eléctrica', desc: 'Desayunos con pan tostado crujiente', icon: Sandwich },
        { name: 'Variedad en infusiones', desc: 'Té, café y azúcar de cortesía a tu llegada', icon: CupSoda },
      ],
    },
    {
      category: 'Confort Asegurado',
      description: 'Climatización constante, agua caliente ilimitada y ropa blanca de primer nivel.',
      items: [
        { name: 'Calefacción a Gas Natural', desc: 'Ambiente cálido y acogedor en invierno', icon: Flame },
        { name: 'Aire acondicionado frío/calor', desc: 'Climatización split individual regulable', icon: Wind },
        { name: 'Termotanque a Gas Natural', desc: 'Agua caliente sin interrupciones', icon: ShowerHead },
        { name: 'Ropa de cama y toallas incluida', desc: 'Sábanas, frazadas y toallas limpias', icon: BedDouble },
        { name: 'Seguridad por vigilancia externa', desc: 'Monitoreo perimetral para tu tranquilidad', icon: ShieldCheck },
      ],
    },
    {
      category: 'Conectividad & Espacio de Trabajo',
      description: 'Internet de excelente velocidad para que puedas trabajar remoto o ver tus series preferidas.',
      items: [
        { name: 'Wi-Fi de excelente velocidad', desc: 'Fibra óptica veloz y conexión estable', icon: Wifi },
        { name: 'Smart TV con streaming', desc: 'Netflix, YouTube y apps de entretenimiento', icon: Tv },
        { name: 'Escritorio de trabajo funcional', desc: 'Mesa cómoda y enchufes para tu laptop', icon: Laptop },
      ],
    },
    {
      category: 'Espacios & Cochera Privada',
      description: 'Distribución funcional para 1, 2 o hasta 3 personas con estacionamiento techado.',
      items: [
        { name: 'Sommier matrimonial Queen', desc: 'Colchón de alta densidad para gran descanso', icon: Bed },
        { name: 'Sommier individual de 1 plaza', desc: 'Cama adicional para 2do o 3er huésped', icon: BedSingle },
        { name: '2 ambientes amplios', desc: 'Independencia entre dormitorio y living', icon: Home },
        { name: 'Baño completo con amenities', desc: 'Incluye jabón de cuerpo y shampoo', icon: Sparkles },
        { name: 'Patio interno privado', desc: 'Ventilación e iluminación al aire libre', icon: Trees },
        { name: 'Cochera cubierta con portón corredizo', desc: 'Estacionamiento techado y seguro', icon: Car },
      ],
    },
  ];

  return (
    <section id="comodidades" className="py-20 bg-[#FBF8F3] scroll-mt-20 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Servicios & Equipamiento Completo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Todas las comodidades que necesitás
          </h2>
          <p className="text-base text-slate-600">
            Pensado hasta el último detalle para que solo tengas que llegar, desempacar y disfrutar de tu estadía en Cruz del Eje.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {amenityCategories.map((group, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow"
            >
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4D7080]"></span>
                  {group.category}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{group.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIdx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F6F0]/70 hover:bg-[#F8F6F0] transition-colors border border-slate-100"
                    >
                      <div className="p-2 bg-[#4D7080]/10 text-[#4D7080] rounded-lg shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
