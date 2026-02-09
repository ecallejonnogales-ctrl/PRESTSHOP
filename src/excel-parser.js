// ============================================
// EXCEL PARSER
// Replica la lógica de Code in JavaScript3 + Code in JavaScript4
// Parsea los dos ficheros Excel y devuelve datos combinados
// ============================================

const XLSX = require('xlsx');
const {
  CONFIG, MAPEO_CAMPOS, CARACTERISTICAS_IDS,
  CATEGORIAS_PROFESION, CATEGORIAS_ARTICULO,
} = require('./config');
const {
  limpiarTexto, limpiarPrecio, calcularPrecioVenta,
  limpiarStock, generarSeoSlug, generarMetaTitle,
  generarMetaDescription, extraerGramaje, extraerReferenciaBase,
  normName, prepararCodigoColor, limitarDescripcionCorta,
  bulletsDesdeTexto,
} = require('./helpers');

/**
 * Parsea el fichero principal de Gary's (GARYS - CSV.xlsx)
 * Equivalente a: XLSX -> Code in JavaScript3
 */
function parseMainFile(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const productos = [];
  const preciosPorReferenciaBase = new Map();

  for (const fila of rows) {
    const producto = {};

    // Rellenar campos desde el mapeo
    for (const [campoExcel, campoSistema] of Object.entries(MAPEO_CAMPOS)) {
      const valor = fila[campoExcel];

      if (campoSistema === 'precio_base') {
        producto.precio_base = limpiarPrecio(valor);
        producto.precio_venta = calcularPrecioVenta(producto.precio_base, CONFIG.margen_beneficio);
      } else if (campoSistema === 'stock') {
        producto[campoSistema] = limpiarStock(valor);
      } else if (campoSistema === 'peso' || campoSistema === 'volumen') {
        const num = parseFloat(String(valor || '0').replace(',', '.'));
        producto[campoSistema] = isNaN(num) ? 0 : num;
      } else {
        producto[campoSistema] = limpiarTexto(valor);
      }
    }

    // Referencia base para compartir precio
    producto.referencia_base = extraerReferenciaBase(producto.referencia);

    // Herencia de precio
    if (producto.precio_base != null) {
      preciosPorReferenciaBase.set(producto.referencia_base, producto.precio_base);
    } else {
      const precioGuardado = preciosPorReferenciaBase.get(producto.referencia_base);
      if (precioGuardado != null) {
        producto.precio_base = precioGuardado;
        producto.precio_venta = calcularPrecioVenta(precioGuardado, CONFIG.margen_beneficio);
      }
    }

    // Validación mínima
    if (!producto.referencia || !producto.nombre) continue;

    // SEO
    producto.link_rewrite = generarSeoSlug(producto);
    producto.meta_title = generarMetaTitle(producto);
    producto.meta_description = generarMetaDescription(producto);

    // Campos comunes
    producto.id_manufacturer = CONFIG.id_manufacturer;
    producto.id_tax_rules_group = CONFIG.id_tax_rules_group;
    producto.id_idioma = CONFIG.id_idioma;
    producto.gramaje = extraerGramaje(producto.composicion);

    // Categorías
    producto.categorias = obtenerCategorias(producto);
    producto.id_category_default = producto.categorias[0];

    // XML de categorías
    producto.categorias_xml = producto.categorias
      .map(catId => `<category><id>${catId}</id></category>`)
      .join('\n        ');

    // Características XML
    const caracteristicas = [];
    if (producto.composicion) {
      caracteristicas.push(`<product_feature>
          <id>0</id>
          <id_feature>${CARACTERISTICAS_IDS.composicion}</id_feature>
          <id_feature_value>0</id_feature_value>
          <custom>1</custom>
          <value><language id="4"><![CDATA[${producto.composicion}]]></language></value>
        </product_feature>`);
    }
    if (producto.gramaje) {
      caracteristicas.push(`<product_feature>
          <id>0</id>
          <id_feature>${CARACTERISTICAS_IDS.gramaje}</id_feature>
          <id_feature_value>0</id_feature_value>
          <custom>1</custom>
          <value><language id="4"><![CDATA[${producto.gramaje}]]></language></value>
        </product_feature>`);
    }
    if (producto.material) {
      caracteristicas.push(`<product_feature>
          <id>0</id>
          <id_feature>${CARACTERISTICAS_IDS.material}</id_feature>
          <id_feature_value>0</id_feature_value>
          <custom>1</custom>
          <value><language id="4"><![CDATA[${producto.material}]]></language></value>
        </product_feature>`);
    }
    producto.caracteristicas_xml = caracteristicas.join('\n        ');

    // Normalizar color/talla
    producto.color_name_norm = normName(producto.color);
    producto.talla_name_norm = normName(producto.talla);
    producto.color_hex = prepararCodigoColor(producto.codigo_color);

    productos.push(producto);
  }

  return productos;
}

