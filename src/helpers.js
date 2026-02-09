// ============================================
// FUNCIONES AUXILIARES
// Extraídas del workflow n8n
// ============================================

/**
 * Limpia texto: corrige mojibake, entidades HTML, <br> a espacio, quita tags
 */
function limpiarTexto(valor) {
  if (!valor) return '';
  let texto = String(valor);

  // Mojibake típico
  texto = texto
    .replace(/Ã¡/g, 'á').replace(/Ã©/g, 'é').replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó').replace(/Ãº/g, 'ú').replace(/Ã±/g, 'ñ')
    .replace(/Ã'/g, 'Ñ').replace(/Âº/g, 'º').replace(/Âª/g, 'ª')
    .replace(/Â·/g, '·').replace(/Â/g, '');

  // Entidades HTML
  texto = texto
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  // <br> -> espacio y quitar etiquetas
  texto = texto.replace(/<br\s*\/?>/gi, ' ');
  texto = texto.replace(/<[^>]+>/g, '');

  // Normalizar espacios
  texto = texto.replace(/\r/g, '').replace(/\s+/g, ' ');

  return texto.trim();
}

function limpiarPrecio(valor) {
  if (!valor) return null;
  const numStr = String(valor).replace(/[^0-9,.-]/g, '').replace(',', '.');
  const num = parseFloat(numStr);
  return (isNaN(num) || num <= 0) ? null : num;
}

function calcularPrecioVenta(precioBase, margen) {
  if (!precioBase) return null;
  const multiplicador = 1 + (margen || 0);
  return (precioBase * multiplicador).toFixed(6);
}

function limpiarStock(valor) {
  if (!valor) return 0;
  const num = parseInt(String(valor).replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
}

function generarLinkRewrite(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function cortarSeo(texto, max) {
  const t = stripHtmlToText(texto);
  if (!t) return '';
  if (t.length <= max) return t;

  let rec = t.slice(0, max);
  const cortes = [
    rec.lastIndexOf('.'), rec.lastIndexOf('!'), rec.lastIndexOf('?'),
    rec.lastIndexOf(';'), rec.lastIndexOf(':'), rec.lastIndexOf(','),
  ];
  let corte = Math.max(...cortes);
  if (corte < max * 0.5) corte = rec.lastIndexOf(' ');
  if (corte > 0) rec = rec.slice(0, corte);
  return rec.trim();
}

function stripHtmlToText(s) {
  if (!s) return '';
  return String(s)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generarMetaTitle(producto) {
  const partes = [];
  if (producto.nombre) partes.push(producto.nombre);
  if (producto.tipo_articulo) partes.push(producto.tipo_articulo);
  if (producto.profesion) partes.push(`Uniformes ${producto.profesion}`);
  return cortarSeo(partes.join(' | '), 60);
}

function generarMetaDescription(producto) {
  const frases = [];
  if (producto.nombre) frases.push(`${producto.nombre} profesional`);
  if (producto.composicion) frases.push(`fabricada en ${producto.composicion}`);
  if (producto.tipo_articulo) frases.push(`ideal para ${String(producto.tipo_articulo).toLowerCase()}`);
  if (producto.profesion) frases.push(`uso en ${String(producto.profesion).toLowerCase()}`);
  frases.push('Compra online con envío rápido');
  return cortarSeo(frases.join('. ') + '.', 160);
}

function generarSeoSlug(producto) {
  const partes = [];
  if (producto.nombre) partes.push(producto.nombre);
  if (producto.tipo_articulo) partes.push(producto.tipo_articulo);
  if (producto.profesion) partes.push(producto.profesion);
  let slug = generarLinkRewrite(partes.join(' '));
  if (slug.length > 128) {
    slug = slug.slice(0, 128);
    const lastDash = slug.lastIndexOf('-');
    if (lastDash > 40) slug = slug.slice(0, lastDash);
    slug = slug.replace(/-+$/g, '');
  }
  return slug || 'producto';
}

function extraerGramaje(composicion) {
  if (!composicion) return '';
  const match = String(composicion).match(/(\d+)\s*gr?\/m[²2Â²]/i);
  return match ? match[1] + ' gr/m²' : '';
}

function extraerReferenciaBase(referencia) {
  if (!referencia) return '';
  return String(referencia).split('-')[0];
}

function normName(v) {
  if (v === null || v === undefined) return '';
  let s = String(v).trim();
  if (!s) return '';
  s = s.replace(/\s+/g, ' ');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.toUpperCase();
}

function prepararCodigoColor(codigoRaw) {
  if (!codigoRaw) return '#FFFFFF';
  let codigo = String(codigoRaw).trim();

  if (codigo.match(/^#[0-9A-Fa-f]{6}$/)) return codigo.toUpperCase();
  if (codigo.match(/^[0-9A-Fa-f]{6}$/)) return '#' + codigo.toUpperCase();

  if (codigo.match(/^[0-9A-Fa-f]{1,3}$/)) {
    if (codigo.length === 3) {
      const hex = codigo.split('').map(c => c + c).join('');
      return '#' + hex.toUpperCase();
    }
    if (codigo.length === 2) {
      const hex = codigo.split('').map(c => c + c).join('') + '00';
      return '#' + hex.toUpperCase();
    }
    if (codigo.length === 1) {
      return '#' + codigo.repeat(6).toUpperCase();
    }
  }

  if (codigo.match(/^[0-9A-Fa-f]{4,6}$/)) {
    return '#' + codigo.padStart(6, '0').toUpperCase();
  }

  return '#FFFFFF';
}

function limitarDescripcionCorta(texto, limite = 400) {
  if (!texto) return '';
  let t = limpiarTexto(texto);
  if (t.length <= limite) return t;

  let rec = t.slice(0, limite);
  const cortes = [
    rec.lastIndexOf('.'), rec.lastIndexOf('!'), rec.lastIndexOf('?'),
    rec.lastIndexOf(';'), rec.lastIndexOf(':'),
  ];
  let corte = Math.max(...cortes);
  if (corte < limite * 0.4) {
    const lastSpace = rec.lastIndexOf(' ');
    if (lastSpace > 0) corte = lastSpace;
  }
  if (corte > 0) rec = rec.slice(0, corte + 1);
  return rec.trim();
}

function bulletsDesdeTexto(textoRaw) {
  if (!textoRaw) return '';
  const limpio = limpiarTexto(textoRaw);
  if (!limpio) return '';

  let tmp = limpio
    .replace(/[\r\n]+/g, '\n')
    .replace(/ - /g, '\n- ')
    .replace(/•/g, '\n- ');

  let partes = tmp
    .split(/\n+/)
    .map(t => t.trim().replace(/^[-•]\s*/, ''))
    .filter(t => t.length > 3);

  if (!partes.length) partes = [limpio];

  let html = '';
  for (const p of partes) {
    const sinPuntoFinal = p.replace(/\.$/, '');
    html += `• ${sinPuntoFinal}<br>`;
  }
  return html;
}

module.exports = {
  limpiarTexto,
  limpiarPrecio,
  calcularPrecioVenta,
  limpiarStock,
  generarLinkRewrite,
  generarMetaTitle,
  generarMetaDescription,
  generarSeoSlug,
  extraerGramaje,
  extraerReferenciaBase,
  normName,
  prepararCodigoColor,
  limitarDescripcionCorta,
  bulletsDesdeTexto,
  cortarSeo,
  stripHtmlToText,
};
