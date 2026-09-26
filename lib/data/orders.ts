/* SPEC 06 — Mocks de la demo Pedidos en tiempo real.
   Datos ficticios de references/03_demo_pedidos_en_tiempo_real/.
   Todo contenido de ejemplo lleva // [placeholder].
   18 pedidos: 5 en "nuevo", 8 en "preparacion", 5 en "listo".
   Los precios de los artículos incluyen IVA (total = Σ qty × price). */

import type { Order, OrderChannel, OrderColumn } from "./types";

export const MOCK_ORDERS: Order[] = [
  {
    id: "1045", // [placeholder]
    guest: "Mireia Bosch", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Web Directa", // [placeholder]
    delivery: "Entrega local / Comida en tienda", // [placeholder]
    issuedAt: "13:40", // [placeholder]
    ageLabel: "hace 3m", // [placeholder]
    column: "nuevo", // [placeholder]
    badge: "PENDIENTE", // [placeholder]
    phone: "+34 621 445 •••", // [placeholder]
    items: [
      { qty: 1, name: "Ensalada de burrata", price: 16.5 }, // [placeholder]
      { qty: 1, name: "Tosta de tomate y anchoa", price: 18 }, // [placeholder]
    ],
  },
  {
    id: "1044", // [placeholder]
    guest: "David Navarro", // [placeholder]
    channel: "take-away", // [placeholder]
    place: "Take Away", // [placeholder]
    delivery: "Recogida en tienda (Take Away)", // [placeholder]
    issuedAt: "13:36", // [placeholder]
    ageLabel: "hace 7m", // [placeholder]
    column: "nuevo", // [placeholder]
    badge: "PENDIENTE", // [placeholder]
    phone: "+34 633 210 •••", // [placeholder]
    items: [
      { qty: 1, name: "Hamburguesa clàssica", price: 18 }, // [placeholder]
    ],
  },
  {
    id: "1046", // [placeholder]
    guest: "Aina Roura", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Sala 05", // [placeholder]
    delivery: "Comida en tienda (Sala 05)", // [placeholder]
    issuedAt: "13:34", // [placeholder]
    ageLabel: "hace 9m", // [placeholder]
    column: "nuevo", // [placeholder]
    badge: "PENDIENTE", // [placeholder]
    phone: "+34 644 872 •••", // [placeholder]
    items: [
      { qty: 1, name: "Croquetas de jamón", price: 11.4 }, // [placeholder]
      { qty: 1, name: "Ensalada César", price: 14.5 }, // [placeholder]
      { qty: 2, name: "Limonada de la casa", price: 8 }, // [placeholder]
    ],
  },
  {
    id: "1047", // [placeholder]
    guest: "Pau Estruch", // [placeholder]
    channel: "delivery", // [placeholder]
    place: "Glovo", // [placeholder]
    delivery: "Reparto a domicilio (Glovo)", // [placeholder]
    issuedAt: "13:31", // [placeholder]
    ageLabel: "hace 12m", // [placeholder]
    column: "nuevo", // [placeholder]
    badge: "PENDIENTE", // [placeholder]
    phone: "+34 655 019 •••", // [placeholder]
    items: [
      { qty: 1, name: "Pizza margarita", price: 14.5 }, // [placeholder]
      { qty: 1, name: "Patatas bravas", price: 9 }, // [placeholder]
    ],
  },
  {
    id: "1048", // [placeholder]
    guest: "Emma Soler", // [placeholder]
    channel: "take-away", // [placeholder]
    place: "Take Away", // [placeholder]
    delivery: "Recogida en tienda (Take Away)", // [placeholder]
    issuedAt: "13:27", // [placeholder]
    ageLabel: "hace 16m", // [placeholder]
    column: "nuevo", // [placeholder]
    badge: "PENDIENTE", // [placeholder]
    phone: "+34 666 340 •••", // [placeholder]
    items: [
      { qty: 1, name: "Tostada de aguacate", price: 11 }, // [placeholder]
    ],
  },
  {
    id: "1043", // [placeholder]
    guest: "Laura Sanmartín", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Mesa 04 / Takeaway", // [placeholder]
    delivery: "Entrega local / Recogida en tienda (Mesa 04)", // [placeholder]
    issuedAt: "13:42", // [placeholder]
    ageLabel: "hace 1m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "COCINANDO", // [placeholder]
    phone: "+34 654 892 •••", // [placeholder]
    note: "Sin cebolla en la pasta, alérgica leve. Cubiertos biodegradables por favor.", // [placeholder]
    items: [
      { qty: 1, name: "Focaccia artesanal de romero y sal maldon", price: 12.5 }, // [placeholder]
      { qty: 2, name: "Pasta fresca al tartufo con parmesano 24m", price: 16 }, // [placeholder]
      { qty: 1, name: "Tiramisú clásico della casa", price: 8.3 }, // [placeholder]
    ],
  },
  {
    id: "1042", // [placeholder]
    guest: "Pablo Vidal", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Sala 02", // [placeholder]
    delivery: "Comida en tienda (Sala 02)", // [placeholder]
    issuedAt: "13:29", // [placeholder]
    ageLabel: "hace 14m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "EN HORNO", // [placeholder]
    phone: "+34 677 552 •••", // [placeholder]
    items: [
      { qty: 2, name: "Arroz negro", price: 17 }, // [placeholder]
      { qty: 1, name: "Pan de cristal", price: 6.2 }, // [placeholder]
      { qty: 1, name: "Tarta de queso", price: 7.5 }, // [placeholder]
      { qty: 1, name: "Solomillo a la brasa", price: 28.5 }, // [placeholder]
    ],
  },
  {
    id: "1041", // [placeholder]
    guest: "Sofía Méndez", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Web Directa", // [placeholder]
    delivery: "Entrega local / Comida en tienda", // [placeholder]
    issuedAt: "13:24", // [placeholder]
    ageLabel: "hace 19m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "EMPAQUETANDO", // [placeholder]
    phone: "+34 688 176 •••", // [placeholder]
    items: [
      { qty: 1, name: "Pasta al limone", price: 16.9 }, // [placeholder]
      { qty: 1, name: "Ensalada griega", price: 13 }, // [placeholder]
    ],
  },
  {
    id: "1049", // [placeholder]
    guest: "Marta Puig", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Barra", // [placeholder]
    delivery: "Comida en tienda (Barra)", // [placeholder]
    issuedAt: "13:22", // [placeholder]
    ageLabel: "hace 21m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "COCINANDO", // [placeholder]
    phone: "+34 699 284 •••", // [placeholder]
    items: [
      { qty: 1, name: "Tartar de atún", price: 19.4 }, // [placeholder]
      { qty: 1, name: "Pan con tomate", price: 8 }, // [placeholder]
    ],
  },
  {
    id: "1050", // [placeholder]
    guest: "Sergi Lloret", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Mesa 11", // [placeholder]
    delivery: "Comida en tienda (Mesa 11)", // [placeholder]
    issuedAt: "13:19", // [placeholder]
    ageLabel: "hace 24m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "EN HORNO", // [placeholder]
    phone: "+34 610 733 •••", // [placeholder]
    note: "Sin frutos secos en el flan, alergia grave.", // [placeholder]
    items: [
      { qty: 1, name: "Ensalada rústica", price: 13.5 }, // [placeholder]
      { qty: 1, name: "Risotto de setas", price: 19 }, // [placeholder]
      { qty: 2, name: "Cerveza artesanal", price: 4.5 }, // [placeholder]
      { qty: 1, name: "Flan de la abuela", price: 6 }, // [placeholder]
      { qty: 1, name: "Filete de ternera", price: 41 }, // [placeholder]
    ],
  },
  {
    id: "1051", // [placeholder]
    guest: "Núria Cerdà", // [placeholder]
    channel: "delivery", // [placeholder]
    place: "Glovo", // [placeholder]
    delivery: "Reparto a domicilio (Glovo)", // [placeholder]
    issuedAt: "13:16", // [placeholder]
    ageLabel: "hace 27m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "COCINANDO", // [placeholder]
    phone: "+34 621 905 •••", // [placeholder]
    items: [
      { qty: 1, name: "Poke de salmón", price: 17.5 }, // [placeholder]
      { qty: 1, name: "Wrap de pollo", price: 12.5 }, // [placeholder]
      { qty: 2, name: "Zumo natural", price: 7.5 }, // [placeholder]
    ],
  },
  {
    id: "1052", // [placeholder]
    guest: "Álex Ferrer", // [placeholder]
    channel: "take-away", // [placeholder]
    place: "Take Away", // [placeholder]
    delivery: "Recogida en tienda (Take Away)", // [placeholder]
    issuedAt: "13:12", // [placeholder]
    ageLabel: "hace 31m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "EMPAQUETANDO", // [placeholder]
    phone: "+34 632 468 •••", // [placeholder]
    items: [
      { qty: 1, name: "Bocata de calamares", price: 16.5 }, // [placeholder]
    ],
  },
  {
    id: "1053", // [placeholder]
    guest: "Clara Masdéu", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Sala 01", // [placeholder]
    delivery: "Comida en tienda (Sala 01)", // [placeholder]
    issuedAt: "13:09", // [placeholder]
    ageLabel: "hace 34m", // [placeholder]
    column: "preparacion", // [placeholder]
    badge: "COCINANDO", // [placeholder]
    phone: "+34 643 517 •••", // [placeholder]
    items: [
      { qty: 1, name: "Secreto ibérico", price: 23.2 }, // [placeholder]
      { qty: 1, name: "Patatas fritas", price: 10 }, // [placeholder]
    ],
  },
  {
    id: "1040", // [placeholder]
    guest: "Marc Colomer", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Barra", // [placeholder]
    delivery: "Comida en tienda (Barra)", // [placeholder]
    issuedAt: "13:21", // [placeholder]
    ageLabel: "hace 22m", // [placeholder]
    column: "listo", // [placeholder]
    badge: "LISTO PARA RECOGER", // [placeholder]
    phone: "+34 654 128 •••", // [placeholder]
    items: [
      { qty: 1, name: "Bocadillo de jamón", price: 15 }, // [placeholder]
    ],
  },
  {
    id: "1039", // [placeholder]
    guest: "Carla Gómez", // [placeholder]
    channel: "delivery", // [placeholder]
    place: "Reparto propio", // [placeholder]
    delivery: "Reparto propio a domicilio", // [placeholder]
    issuedAt: "13:08", // [placeholder]
    ageLabel: "hace 35m", // [placeholder]
    column: "listo", // [placeholder]
    badge: "ENTREGADO", // [placeholder]
    phone: "+34 665 239 •••", // [placeholder]
    items: [
      { qty: 1, name: "Pizza 4 quesos", price: 16.6 }, // [placeholder]
      { qty: 1, name: "Alitas picantes", price: 12.5 }, // [placeholder]
      { qty: 2, name: "Batido de chocolate", price: 7.5 }, // [placeholder]
    ],
  },
  {
    id: "1038", // [placeholder]
    guest: "Roger Pla", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Web Directa", // [placeholder]
    delivery: "Entrega local / Comida en tienda", // [placeholder]
    issuedAt: "13:05", // [placeholder]
    ageLabel: "hace 38m", // [placeholder]
    column: "listo", // [placeholder]
    badge: "LISTO PARA RECOGER", // [placeholder]
    phone: "+34 676 340 •••", // [placeholder]
    items: [
      { qty: 1, name: "Bowl de quinoa", price: 16 }, // [placeholder]
      { qty: 1, name: "Sopa de verduras", price: 10 }, // [placeholder]
    ],
  },
  {
    id: "1037", // [placeholder]
    guest: "Júlia Serra", // [placeholder]
    channel: "web-directa", // [placeholder]
    place: "Mesa 07", // [placeholder]
    delivery: "Comida en tienda (Mesa 07)", // [placeholder]
    issuedAt: "13:01", // [placeholder]
    ageLabel: "hace 42m", // [placeholder]
    column: "listo", // [placeholder]
    badge: "LISTO PARA RECOGER", // [placeholder]
    phone: "+34 687 451 •••", // [placeholder]
    note: "Poco hecho la carne, gracias.", // [placeholder]
    items: [
      { qty: 2, name: "Hamburguesa doble", price: 16 }, // [placeholder]
      { qty: 1, name: "Tequeños", price: 8.4 }, // [placeholder]
      { qty: 2, name: "Refresco", price: 3.5 }, // [placeholder]
      { qty: 1, name: "Brownie", price: 14 }, // [placeholder]
    ],
  },
  {
    id: "1036", // [placeholder]
    guest: "Pol Ribera", // [placeholder]
    channel: "take-away", // [placeholder]
    place: "Take Away", // [placeholder]
    delivery: "Recogida en tienda (Take Away)", // [placeholder]
    issuedAt: "12:56", // [placeholder]
    ageLabel: "hace 47m", // [placeholder]
    column: "listo", // [placeholder]
    badge: "ENTREGADO", // [placeholder]
    phone: "+34 698 562 •••", // [placeholder]
    items: [
      { qty: 1, name: "Cachopo", price: 15.7 }, // [placeholder]
      { qty: 1, name: "Ensalada mixta", price: 6 }, // [placeholder]
    ],
  },
];

/* Badge por defecto al avanzar un pedido (SPEC 06, Modelo de datos). */
export const DEFAULT_BADGE: Record<OrderColumn, string> = {
  nuevo: "PENDIENTE",
  preparacion: "COCINANDO",
  listo: "LISTO PARA RECOGER",
};

/* Etiqueta del select de canales. */
export const CHANNEL_LABEL: Record<OrderChannel, string> = {
  "web-directa": "Web Directa",
  "take-away": "Take Away (Mesa)",
  delivery: "Glovo / Delivery",
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

/* Desglose con IVA del 10% incluido en el precio de los artículos:
   total = Σ qty × price; subtotal = total / 1.10; iva = total − subtotal. */
export function orderTotals(order: Order): {
  subtotal: number;
  iva: number;
  total: number;
} {
  const total = round2(
    order.items.reduce((sum, item) => sum + item.qty * item.price, 0)
  );
  const subtotal = round2(total / 1.1);
  const iva = round2(total - subtotal);
  return { subtotal, iva, total };
}

/* Formato monetario compartido por el kanban y el dossier. */
const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export const formatEUR = (value: number): string => EUR.format(value);
