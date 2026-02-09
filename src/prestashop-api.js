// ============================================
// PRESTASHOP API CLIENT
// Replica todas las llamadas HTTP del workflow n8n
// ============================================

const axios = require('axios');
const FormData = require('form-data');
const { PRESTASHOP, CONFIG } = require('./config');

function getClient() {
  return axios.create({
    baseURL: PRESTASHOP.url,
    auth: { username: PRESTASHOP.apiKey, password: '' },
    timeout: 30000,
    headers: { 'Content-Type': 'application/xml' },
  });
}

async function retryRequest(fn, retries = 3, delay = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      const isNetwork = !err.response || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT';
      if (!isNetwork) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
}

// ========== PRODUCT OPTION VALUES (colores/tallas) ==========

/** Obtener todos los colores existentes (grupo 2) */
async function getColores() {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get('/api/product_option_values', {
      params: { output_format: 'JSON', display: 'full', 'filter[id_attribute_group]': 2 },
    })
  );
  return resp.data.product_option_values || [];
}

/** Obtener todas las tallas existentes (grupo 1) */
async function getTallas() {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get('/api/product_option_values', {
      params: { output_format: 'JSON', display: 'full', 'filter[id_attribute_group]': 1 },
    })
  );
  return resp.data.product_option_values || [];
}

/** Crear un nuevo color (grupo 2) */
async function createColor(colorNameNorm, colorHex) {
  const client = getClient();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option_value>
    <id_attribute_group>2</id_attribute_group>
    <color>${colorHex}</color>
    <position>0</position>
    <name>
      <language id="1"><![CDATA[${colorNameNorm}]]></language>
      <language id="4"><![CDATA[${colorNameNorm}]]></language>
    </name>
  </product_option_value>
</prestashop>`;

  const resp = await retryRequest(() =>
    client.post('/api/product_option_values?output_format=JSON', xml)
  );
  return resp.data.product_option_value;
}

/** Crear una nueva talla (grupo 1) */
async function createTalla(tallaNameNorm) {
  const client = getClient();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option_value>
    <id_attribute_group>1</id_attribute_group>
    <color></color>
    <position>0</position>
    <name>
      <language id="1"><![CDATA[${tallaNameNorm}]]></language>
      <language id="4"><![CDATA[${tallaNameNorm}]]></language>
    </name>
  </product_option_value>
</prestashop>`;

  const resp = await retryRequest(() =>
    client.post('/api/product_option_values?output_format=JSON', xml)
  );
  return resp.data.product_option_value;
}

// ========== PRODUCTS ==========

/** Buscar producto por referencia */
async function findProductByReference(reference) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get('/api/products', {
      params: {
        output_format: 'JSON',
        display: '[id,reference,ean13]',
        'filter[reference]': reference,
      },
    })
  );
  const products = resp.data.products || [];
  return products.length > 0 ? products[0] : null;
}

/** Obtener producto completo por ID */
async function getProduct(id) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get(`/api/products/${id}`, { params: { output_format: 'JSON' } })
  );
  return resp.data.product;
}

