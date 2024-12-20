// Shopify Storefront API and Cart API endpoints
const shopifyApiUrl = 'https://bp4kr5-7e.myshopify.com/api/2023-01/graphql.json';
const shopifyCartUrl = 'http://localhost:3000/proxy/cart/add';
const shopifyCartAddUrl = 'http://localhost:3000/proxy/cart';
const shopifyApiToken = '2738110aeaf2b2eddb120596562abca1'; // Replace with your token

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
        const response = await fetch(shopifyApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyApiToken,
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products from Shopify');
        }

        const data = await response.json();
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

// Fetch product details for the product page
async function fetchProductDetails(handle) {
    const query = `{
        product(handle: "${handle}") {
            id
            title
            description
            images(first: 3) {
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
    }`;

    try {
        const response = await fetch(shopifyApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyApiToken,
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const data = await response.json();
        return data.data.product;
    } catch (error) {
        console.error('Error fetching product details:', error);
        showNotification('Failed to load product details. Please try again later.', 'danger');
        return null;
    }
}

// Display product details on the product page
async function initializeProductPage() {
    const productHandle = localStorage.getItem('selectedProductHandle');
    const productDetailsContainer = document.getElementById('product-details');

    if (!productHandle) {
        productDetailsContainer.innerHTML = '<p>Product not found. Please return to the store.</p>';
        return;
    }

    const productData = await fetchProductDetails(productHandle);

    if (!productData) {
        productDetailsContainer.innerHTML = '<p>Error loading product details. Please try again later.</p>';
        return;
    }

    const variant = productData.variants.edges[0]?.node;
    productDetailsContainer.innerHTML = `
        <div class="col-md-6">
            <img src="${productData.images.edges[0]?.node.src}" alt="${productData.title}" class="img-fluid">
        </div>
        <div class="col-md-6">
            <h1>${productData.title}</h1>
            <p>${productData.description}</p>
            <p><strong>Price: ${variant?.price.amount || 'N/A'} ${variant?.price.currencyCode || ''}</strong></p>
            <label for="quantity">Quantity:</label>
            <input id="quantity" type="number" class="form-control w-25 mb-3" value="1" min="1">
            <button class="btn btn-primary" onclick="addToShopifyCart('${variant.id}', document.getElementById('quantity').value)">Add to Cart</button>
        </div>
    `;
}

// Add item to Shopify cart
async function addToShopifyCart(variantId, quantity = 1) {
    try {
        const response = await fetch('/api/shopifyProxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/cart/add.js', // Shopify endpoint
                id: variantId,
                quantity,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        const cart = await response.json();
        updateCartCount(cart.item_count);
        showNotification('Item added to cart.');
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
        const response = await fetch(shopifyCartUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        const cart = await response.json();
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
