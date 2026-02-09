// ============================================
// EXPRESS SERVER
// Sirve el frontend y maneja el procesamiento
// ============================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const { processFiles } = require('./src/processor');
const { PRESTASHOP } = require('./src/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer para upload de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos .xlsx, .xls o .csv'));
    }
  },
});

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Process endpoint (SSE - Server-Sent Events for real-time progress)
app.post('/api/process',
  upload.fields([
    { name: 'mainFile', maxCount: 1 },
    { name: 'secondaryFile', maxCount: 1 },
  ]),
  async (req, res) => {
    // Validate files
    if (!req.files?.mainFile?.[0] || !req.files?.secondaryFile?.[0]) {
      return res.status(400).json({ error: 'Se necesitan los dos archivos Excel' });
    }

    // Override PrestaShop config from request
    const psUrl = req.body.psUrl;
    const psKey = req.body.psKey;

    if (psUrl) PRESTASHOP.url = psUrl.replace(/\/$/, '');
    if (psKey) PRESTASHOP.apiKey = psKey;

    if (!PRESTASHOP.apiKey) {
      return res.status(400).json({ error: 'Se necesita la API Key de PrestaShop' });
    }

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Track progress for stats
    let currentItem = 0;
    let totalItems = 0;
    const runningStats = { created: 0, combinations_updated: 0, images_uploaded: 0, errors: 0 };

    const onProgress = (message) => {
      sendEvent({ type: 'log', message });

      // Try to extract progress from message
      const progressMatch = message.match(/\[(\d+)\/(\d+)\]/);
      if (progressMatch) {
        currentItem = parseInt(progressMatch[1], 10);
        totalItems = parseInt(progressMatch[2], 10);
        sendEvent({ type: 'progress', current: currentItem, total: totalItems });
      }

      // Update running stats from keywords
      if (message.includes('Producto creado')) runningStats.created++;
      if (message.includes('actualizando precio')) runningStats.combinations_updated++;
      if (message.includes('imagen') && message.includes('subid')) runningStats.images_uploaded++;
      if (message.includes('Error') || message.includes('❌')) runningStats.errors++;

      sendEvent({ type: 'stats', ...runningStats });
    };

    try {
      const mainBuffer = req.files.mainFile[0].buffer;
      const secBuffer = req.files.secondaryFile[0].buffer;

      const results = await processFiles(mainBuffer, secBuffer, onProgress);

      sendEvent({ type: 'done', results });
    } catch (err) {
      sendEvent({ type: 'log', message: `❌ Error fatal del servidor: ${err.message}` });
      sendEvent({ type: 'done', results: { error: err.message } });
    }

    res.end();
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error de upload: ${err.message}` });
  }
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`
  =============================================
   PrestaShop Excel Processor
   Servidor iniciado en http://localhost:${PORT}
  =============================================
  `);
});