/**
 * Parsea el fichero secundario (precios/referencias)
 * Equivalente a: XLSX1 -> Code in JavaScript4
 */
function parseSecondaryFile(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  // Intentar leer la hoja "GENERAL", si no la primera
  const sheetName = workbook.SheetNames.includes('GENERAL') ? 'GENERAL' : workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const productos = [];
  const preciosPorReferencia = new Map();

  for (const fila of rows) {
    const producto = esProductoValido(fila);
    if (!producto) continue;

    if (producto.precio != null) {
      preciosPorReferencia.set(producto.referencia, producto.precio);
    } else {
      const heredado = preciosPorReferencia.get(producto.referencia);
      if (heredado != null) producto.precio = heredado;
    }

    productos.push({
      referencia: producto.referencia,
      nombre: limpiarTexto(producto.concepto),
      descripcion: limpiarTexto(producto.concepto),
      precio: producto.precio != null ? producto.precio : 0,
    });
  }

  return productos;
}

function esProductoValido(fila) {
  const valores = Object.values(fila);
  let tieneReferencia = false;
  let tieneConcepto = false;
  let referencia = null;
  let concepto = null;
  let precio = null;

  for (const valor of valores) {
    if (!valor) continue;
    const raw = String(valor).trim();
    const str = limpiarTexto(raw);

    if (!tieneReferencia && /^[A-Za-z0-9]{5,20}$/.test(str)) {
      tieneReferencia = true;
      referencia = str;
      continue;
    }

    if (/^\d+[,.]?\d*$/.test(str)) {
      const num = parseFloat(str.replace(',', '.'));
      if (!isNaN(num) && num > 0 && num < 10000) {
        precio = num;
        continue;
      }
    }

    if (!tieneConcepto && str.length > 10 && /[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ]/.test(str) && !str.startsWith('*')) {
      tieneConcepto = true;
      concepto = str;
    }
  }

  if (tieneReferencia && tieneConcepto) {
    return { referencia, concepto, precio };
  }
  return null;
}

/**
 * Merge: combina por referencia (equivalente al nodo Merge)
 */
function mergeProducts(mainProducts, secondaryProducts) {
  const secondaryMap = new Map();
  for (const p of secondaryProducts) {
    secondaryMap.set(p.referencia, p);
  }

  return mainProducts.map(main => {
    const sec = secondaryMap.get(main.referencia);
    if (sec) {
      return { ...main, ...sec, ...main }; // main tiene prioridad
    }
    return main;
  });
}

/**
 * Enriquecer con descripciones HTML (equivalente a Code in JavaScript5)
 */
function enrichProducts(productos) {
  const { CATEGORIAS_KEYWORDS } = require('./config');

  return productos.map(producto => {
    // Descripción corta HTML
    let descCortaDesdeVenta = '';
    let descCortaDesdeCampoCorto = '';

    if (producto.descripcion_venta) {
      const base = limitarDescripcionCorta(producto.descripcion_venta, 400);
      descCortaDesdeVenta = bulletsDesdeTexto(base);
    }
    if (producto.descripcion_corta) {
      const base = limitarDescripcionCorta(producto.descripcion_corta, 400);
      descCortaDesdeCampoCorto = bulletsDesdeTexto(base);
    }

    let descripcion_corta_html = '';
    if (descCortaDesdeVenta && descCortaDesdeCampoCorto) {
      descripcion_corta_html = descCortaDesdeVenta.length <= descCortaDesdeCampoCorto.length
        ? descCortaDesdeVenta : descCortaDesdeCampoCorto;
    } else {
      descripcion_corta_html = descCortaDesdeVenta || descCortaDesdeCampoCorto;
    }

    if (!descripcion_corta_html) {
      if (producto.descripcion_corta) {
        descripcion_corta_html = limpiarTexto(producto.descripcion_corta).replace(/\n/g, '<br>');
      } else if (producto.descripcion_venta) {
        descripcion_corta_html = limpiarTexto(producto.descripcion_venta).replace(/\n/g, '<br>');
      }
    }

    // Descripción larga HTML
    let descripcion_larga_html = '';
    if (producto.composicion) {
      descripcion_larga_html += `<strong>Material:</strong><br>${bulletsDesdeTexto(producto.composicion)}<br>`;
    }
    if (producto.tratamiento) {
      descripcion_larga_html += `<strong>Lavado y cuidado:</strong><br>${bulletsDesdeTexto(producto.tratamiento)}<br>`;
    }
    if (!descripcion_larga_html && producto.descripcion_venta) {
      descripcion_larga_html = bulletsDesdeTexto(limpiarTexto(producto.descripcion_venta));
    }

    // Detectar categoría por keywords
    const textoCategoria = [
      producto.descripcion_venta || '',
      producto.descripcion_corta || '',
      producto.composicion || '',
      producto.tratamiento || '',
    ].join(' ');

    const catDetectada = detectarCategoriaKeywords(
      producto.nombre || '', textoCategoria, CATEGORIAS_KEYWORDS
    );

    return {
      ...producto,
      descripcion_venta: descripcion_corta_html,
      descripcion_larga: descripcion_larga_html,
      category_detected: catDetectada,
    };
  });
}

