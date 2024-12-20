import fetch from 'node-fetch';

export default async (req, res) => {
    const shopifyCartUrl = 'https://bp4kr5-7e.myshopify.com/cart/add.js';
    
    if (req.method === 'POST') {
        const response = await fetch(shopifyCartUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
