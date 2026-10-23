export interface DeliveryPlace {
  name: string;
  specialty: string;
  phone: string;
  phoneDisplay: string;
  instagram?: string;
  type: 'delivery' | 'resto' | 'panaderia' | 'heladeria';
}

export interface PlaceToVisit {
  name: string;
  description: string;
  tag: string;
  phone?: string;
}

export const GUEST_GUIDE_PDF_URL = '/assets/aistudio/Reglamento_Guia_Huesped_Pasaje_Montes_d2201808.pdf';

export const GUEST_GUIDE_DATA = {
  title: 'Guía del Huésped',
  subtitle: 'Reglamento de convivencia, uso del departamento y recomendaciones de la zona',
  slogan: 'Un descanso camino al lago · Cruz del Eje, Córdoba',
  pdfUrl: GUEST_GUIDE_PDF_URL,
  welcomeMessage:
    'Gracias por elegirnos para su estadía en Cruz del Eje. Preparamos este departamento con mucho cariño para que te sientas como en casa y armamos esta pequeña guía para que tengas a mano todo lo que necesitas: cómo usar cada artefacto, algunas normas básicas de convivencia y nuestras recomendaciones favoritas de la zona para comer y pasear.\n\nNuestra misión es aportar al cuidado del planeta invirtiendo en artefactos con eficiencia energética y contamos con ustedes como colaboradores para hacerlo posible.\n\nAnte cualquier duda, estamos a un mensaje de distancia. ¡Que disfrutes tu estadía!',
  closingMessage:
    'Esperamos que este espacio te haga sentir cómodo/a desde el primer momento. Cualquier sugerencia o comentario sobre tu estadía es siempre bienvenido, ¡nos ayuda a mejorar para el próximo huésped!\n\nCon cariño, el equipo de Pasaje Montes.',
  stayDetails: [
    {
      label: 'Check-in',
      value: 'A partir de las 14:00 hs. hasta las 19:00 hs.',
      note: 'Recepción coordinada con anticipación',
    },
    {
      label: 'Check-out',
      value: 'Hasta las 10:00 hs.',
      note: 'Puntualidad requerida para preparación higiénica',
    },
    {
      label: 'Pago Saldo Pendiente',
      value: 'Día de ingreso SIN EXCEPCIÓN',
      note: 'A través de los medios coordinados con el anfitrión',
      highlight: true,
    },
    {
      label: 'Capacidad Máxima',
      value: 'Hasta 3 personas',
      note: 'Por normas de seguros y convivencia, respetar este límite estricto',
    },
  ],
  rules: [
    {
      title: 'Horario de descanso',
      desc: 'De 23:00 a 08:00 hs usar dispositivos electrónicos en bajo volumen, para respetar el descanso de los vecinos del complejo y barrio.',
      icon: 'Moon',
    },
    {
      title: 'Cuidado de cañerías e inodoro',
      desc: 'Por favor NO ARROJAR papel ni otro elemento de higiene personal en el INODORO, ya que no hay cloacas y se obstruye el sistema.',
      icon: 'AlertTriangle',
      warning: true,
    },
    {
      title: 'Sin fiestas ni eventos',
      desc: 'No se permiten fiestas, reuniones ruidosas ni eventos de ninguna índole.',
      icon: 'VolumeX',
    },
    {
      title: 'Espacio 100% libre de humo',
      desc: 'Está terminantemente prohibido fumar dentro del departamento.',
      icon: 'CigaretteOff',
      warning: true,
    },
    {
      title: 'Mascotas',
      desc: 'Solo si fueron acordadas previamente con el anfitrión y con los cuidados pertinentes. Si hay algún daño por la misma deberá ser abonado sin excepción.',
      icon: 'Dog',
    },
    {
      title: 'Visitas no registradas',
      desc: 'En caso de recibir visitas de personas que no están registradas en la reserva, por favor avisarnos con anticipación.',
      icon: 'Users',
    },
    {
      title: 'Gestión de residuos',
      desc: 'La basura, en caso de ser necesario, se saca los días de semana y en horarios diurnos hasta las 17 hs., favor de colgar en poste.',
      icon: 'Trash2',
    },
    {
      title: 'Entrega del departamento',
      desc: 'Al finalizar la estadía, te pedimos dejar la vajilla lavada y la basura en sus respectivos tachos.',
      icon: 'Sparkles',
    },
  ],
  applianceGuide: [
    {
      title: 'Cocina y Electrodomésticos',
      badge: 'Equipamiento',
      desc: 'Encontrarás vajilla, utensilios, batería de ollas y electros de cocina: pava eléctrica, microondas, tostadora eléctrica, los cuales se controlarán al ingreso y egreso de la estadía. Cualquier faltante o rotura se cobrará a precio de mercado sin excepción. Solicitamos hacer uso cuidadoso de los mismos.',
    },
    {
      title: 'Aire Acondicionado / Calefacción',
      badge: 'Climatización & Tarjeta',
      desc: 'En la llave de ingreso se posee la tarjeta de activación del circuito de aire acondicionado la cual se inserta en el aparato al lado del mueble de TV. Por favor NO DESPEGAR la misma de la llave y retirar del dispositivo al salir del departamento (la separación o pérdida de la tarjeta tendrá un COSTO DE $20.000). Usalo con puertas y ventanas cerradas para mejor rendimiento y ahorro energético. Al encender el calefactor a gas, usar en mínimo, ya que climatiza en poco tiempo el ambiente.',
      critical: true,
    },
    {
      title: 'TV Smart & Streaming',
      badge: 'Entretenimiento',
      desc: 'El televisor cuenta con aplicaciones de streaming para disfrutar de contenido sin límite. Posee cuentas personales ya configuradas; si se desea se puede cerrar la sesión y abrir otras sin problema.',
    },
    {
      title: 'Agua Caliente - Termotanque',
      badge: 'Instrucciones de Uso',
      desc: 'Recomendamos girar la perilla al máximo para calentar rápidamente el agua y, luego de que corte, te pedimos por favor regreses la perilla a "piloto" para que no vuelva a encenderse continuamente y cuidar el consumo de gas.',
    },
    {
      title: 'Electricidad - Uso Eficiente',
      badge: 'Cuidado del Planeta',
      desc: 'Al retirarse del departamento provisoriamente, solicitamos por favor el apagado de todas las luces internas para hacer un uso eficiente de la energía y aportar al cuidado del planeta.',
    },
    {
      title: 'Roturas, Faltantes y Manchas',
      badge: 'Penalidades',
      desc: 'NOTA IMPORTANTE: En caso de rotura, faltante o manchas no removibles en textiles o mobiliario, serán cobradas sin excepción al huésped sin derecho a reclamo alguno por incumplimiento de reglamento y mal uso.',
      critical: true,
    },
  ],
  securityTips: [
    'Tené en cuenta que la puerta principal NO posee picaporte exterior: deberás llevar la llave con vos siempre al salir.',
    'Cerrá siempre con llave la puerta principal al salir, incluso para trámites cortos o salidas rápidas.',
    'Guardá los objetos de valor en un lugar seguro; el anfitrión no se responsabiliza por pertenencias personales.',
    'En caso de emergencia: llamar al 911, número unificado y gratuito para solicitar asistencias policiales y médicas en la provincia de Córdoba.',
  ],
  placesToVisit: [
    {
      name: 'Dique de Cruz del Eje',
      tag: 'Ícono Turístico',
      description: 'Nuestro ícono turístico más reconocido. Ideal para deportes náuticos, pesca de pejerrey, caminatas y contemplar el impactante paisaje serrano.',
    },
    {
      name: 'Isla de los Patos',
      tag: 'Familia & Río',
      description: 'Ubicada a orillas del río, cuenta con sector de asadores, sombras y espacios recreativos para pasar el día completo en familia o con amigos.',
    },
    {
      name: 'Casa Museo Dr. Arturo Illia',
      tag: 'Historia Nacional',
      description: 'La histórica residencia del expresidente argentino Arturo Umberto Illia, declarada monumento histórico nacional con visitas guiadas.',
      phone: '3549418249',
    },
    {
      name: 'Centro de la Ciudad & Peatonal',
      tag: 'Comercio & Paseo',
      description: 'Calles San Martín, Rivadavia y Alvear, con un dinámico centro comercial a cielo abierto, confiterías y gastronomía variada.',
    },
    {
      name: 'Camino del Olivo',
      tag: 'Tradición Olivícola',
      description: 'Recorrido por las fábricas de aceite de oliva de la región con visitas guiadas y degustaciones (casi diez establecimientos participan). Consultar en oficina de turismo Ruta 38.',
    },
    {
      name: 'Centro Histórico & Catedral Ntra. Sra. del Carmen',
      tag: 'Santuario & Cine',
      description: 'Catedral declarada Santuario en Plaza 25 de Mayo, rodeada de variados locales de gastronomía, drugstores, heladerías y la sala de cine municipal.',
    },
    {
      name: 'Antigua Estación de Ferrocarril (1891) – Predio del Olivo',
      tag: 'Patrimonio Ferroviario',
      description: 'Gran espacio con alto valor patrimonial e histórico en pleno centro, sede de eventos culturales y memoria de los talleres ferroviarios.',
    },
  ] as PlaceToVisit[],
  diningAndDelivery: [
    {
      name: 'SushiFan Sushi y Mariscos',
      specialty: 'Sushi y pescado – Solo delivery',
      phone: '3549473618',
      phoneDisplay: '3549 47-3618',
      instagram: 'sushifancde',
      type: 'delivery',
    },
    {
      name: 'Viejo Munich',
      specialty: 'Bodegón clásico, platos abundantes',
      phone: '3549550866',
      phoneDisplay: '3549 55-0866',
      type: 'resto',
    },
    {
      name: 'El Bodegón',
      specialty: 'Bodegón tradicional y delivery',
      phone: '3549509079',
      phoneDisplay: '3549 50-9079',
      type: 'resto',
    },
    {
      name: 'El Vado Resto-Bar',
      specialty: 'Sándwiches, pescado de río, carnes',
      phone: '3549455775',
      phoneDisplay: '3549 45-5775',
      type: 'resto',
    },
    {
      name: 'Panadería y Confitería Kyrios',
      specialty: 'Panadería, cafetería y comidas varias - Delivery',
      phone: '3549440988',
      phoneDisplay: '3549 44-0988',
      type: 'panaderia',
    },
    {
      name: 'La Loma Sabores',
      specialty: 'Restó y delivery de minutas',
      phone: '3549440323',
      phoneDisplay: '3549 44-0323',
      type: 'resto',
    },
    {
      name: 'Cruz Bar',
      specialty: 'Café, tragos y restó céntrico',
      phone: '3549552000',
      phoneDisplay: '3549 55-2000',
      type: 'resto',
    },
    {
      name: 'Pizza Uno',
      specialty: 'Pizzería y lomitería artesanal',
      phone: '3549630294',
      phoneDisplay: '3549 63-0294',
      type: 'delivery',
    },
    {
      name: 'Pizzas 5176',
      specialty: 'Delivery de pizzas, empanadas y comidas varias',
      phone: '3549430567',
      phoneDisplay: '3549 43-0567',
      type: 'delivery',
    },
    {
      name: 'Rotisería La Cumbre',
      specialty: 'Delivery de comidas caseras y viandas',
      phone: '3518125069',
      phoneDisplay: '351 812-5069',
      type: 'delivery',
    },
    {
      name: 'Burgermax',
      specialty: 'Hamburguesas completas, lomitos y delivery',
      phone: '3549526577',
      phoneDisplay: '3549 52-6577',
      type: 'delivery',
    },
    {
      name: 'Heladería Yo Helados',
      specialty: 'Helados artesanales y postres',
      phone: '3549521879',
      phoneDisplay: '3549 52-1879',
      type: 'heladeria',
    },
    {
      name: 'Heladerías Grido',
      specialty: 'Helados, tortas heladas y delivery',
      phone: '3549535110',
      phoneDisplay: '3549 53-5110',
      type: 'heladeria',
    },
  ] as DeliveryPlace[],
};
