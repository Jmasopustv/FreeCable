import fetch from 'node-fetch';

const shopifyApiUrl = 'https://bp4kr5-7e.myshopify.com/api/2023-01/graphql.json';
const shopifyApiToken = '2738110aeaf2b2eddb120596562abca1';

export default async (req, res) => {
    const query = `{
        products(first: 20) {
            edges {
                node {
                    id
                    handle
                    title
                    description
                    images(first: 1) {
                        edges {
                            node {
                                src
                            }
                        }
                    }
                    variants(first: 1) {
                        edges {
                            node {
                                id
                                price {
                                    amount
                                    currencyCode
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;

    const response = await fetch(shopifyApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyApiToken,
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json();
    res.status(response.status).json(data.data.products.edges.map(edge => edge.node));
};