function detectarCategoriaKeywords(nombre, descripcion, categorias) {
  const textoCompleto = `${nombre} ${descripcion}`.toLowerCase();
  for (const cat of categorias) {
    for (const keyword of cat.keywords) {
      if (textoCompleto.includes(keyword.toLowerCase())) {
        return {
          category_id: cat.category_id,
          category_name: cat.name,
          parent_id: cat.parent_id,
          parent_name: cat.parent_name,
        };
      }
    }
  }
  return { category_id: null, category_name: 'Sin categoría', parent_id: null, parent_name: null };
}

/**
 * Obtener categorías (lógica del Code in JavaScript3)
 */
function obtenerCategorias(producto) {
  const categoriasSet = new Set();
  const addCat = (id) => { if (id) categoriasSet.add(id); };

  const profesion = String(producto.profesion || '').toLowerCase();
  const tipoArticulo = String(producto.tipo_articulo || '').toLowerCase();
  const textoExtra = (
    (producto.nombre || '') + ' ' +
    (producto.descripcion_venta || '') + ' ' +
    (producto.descripcion_corta || '')
  ).toLowerCase();

  // Por profesión
  for (const [key, catId] of Object.entries(CATEGORIAS_PROFESION)) {
    if (profesion.includes(key.toLowerCase())) addCat(catId);
  }

  // Por tipo de artículo
  for (const [key, catId] of Object.entries(CATEGORIAS_ARTICULO)) {
    if (tipoArticulo.includes(key.toLowerCase())) {
      if (Array.isArray(catId)) catId.forEach(addCat);
      else addCat(catId);
    }
  }

  // Heurísticas extra
  const esCalzadoTexto = /\b(calzado|zapato|zapatos|zapatilla|zapatillas|zueco|zuecos|bota|botas|botín|botin)\b/.test(textoExtra);
  const esZapato = /\b(zapato|zapatos|zapatilla|zapatillas)\b/.test(textoExtra);
  const esZueco = /\bzuec|zueco|zuecos\b/.test(textoExtra);
  const esBota = /\b(bota|botas|botín|botin)\b/.test(textoExtra);

  const esCalzado = esCalzadoTexto || tipoArticulo.includes('calzado');
  const esHosteleria = profesion.includes('hosteler') || profesion.includes('bar') || profesion.includes('restaurac');
  const esIndustria = profesion.includes('industr') || profesion.includes('construcc');
  const esSeguridad = profesion.includes('seguridad');

  if (esCalzado) addCat(44);
  if (esZapato || tipoArticulo.includes('zapato')) addCat(46);
  if (esZueco) addCat(45);
  if (esBota) addCat(47);
  if (esCalzado && esHosteleria) addCat(8);

  const tienePalabrasSeguridad =
    textoExtra.includes('seguridad') || textoExtra.includes('puntera') ||
    textoExtra.includes('s1p') || textoExtra.includes('s2') ||
    textoExtra.includes('s3') || textoExtra.includes('en iso') ||
    textoExtra.includes('antidesliz');

  if (esCalzado && (esIndustria || esSeguridad || tienePalabrasSeguridad)) addCat(34);
  if (textoExtra.includes('guante')) addCat(37);
  if (textoExtra.includes('gafa')) addCat(38);
  if (textoExtra.includes('arnés') || textoExtra.includes('arnes')) addCat(41);
  if (textoExtra.includes('mascarilla') || textoExtra.includes('respirador')) addCat(40);
  if (textoExtra.includes('tapón') || textoExtra.includes('orejera')) addCat(39);

  const categorias = Array.from(categoriasSet);
  return categorias.length ? categorias : [CONFIG.categoria_default];
}

module.exports = {
  parseMainFile,
  parseSecondaryFile,
  mergeProducts,
  enrichProducts,
};
