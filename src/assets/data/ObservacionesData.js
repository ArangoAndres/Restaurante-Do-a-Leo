export const OBS_POR_PLATO = {
  // Chanfaina (1)
  1: {
    permitirTexto: false,
    items: [
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
    ],
  },

  // Mondongo (2)
  2: {
    permitirTexto: false,
    items: [
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
    ],
  },

  // Frijoles (3)
  3: {
    permitirTexto: true,
    items: [
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Cebolla", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
      { label: "No Guiso", tipo: "radio" },
    ],
  },

  // Mute (4)
  4: {
    permitirTexto: false,
    items: [
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
    ],
  },

  // Sancocho de Cola (5), Costilla (6), Gallina (7), Trifásico (8)
  5: {
    permitirTexto: true,
    items: [
      {
        label: "Tipo de Sopa",
        tipo: "selector",
        opciones: ["Sancocho", "Arroz"],
        requerido: true,
      },
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
    ],
  },
  6: {
    permitirTexto: true,
    items: [
      {
        label: "Tipo de Sopa",
        tipo: "selector",
        opciones: ["Sancocho", "Arroz"],
        requerido: true,
      },
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
    ],
  },
  7: {
    permitirTexto: true,
    items: [
      {
        label: "Tipo de Sopa",
        tipo: "selector",
        opciones: ["Sancocho", "Arroz"],
        requerido: true,
      },
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
    ],
  },
  8: {
    permitirTexto: true,
    items: [
      {
        label: "Tipo de Sopa",
        tipo: "selector",
        opciones: ["Sancocho", "Arroz"],
        requerido: true,
      },
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
    ],
  },

  // Sopa Adicional (10)
  10: {
    permitirTexto: true,
    items: [
      {
        label: "Tipo de Sopa",
        tipo: "selector",
        opciones: ["Arroz", "Sancocho"],
        requerido: true,
      },

      { label: "No Picadillo", tipo: "radio" },
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
    ],
  },

  // S. Arroz con Gallina (9)
  9: {
    permitirTexto: true,
    items: [
      {
        label: "Tipo de Sopa",
        tipo: "selector",
        opciones: ["Arroz", "Sancocho"],
        requerido: true,
      },
      { label: "Sopa Clarita", tipo: "radio" },
      { label: "Sopa Espesa", tipo: "radio" },
      { label: "No Picadillo", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
    ],
  },

  // Arroz con Pollo (11), Spaguetis (12) — solo texto libre
  11: { permitirTexto: true, items: [] },
  12: { permitirTexto: true, items: [] },

  // Pernil con Papa (13), Pechuga con Papa (14) — solo texto libre
  13: { permitirTexto: true, items: [] },
  14: { permitirTexto: true, items: [] },

  15: {
    permitirTexto: true,
    items: [
      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  16: {
    permitirTexto: true,
    items: [
      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  17: {
    permitirTexto: true,
    items: [
      { label: "3/4?", tipo: "radio" },
      { label: "Termino Medio", tipo: "radio" },
      { label: "Bien asado", tipo: "radio" },
      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  19: {
    permitirTexto: true,
    items: [
      { label: "3/4?", tipo: "radio" },
      { label: "Termino Medio", tipo: "radio" },
      { label: "Bien asado", tipo: "radio" },
      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  18: {
    permitirTexto: true,
    items: [
      { label: "Delgada", tipo: "radio" },
      { label: "Gruesa", tipo: "radio" },

      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  21: {
    permitirTexto: true,
    items: [
      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  22: {
    permitirTexto: true,
    items: [
      { label: "Frito", tipo: "radio" },
      { label: "Sudado", tipo: "radio" },
      { label: "Solo costilla", tipo: "radio" },
      { label: "Solo Pierna", tipo: "radio" },

      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  23: {
    permitirTexto: true,
    items: [{ label: "BBQ?", tipo: "radio" }],
  },
  24: {
    permitirTexto: true,
    items: [
      { label: "Frita", tipo: "radio" },
      { label: "Asada", tipo: "radio" },

      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  25: {
    permitirTexto: true,
    items: [
      { label: "Frita", tipo: "radio" },
      { label: "Asada", tipo: "radio" },
      { label: "Salsa Aparte", tipo: "radio" },
      { label: "¿Solo Francesa?", tipo: "radio" },
      { label: "No Vinagreta", tipo: "radio" },
      { label: "No Guiso", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
      { label: "Tajada", tipo: "modo" },
      { label: "Yuca", tipo: "modo" },
    ],
  },
  26: {
    permitirTexto: true,
    items: [{ label: "No picadillo?", tipo: "radio" }],
  },
  27: {
    permitirTexto: true,
    items: [
      { label: "Frito", tipo: "radio" },
      { label: "Sudado", tipo: "radio" },
      { label: "Arroz de Coco", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
    ],
  },
  28: {
    permitirTexto: true,
    items: [
      { label: "Frito", tipo: "radio" },
      { label: "Sudado", tipo: "radio" },
      { label: "Arroz de Coco", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
    ],
  },
  30: {
    permitirTexto: true,
    items: [
      { label: "Frito", tipo: "radio" },
      { label: "Sudado", tipo: "radio" },
      { label: "Arroz de Coco", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
    ],
  },
  31: {
    permitirTexto: true,
    items: [
      { label: "Frito", tipo: "radio" },
      { label: "Sudado", tipo: "radio" },
      { label: "Arroz de Coco", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
    ],
  },
  32: {
    permitirTexto: true,
    items: [
      { label: "Arroz de Coco", tipo: "radio" },
      { label: "Arroz", tipo: "modo" },
      { label: "Ensalada", tipo: "modo" },
      { label: "Patacón", tipo: "modo" },
    ],
  },
  34: {
    permitirTexto: true,
    items: [
      { label: "Frito", tipo: "radio" },
      { label: "Sin guiso", tipo: "radio" },
    ],
  },
  35: {
    permitirTexto: true,
    items: [{ label: "Sin guiso", tipo: "radio" }],
  },
  37: {
    permitirTexto: true,
    items: [{ label: "Sin vinagreta", tipo: "radio" }],
  },
  42: {
    permitirTexto: true,
    items: [
      { label: "Postobon", tipo: "radio" },
      { label: "Coca Cola", tipo: "radio" },
    ],
  },
  43: {
    permitirTexto: true,
    items: [
      { label: "Postobon", tipo: "radio" },
      { label: "Coca Cola", tipo: "radio" },
    ],
  },
  44: {
    permitirTexto: true,
    items: [
      { label: "Postobon", tipo: "radio" },
      { label: "Coca Cola", tipo: "radio" },
    ],
  },
};
