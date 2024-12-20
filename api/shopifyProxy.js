export default async function handler(req, res) {
    const { endpoint, ...body } = req.body; // Shopify endpoint and body data
    const shopifyUrl = `https://bp4kr5-7e.myshopify.com${endpoint}`;

    try {
        const response = await fetch(shopifyUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
            },
            body: req.method === 'POST' ? JSON.stringify(body) : null,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying request to Shopify:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
