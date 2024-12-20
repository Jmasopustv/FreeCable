const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { endpoint, id, quantity } = req.body;

  if (!endpoint || !id || !quantity) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const shopifyUrl = `https://bp4kr5-7e.myshopify.com${endpoint}`;
  const shopifyToken = 'YOUR_SHOPIFY_API_TOKEN'; // Replace with your token

  try {
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: JSON.stringify({ id, quantity }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in Shopify Proxy:', error);
    res.status(500).json({ error: 'Failed to connect to Shopify' });
  }
};
 