// ============================================
// CONFIGURACIÓN COMPLETA - GARY'S PRESTASHOP
// Todos los mapeos extraídos del workflow n8n
// ============================================

const CONFIG = {
  id_idioma: 4,
  id_tax_rules_group: 53,
  id_manufacturer: 41,
  id_supplier: 5,
  margen_beneficio: 0.35,
  categoria_default: 19,
};

// PrestaShop connection (override via env vars or from UI)
const PRESTASHOP = {
  url: process.env.PRESTASHOP_URL || 'https://pruebas.todouniforme.com',
  apiKey: process.env.PRESTASHOP_API_KEY || '',
  // Admin panel credentials (needed for texture upload - webservice doesn't support it)
  adminUrl: process.env.PRESTASHOP_ADMIN_URL || '',  // e.g. https://pruebas.todouniforme.com/admin123
  adminEmail: process.env.PRESTASHOP_ADMIN_EMAIL || '',
  adminPassword: process.env.PRESTASHOP_ADMIN_PASSWORD || '',
};

// IDs de características en el back office
const CARACTERISTICAS_IDS = {
  composicion: 1,
  gramaje: 2,
  material: 3,
};

// Mapeo de colores a IDs de PrestaShop (grupo atributo 2)
const COLORES_MAP = {
  'TURQUESA': 26, 'TURQUESA CLARO': 27, 'AZUL PETRÓLEO': 15, 'AZULINA': 14,
  'CELESTE': 6, 'AZUL MARINO': 48, 'MARINO': 48, 'AMARILLO': 7, 'AMARILLO CLARO': 29,
  'AMARILLO FLÚOR': 18, 'AMARILLO FLUOR': 18, 'BLANCO': 5, 'NARANJA FLÚOR': 19,
  'NARANJA FLUOR': 19, 'NARANJA': 17, 'NEGRO': 8, 'VERDE': 9, 'VERDE LIMA': 24,
  'VERDE CAZA': 10, 'VERDE BOSQUE': 11, 'BEIGE': 12, 'GRIS PERLA': 32,
  'GRIS OSCURO': 28, 'GRIS': 13, 'ROJO': 16, 'ROJO CORAL': 23, 'FUCSIA': 22,
  'BURDEOS': 33, 'GRANATE': 20, 'NARANJA CLARO': 21, 'MORADO': 25, 'MARRÓN': 30,
  'PISTACHO': 103, 'AZUL ROYAL': 185, 'ROSA': 179, 'VAQUERO': 900, 'VERDE HIERBA': 428,
};

// Mapeo de tallas a IDs de PrestaShop (grupo atributo 1)
const TALLAS_MAP = {
  'ÚNICA': 64, 'UD': 64, 'UNICA': 64, 'XL': 8, 'TALLA ÚNICA': 184,
  '2XS': 643, 'XS': 6, 'S': 2, 'M': 3, 'L': 4, '2XL': 192, 'XXL': 11,
  '3XL': 12, '4XL': 13, '5XL': 14, '6XL': 203, '7XL': 204,
  '30': 140, '32': 141, '34': 85, '35': 202, '36': 86, '37': 196, '38': 87,
  '39': 197, '40': 88, '41': 198, '42': 89, '43': 199, '44': 90, '45': 200,
  '46': 91, '47': 201, '48': 92, '49': 506, '50': 93, '52': 94, '54': 95,
  '56': 96, '58': 97, '60': 98, 'XS/S': 496, 'S/M': 186, 'M/L': 180,
  'L/XL': 187, 'XL/XXL': 181, '2XL/3XL': 188, '3XL/4XL': 497, '4XL/5XL': 189,
};

