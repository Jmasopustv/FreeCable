Example Workflow

Customer Adds to Cart:

    Product data (fetched from Shopify) is displayed on your site.
    Cart functionality aggregates products and quantities.

Checkout:

    Collect customer shipping information.
    Send the cart details and shipping address to XShipper via the API.

Generate Label:

    XShipper returns a label URL, which can be used for shipping or provided to the customer.

Order Fulfillment:

    Use the label to ship the product.
    Optionally update the Shopify order with tracking information for the customer.