/** Crear un nuevo producto */
async function createProduct(producto) {
  const client = getClient();

  // Truncar descripción corta a 800 caracteres
  let descCorta = producto.descripcion_venta || producto.descripcion_corta || '';
  if (descCorta.length > 800) {
    const truncated = descCorta.substring(0, 800);
    const lastDot = truncated.lastIndexOf('.');
    descCorta = lastDot > 0 ? truncated.substring(0, lastDot + 1) : truncated;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <reference><![CDATA[${producto.referencia || ''}]]></reference>
    <ean13><![CDATA[${producto.codigo_barras || ''}]]></ean13>
    <active>1</active>
    <price>${producto.precio_venta || 0}</price>
    <wholesale_price>${producto.precio_base || 0}</wholesale_price>
    <id_tax_rules_group>${producto.id_tax_rules_group || CONFIG.id_tax_rules_group}</id_tax_rules_group>
    <id_category_default>${producto.id_category_default || CONFIG.categoria_default}</id_category_default>
    <id_manufacturer>${producto.id_manufacturer || CONFIG.id_manufacturer}</id_manufacturer>
    <id_supplier>${CONFIG.id_supplier}</id_supplier>
    <weight>${producto.peso || 0}</weight>
    <state>1</state>
    <available_for_order>1</available_for_order>
    <show_price>1</show_price>
    <indexed>1</indexed>
    <visibility>both</visibility>
    <minimal_quantity>1</minimal_quantity>
    <name>
      <language id="4"><![CDATA[${producto.nombre || ''}]]></language>
    </name>
    <description>
      <language id="4"><![CDATA[${producto.descripcion_larga || producto.descripcion_venta || producto.descripcion_corta || producto.nombre || ''}]]></language>
    </description>
    <description_short>
      <language id="4"><![CDATA[${descCorta}]]></language>
    </description_short>
    <link_rewrite>
      <language id="4"><![CDATA[${producto.link_rewrite || 'producto'}]]></language>
    </link_rewrite>
    <meta_title>
      <language id="4"><![CDATA[${producto.meta_title || producto.nombre || ''}]]></language>
    </meta_title>
    <meta_description>
      <language id="4"><![CDATA[${producto.meta_description || ''}]]></language>
    </meta_description>
    <associations>
      <categories>
        ${producto.categorias_xml || ''}
      </categories>
      <product_features>
        ${producto.caracteristicas_xml || ''}
      </product_features>
    </associations>
  </product>
</prestashop>`;

  const resp = await retryRequest(() =>
    client.post('/api/products?output_format=JSON', xml)
  );
  return resp.data.product;
}

/** Actualizar producto existente (PUT con XML completo) */
async function updateProduct(idProduct, xmlBody) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.put(`/api/products/${idProduct}`, xmlBody)
  );
  return resp.data;
}

// ========== PRODUCT SUPPLIERS ==========

/** Crear product_supplier */
async function createProductSupplier(idProduct, referenciaProveedor, coste) {
  const client = getClient();
  const costeFinal = (!isNaN(coste) && coste > 0) ? Number(coste).toFixed(6) : '0.000000';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop>
  <product_supplier>
    <id></id>
    <id_product>${idProduct}</id_product>
    <id_product_attribute>0</id_product_attribute>
    <id_supplier>${CONFIG.id_supplier}</id_supplier>
    <product_supplier_reference><![CDATA[${referenciaProveedor}]]></product_supplier_reference>
    <product_supplier_price_te>${costeFinal}</product_supplier_price_te>
    <id_currency>0</id_currency>
  </product_supplier>
</prestashop>`;

  const resp = await retryRequest(() =>
    client.post('/api/product_suppliers?output_format=JSON', xml)
  );
  return resp.data.product_supplier;
}

// ========== COMBINATIONS ==========

/** Buscar combinaciones por id_product y ean13 */
async function findCombination(idProduct, ean13) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get('/api/combinations', {
      params: {
        output_format: 'JSON',
        'filter[id_product]': idProduct,
        'filter[ean13]': ean13,
      },
    })
  );
  const combinations = resp.data.combinations || [];
  return combinations.length > 0 ? combinations[0] : null;
}

/** Obtener combinación completa por ID */
async function getCombination(id) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get(`/api/combinations/${id}`, { params: { output_format: 'JSON' } })
  );
  return resp.data.combination;
}