// Mapeo de campos del Excel principal (GARYS - CSV.xlsx)
const MAPEO_CAMPOS = {
  'Código de barras': 'codigo_barras',
  'Producto/Modelo': 'referencia',
  'Código color': 'codigo_color',
  'Color': 'color',
  'Talla': 'talla',
  'Referencia interna': 'referencia_interna',
  'Nombre comercial': 'nombre',
  'Precio público de Página Web': 'precio_base',
  'Cantidad disponible venta': 'stock',
  'Descripción para venta': 'descripcion_venta',
  'Descripción corta': 'descripcion_corta',
  'Composición': 'composicion',
  'Material': 'material',
  'Tratamiento': 'tratamiento',
  'Por profesión': 'profesion',
  'Por artículo': 'tipo_articulo',
  'Por colección': 'coleccion',
  'URL imagen': 'imagen_url',
  'Enlace descarga fotos': 'fotos_url',
  'Peso': 'peso',
  'Volumen': 'volumen',
  'URL icono color': 'icono_color_url',
};

// Categorías por profesión
const CATEGORIAS_PROFESION = {
  'Hostelería': 3,
  'Bar': 3,
  'Restauración': 3,
  'Sanidad': 10,
  'Peluquería': 19,
  'Estética': 19,
  'Industria': 26,
  'Construcción': 26,
  'Seguridad': 36,
  'Calzado': 44,
  'Infantil': 51,
  'Sport': 56,
  'Accesorios': 61,
  'Textil': 67,
  'Desechables': 75,
  'Campañas': 81,
};

// Categorías por tipo de artículo
const CATEGORIAS_ARTICULO = {
  'Chaquetas': 4,
  'Pantalones': 5,
  'Mandiles': 6,
  'Delantales': [6, 21],
  'Delantal': [6, 21],
  'Camarero': 7,
  'Calzado': 8,
  'Complementos': 9,
  'Casacas': 11,
  'Pijamas': 12,
  'Batas': 15,
  'Bata': 15,
  'Casacas peluquería': 20,
  'Batas peluquería': 21,
  'Bata peluquería': 21,
  'Batas de peluquería': 21,
  'Bata de peluquería': 21,
  'Estolas': 22,
  'Estola': 22,
  'Pantalones peluquería': 23,
  'Calzado peluquería': 24,
  'Complementos peluquería': 25,
  'Ropa industrial': 27,
  'Buzos': 28,
  'Chalecos': 31,
  'Alimentaria': 32,
  'Alta visibilidad': 33,
  'Guantes': 37,
  'Ocular': 38,
  'Auditiva': 39,
  'Respiratoria': 40,
  'Arneses': 41,
  'Química': 42,
  'Térmica': 43,
  'Zuecos': 45,
  'Zapatos': 46,
  'Botas': 47,
  'Uniformes': 53,
  'Camisetas': 57,
  'Sudaderas': 58,
  'Cortavientos': 60,
  'Gorras': 62,
  'Tote Bags': 63,
  'Riñoneras': 64,
  'Mochilas': 65,
  'Pañuelos': 66,
  'Polos': 69,
  'Mangas': 77,
  'Paticos': 79,
  'Camisas': 86,
};

