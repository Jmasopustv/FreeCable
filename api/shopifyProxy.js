const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { endpoint, query, data } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  const url = `https://bp4kr5-7e.myshopify.com${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': '2738110aeaf2b2eddb120596562abca1',
  };

  try {
    const shopifyResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, ...data }),
    });

    const shopifyData = await shopifyResponse.json();
    res.status(shopifyResponse.status).json(shopifyData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
