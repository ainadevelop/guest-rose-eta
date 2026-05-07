const QRCode = require('qrcode');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = (req.query.data || '').toString().trim();
    if (!data) {
      return res.status(400).json({ error: 'data is required' });
    }

    const pngBuffer = await QRCode.toBuffer(data, {
      type: 'png',
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).send(pngBuffer);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'failed_to_generate_qr' });
  }
};