// Categorías completas para detección por keywords (Code in JavaScript5)
const CATEGORIAS_KEYWORDS = [
  // HOSTELERÍA
  { parent_id: 3, parent_name: 'Hostelería', category_id: 4, name: 'Chaquetas', keywords: ['chaqueta', 'casaca', 'guerrera'] },
  { parent_id: 3, parent_name: 'Hostelería', category_id: 5, name: 'Pantalones', keywords: ['pantalón', 'pantalon'] },
  { parent_id: 3, parent_name: 'Hostelería', category_id: 6, name: 'Mandiles', keywords: ['mandil', 'delantal', 'peto'] },
  { parent_id: 3, parent_name: 'Hostelería', category_id: 7, name: 'Camarero', keywords: ['camarero', 'maitre', 'sumiller'] },
  { parent_id: 3, parent_name: 'Hostelería', category_id: 8, name: 'Calzado hostelería', keywords: ['zapato hostel', 'calzado hostel', 'zueco hostel'] },
  { parent_id: 3, parent_name: 'Hostelería', category_id: 9, name: 'Complementos hostelería', keywords: ['gorro chef', 'gorro cocinero', 'delantal cocina'] },
  // SANIDAD
  { parent_id: 10, parent_name: 'Sanidad', category_id: 11, name: 'Casacas', keywords: ['casaca', 'blusa sanitaria'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 12, name: 'Pijamas', keywords: ['pijama', 'uniforme sanitario'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 13, name: 'Pantalones sanidad', keywords: ['pantalón sanit', 'pantalon sanit'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 14, name: 'Chaquetas sanidad', keywords: ['chaqueta sanit'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 15, name: 'Batas', keywords: ['bata'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 16, name: 'Calzado sanitario', keywords: ['zapato sanit', 'calzado sanit'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 17, name: 'Zuecos sanidad', keywords: ['zueco'] },
  { parent_id: 10, parent_name: 'Sanidad', category_id: 18, name: 'Complementos sanidad', keywords: ['gorro quirofano', 'mascarilla'] },
  // PELUQUERÍA
  { parent_id: 19, parent_name: 'Peluquería', category_id: 20, name: 'Casacas peluquería', keywords: ['casaca peluq'] },
  { parent_id: 19, parent_name: 'Peluquería', category_id: 21, name: 'Batas peluquería', keywords: ['bata peluq', 'delantal peluq'] },
  { parent_id: 19, parent_name: 'Peluquería', category_id: 22, name: 'Estolas', keywords: ['estola'] },
  { parent_id: 19, parent_name: 'Peluquería', category_id: 23, name: 'Pantalones peluquería', keywords: ['pantalón peluq', 'pantalon peluq'] },
  { parent_id: 19, parent_name: 'Peluquería', category_id: 24, name: 'Calzado peluquería', keywords: ['calzado peluq', 'zapato peluq'] },
  { parent_id: 19, parent_name: 'Peluquería', category_id: 25, name: 'Complementos peluquería', keywords: ['complemento peluq'] },
  // INDUSTRIA
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 27, name: 'Ropa industrial', keywords: ['ropa trabajo', 'mono trabajo'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 28, name: 'Buzos', keywords: ['buzo', 'mono'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 29, name: 'Pantalones industria', keywords: ['pantalón trabajo', 'pantalon trabajo', 'pantalón industr'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 30, name: 'Chaquetas industria', keywords: ['chaqueta trabajo', 'chaqueta industr'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 31, name: 'Chalecos', keywords: ['chaleco'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 32, name: 'Alimentaria', keywords: ['alimentaria', 'food'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 33, name: 'Alta visibilidad', keywords: ['alta visibilidad', 'reflectante', 'fluorescente'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 34, name: 'Calzado laboral', keywords: ['bota trabajo', 'zapato seguridad', 'calzado laboral'] },
  { parent_id: 26, parent_name: 'Industria y construcción', category_id: 35, name: 'Ropa técnica', keywords: ['técnica', 'tecnica', 'impermeable'] },
  // SEGURIDAD
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 37, name: 'Guantes', keywords: ['guante'] },
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 38, name: 'Ocular', keywords: ['gafas', 'ocular', 'pantalla facial'] },
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 39, name: 'Auditiva', keywords: ['auditiv', 'tapones oidos', 'orejeras'] },
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 40, name: 'Respiratoria', keywords: ['mascarilla', 'respirador', 'respiratoria'] },
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 41, name: 'Arneses', keywords: ['arnés', 'arnes', 'anticaida'] },
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 42, name: 'Química', keywords: ['quimica', 'química', 'ácido'] },
  { parent_id: 36, parent_name: 'Seguridad y EPIs', category_id: 43, name: 'Térmica', keywords: ['térmica', 'termica', 'soldador'] },
  // CALZADO
  { parent_id: 44, parent_name: 'Calzado', category_id: 45, name: 'Zuecos', keywords: ['zueco'] },
  { parent_id: 44, parent_name: 'Calzado', category_id: 46, name: 'Zapatos', keywords: ['zapato', 'mocasín'] },
  { parent_id: 44, parent_name: 'Calzado', category_id: 47, name: 'Botas', keywords: ['bota'] },
  // INFANTIL
  { parent_id: 51, parent_name: 'Infantil', category_id: 52, name: 'Batas infantil', keywords: ['bata infant', 'babi'] },
  { parent_id: 51, parent_name: 'Infantil', category_id: 53, name: 'Uniformes infantil', keywords: ['uniforme infant', 'escolar'] },
  { parent_id: 51, parent_name: 'Infantil', category_id: 54, name: 'Delantales', keywords: ['delantal infant'] },
  // SPORT
  { parent_id: 56, parent_name: 'Sport', category_id: 57, name: 'Camisetas sport', keywords: ['camiseta deport', 'camiseta técnica'] },
  { parent_id: 56, parent_name: 'Sport', category_id: 58, name: 'Sudaderas sport', keywords: ['sudadera'] },
  { parent_id: 56, parent_name: 'Sport', category_id: 59, name: 'Pantalones sport', keywords: ['pantalón deport', 'malla'] },
  { parent_id: 56, parent_name: 'Sport', category_id: 60, name: 'Cortavientos sport', keywords: ['cortavientos', 'chaqueta deport'] },
  // ACCESORIOS
  { parent_id: 61, parent_name: 'Accesorios', category_id: 62, name: 'Gorras', keywords: ['gorra', 'visera'] },
  { parent_id: 61, parent_name: 'Accesorios', category_id: 63, name: 'Tote Bags', keywords: ['tote bag', 'bolsa'] },
  { parent_id: 61, parent_name: 'Accesorios', category_id: 64, name: 'Riñoneras', keywords: ['riñonera'] },
  { parent_id: 61, parent_name: 'Accesorios', category_id: 65, name: 'Mochilas', keywords: ['mochila'] },
  { parent_id: 61, parent_name: 'Accesorios', category_id: 66, name: 'Pañuelos', keywords: ['pañuelo', 'bandana'] },
  // TEXTIL PROMOCIONAL
  { parent_id: 67, parent_name: 'Textil promocional', category_id: 68, name: 'Camisetas promocional', keywords: ['camiseta promoc'] },
  { parent_id: 67, parent_name: 'Textil promocional', category_id: 69, name: 'Polos', keywords: ['polo'] },
  { parent_id: 67, parent_name: 'Textil promocional', category_id: 70, name: 'Sudaderas promocional', keywords: ['sudadera promoc'] },
  // DESECHABLES
  { parent_id: 75, parent_name: 'Desechables', category_id: 76, name: 'Batas desechables', keywords: ['bata desechable'] },
  { parent_id: 75, parent_name: 'Desechables', category_id: 77, name: 'Mangas', keywords: ['manga desechable', 'manguito'] },
  { parent_id: 75, parent_name: 'Desechables', category_id: 78, name: 'Gorras desechables', keywords: ['gorra desechable', 'gorro desechable'] },
  { parent_id: 75, parent_name: 'Desechables', category_id: 79, name: 'Paticos', keywords: ['paticos', 'calzas'] },
  { parent_id: 75, parent_name: 'Desechables', category_id: 80, name: 'Guantes desechables', keywords: ['guante desechable'] },
];

module.exports = {
  CONFIG,
  PRESTASHOP,
  CARACTERISTICAS_IDS,
  COLORES_MAP,
  TALLAS_MAP,
  MAPEO_CAMPOS,
  CATEGORIAS_PROFESION,
  CATEGORIAS_ARTICULO,
  CATEGORIAS_KEYWORDS,
};
