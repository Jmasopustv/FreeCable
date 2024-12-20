export default async function handler(req, res) {
    const { endpoint, ...body } = req.body || {};
  
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }
  
    const shopifyUrl = `https://bp4kr5-7e.myshopify.com${endpoint}`;
    const shopifyToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  
    try {
      const response = await fetch(shopifyUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyToken,
        },
        body: req.method === 'POST' ? JSON.stringify(body) : undefined,
      });
  
      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
  
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error in Shopify proxy:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  