/** Crear una nueva combinación */
async function createCombination(idProduct, referencia, ean13, optionIds, defaultOn = 1) {
  const client = getClient();

  const optionValuesXml = optionIds.map(id =>
    `<product_option_value><id>${id}</id></product_option_value>`
  ).join('\n        ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop>
  <combination>
    <id></id>
    <id_product>${idProduct}</id_product>
    <reference><![CDATA[${referencia}]]></reference>
    <ean13><![CDATA[${ean13}]]></ean13>
    <price>0.000000</price>
    <minimal_quantity>1</minimal_quantity>
    <default_on>${defaultOn}</default_on>
    <associations>
      <product_option_values>
        ${optionValuesXml}
      </product_option_values>
    </associations>
  </combination>
</prestashop>`;

  const resp = await retryRequest(() =>
    client.post('/api/combinations?output_format=JSON', xml)
  );
  return resp.data.combination;
}

/** Actualizar combinación (PUT) */
async function updateCombination(idCombination, xmlBody) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.put(`/api/combinations/${idCombination}?output_format=JSON`, xmlBody)
  );
  return resp.data;
}

// ========== IMAGES ==========

/** Subir imagen a un producto */
async function uploadImage(idProduct, imageBuffer, filename) {
  const client = getClient();
  const form = new FormData();
  form.append('image', imageBuffer, { filename: filename || 'image.jpg' });

  const resp = await retryRequest(() =>
    axios.post(
      `${PRESTASHOP.url}/api/images/products/${idProduct}`,
      form,
      {
        auth: { username: PRESTASHOP.apiKey, password: '' },
        headers: form.getHeaders(),
        timeout: 60000,
        responseType: 'text',
      }
    )
  );
  return resp.data;
}

/** Extraer id_image de la respuesta XML de upload */
function extractImageId(xmlResponse) {
  const match = String(xmlResponse).match(/<id><!\[CDATA\[(\d+)\]\]><\/id>/);
  return match ? parseInt(match[1], 10) : null;
}

// ========== STOCK ==========

/** Obtener stock_available para un producto+combinación */
async function getStockAvailable(idProduct, idProductAttribute) {
  const client = getClient();
  const resp = await retryRequest(() =>
    client.get('/api/stock_availables', {
      params: {
        display: 'full',
        output_format: 'JSON',
        'filter[id_product]': idProduct,
        'filter[id_product_attribute]': idProductAttribute,
      },
    })
  );
  const stocks = resp.data.stock_availables || [];
  return stocks.length > 0 ? stocks[0] : null;
}

/** Actualizar stock */
async function updateStock(stockAvailable, newQuantity) {
  const client = getClient();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_available>
    <id>${stockAvailable.id}</id>
    <id_product>${stockAvailable.id_product}</id_product>
    <id_product_attribute>${stockAvailable.id_product_attribute}</id_product_attribute>
    <id_shop>${stockAvailable.id_shop}</id_shop>
    <quantity>${newQuantity}</quantity>
    <out_of_stock>0</out_of_stock>
    <depends_on_stock>0</depends_on_stock>
  </stock_available>
</prestashop>`;

  const resp = await retryRequest(() =>
    client.put(`/api/stock_availables/${stockAvailable.id}`, xml)
  );
  return resp.data;
}

// ========== COLOR ICON / TEXTURE ==========

/** Descargar imagen del icono de color desde URL de Gary's */
async function downloadColorIcon(url) {
  const resp = await retryRequest(() =>
    axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
      },
      validateStatus: (status) => status < 400,
    })
  );
  return Buffer.from(resp.data);
}

/**
 * Subir imagen de textura/icono a un atributo de color (product_option_value)
 * PrestaShop API: POST /api/images/customizations/{id} NO funciona para atributos.
 * Para atributos se usa: POST /api/images/product_option_values/{id}
 * El campo se llama "image" en el multipart form.
 */
async function uploadColorTexture(colorAttributeId, imageBuffer, filename) {
  const form = new FormData();
  form.append('image', imageBuffer, {
    filename: filename || 'color-icon.jpg',
    contentType: 'image/jpeg',
  });

  const resp = await retryRequest(() =>
    axios.post(
      `${PRESTASHOP.url}/api/images/product_option_values/${colorAttributeId}`,
      form,
      {
        auth: { username: PRESTASHOP.apiKey, password: '' },
        headers: form.getHeaders(),
        timeout: 30000,
      }
    )
  );
  return resp.data;
}

// ========== DOWNLOAD IMAGES (from Gary's URLs) ==========

/** Descargar archivo ZIP de fotos desde URL de Gary's */
async function downloadPhotosZip(url) {
  const resp = await retryRequest(() =>
    axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    })
  );
  return Buffer.from(resp.data);
}

module.exports = {
  getColores,
  getTallas,
  createColor,
  createTalla,
  downloadColorIcon,
  uploadColorTexture,
  findProductByReference,
  getProduct,
  createProduct,
  updateProduct,
  createProductSupplier,
  findCombination,
  getCombination,
  createCombination,
  updateCombination,
  uploadImage,
  extractImageId,
  getStockAvailable,
  updateStock,
  downloadPhotosZip,
};
