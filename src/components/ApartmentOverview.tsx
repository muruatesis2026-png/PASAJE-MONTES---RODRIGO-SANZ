import React from 'react';
import { BedDouble, LayoutGrid, Car, Laptop, Check, Flame, Shield, Sparkles } from 'lucide-react';

interface ApartmentOverviewProps {
  onSelectPhoto: (photoId: string) => void;
  onOpenBooking: () => void;
}

export const ApartmentOverview: React.FC<ApartmentOverviewProps> = ({
  onSelectPhoto,
  onOpenBooking,
}) => {
  const features = [
    {
      title: 'Sommier Matrimonial Queen + 1 Plaza',
      desc: 'Dormitorio equipado con sommier Queen de máxima calidad y sommier individual auxiliar. Ideal para 1, 2 o hasta 3 personas.',
      image: '/photos/bedroom_clean.jpg',
      photoId: 'dormitorio-principal',
      icon: BedDouble,
      tag: 'Descanso Superior',
      items: [
        'Sommier Queen confortable',
        'Sommier individual de 1 plaza',
        'Ropa de cama y toallas incluidas',
        'Mesas de luz con veladores y perchero',
      ],
    },
    {
      title: '2 Ambientes Amplios & Patio Interno',
      desc: 'Espacios luminosos y bien distribuidos: sector de descanso privado, estar-comedor integrado, baño completo y ventilación natural.',
      image: '/photos/patio_clean.jpg',
      photoId: 'patio-interno',
      icon: LayoutGrid,
      tag: 'Amplitud & Luz',
      items: [
        'Baño completo con jabón de cuerpo y shampoo',
        'Patio interno descubierto privado',
        'Termotanque a Gas Natural para agua caliente continua',
        'Pisos cerámicos de fácil higiene',
      ],
    },
    {
      title: 'Cochera Cubierta con Portón Corredizo',
      desc: 'Tu vehículo seguro y al resguardo de las inclemencias climáticas dentro de la misma propiedad, con acceso directo y privado.',
      image: '/photos/garage_clean.jpg',
      photoId: 'cochera-porton',
      icon: Car,
      tag: 'Seguridad Total',
      items: [
        'Espacio techado cubierto para vehículo',
        'Portón corredizo con traba de seguridad',
        'Vigilancia externa perimetral',
        'Ingreso sin escaleras incómodas',
      ],
    },
    {
      title: 'Conectividad & Workspace Funcional',
      desc: 'Conexión a internet por fibra óptica de alta velocidad, escritorio amplio para notebook y Smart TV para streaming.',
      image: '/photos/workspace_clean.jpg',
      photoId: 'espacio-trabajo',
      icon: Laptop,
      tag: 'Home Office & Relax',
      items: [
        'Wi-Fi de excelente velocidad',
        'Smart TV con aplicaciones de streaming',
        'Escritorio y sillas confortables',
        'Tomas de corriente estratégicamente ubicadas',
      ],
    },
  ];

  return (
    <section id="departamento" className="py-20 bg-[#FBF8F3] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Departamento de Residencia Temporaria</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            El Departamento
          </h2>
          <p className="text-lg text-[#375663] font-medium">
            Cómodo y funcional para máximo 3 personas.
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Diseñado pensando en quienes viajan por placer, descanso, trabajo o turismo en Cruz del Eje. Cada rincón ofrece calidez, modernidad y la independencia de tu propio hogar.
          </p>
        </div>

        {/* Feature Grid with alternating modern cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col group"
              >
                {/* Image Header */}
                <div
                  className="relative h-60 overflow-hidden cursor-pointer"
                  onClick={() => onSelectPhoto(feature.photoId)}
                  title="Click para ver foto en tamaño completo"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  <span className="absolute top-4 left-4 bg-[#4D7080] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    {feature.tag}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      Ver en galería
                    </span>
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#4D7080] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {feature.desc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {feature.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onOpenBooking}
                      className="text-xs font-bold text-[#4D7080] hover:text-[#375663] flex items-center gap-1 group-hover:underline"
                    >
                      <span>Reservar estadía en este departamento →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Banner: Climatización & Tranquilidad */}
        <div className="mt-12 bg-gradient-to-r from-[#4D7080] to-[#375663] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>Confort Asegurado los 365 días del año</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold">
              Calefacción a Gas Natural + Aire Acondicionado Frío/Calor
            </h4>
            <p className="text-sm text-slate-200">
              No sufras ni el frío serrano ni el calor del verano: contás con termotanque a gas de alta recuperación, split frío/calor y vigilancia externa en un barrio residencial tranquilo y vistoso.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition-colors text-sm text-center"
            >
              Consultar Fechas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
