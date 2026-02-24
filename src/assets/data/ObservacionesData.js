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
};
