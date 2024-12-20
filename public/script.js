// Shopify Storefront API and Cart API endpoints
const shopifyApiProxyUrl = '/api/shopifyProxy'; // Proxy for Shopify Storefront and Cart APIs

// Show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Fetch all products using Shopify Storefront API
async function fetchProducts() {
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

    try {
        console.log('Fetching products from proxy...');
        const response = await fetch(shopifyApiProxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: '/graphql', query }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched products:', data);
        return data.data.products.edges.map(edge => edge.node);
    } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Failed to load products. Please try again later.', 'danger');
        return [];
    }
}

// Display products dynamically
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p>No products available at the moment.</p>';
        return;
    }

    products.forEach(product => {
        const variant = product.variants.edges[0]?.node;
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100 cursor-pointer" onclick="viewProduct('${product.handle}')">
                <img src="${product.images.edges[0]?.node.src}" class="card-img-top" alt="${product.title}">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>${variant?.price.amount || 'N/A'} ${variant?.price.currencyCode || ''}</strong></p>
                </div>
                <button class="btn btn-primary m-3" onclick="event.stopPropagation(); addToShopifyCart('${variant.id}', 1)">Add to Cart</button>
            </div>
        `;
        productList.appendChild(card);
    });
}

// Navigate to product details page
function viewProduct(productHandle) {
    localStorage.setItem('selectedProductHandle', productHandle);
    window.location.href = 'product.html';
}

// Add item to Shopify cart
async function addToShopifyCart(variantId, quantity = 1) {
    try {
        console.log(`Adding variant ${variantId} to cart...`);
        const response = await fetch(shopifyApiProxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/cart/add.js',
                data: { id: variantId, quantity },
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add item to cart: ${response.status} ${response.statusText}`);
        }

        const cart = await response.json();
        updateCartCount(cart.item_count);
        showNotification('Item added to cart.');
        console.log('Cart updated:', cart);
    } catch (error) {
        console.error('Error adding item to cart:', error);
        showNotification('Failed to add item to cart. Please try again later.', 'danger');
    }
}

// Fetch and display Shopify cart
async function displayShopifyCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    try {
        console.log('Fetching cart...');
        const response = await fetch(shopifyApiProxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: '/cart.js' }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
        }

        const cart = await response.json();
        console.log('Cart data:', cart);

        cartItemsContainer.innerHTML = '';
        if (!cart.items.length) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty. <a href="index.html">Continue shopping</a>.</p>';
            cartTotalElement.textContent = '0.00';
            return;
        }

        let total = 0;
        cart.items.forEach(item => {
            const itemTotal = item.quantity * (item.final_line_price / 100);
            total += itemTotal;
            const cartItem = `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                        <h5>${item.title}</h5>
                        <p>$${(item.price / 100).toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItem;
        });

        cartTotalElement.textContent = total.toFixed(2);
    } catch (error) {
        console.error('Error fetching cart:', error);
        showNotification('Failed to load cart. Please try again.', 'danger');
    }
}

// Update cart count in the header
function updateCartCount(count = 0) {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// Initialize the appropriate page
async function initialize() {
    if (window.location.pathname.includes('index.html')) {
        const products = await fetchProducts();
        displayProducts(products);
    } else if (window.location.pathname.includes('product.html')) {
        await initializeProductPage();
    } else if (window.location.pathname.includes('cart.html')) {
        await displayShopifyCart();
    }
}

initialize();
