# Meta (Facebook) Product Catalog Integration Guide

This guide explains how to use the Meta Product Catalog feature in the Tiger Bhai admin panel.

## Overview

The Meta Product Catalog feature allows you to export your product data in a format that Meta (Facebook) can consume for Facebook Shops, Instagram Shopping, and other Meta commerce features.

## Features

- **Category-based filtering**: Export products by main category or specific subcategory
- **Multiple formats**: JSON and XML formats available
- **Slug-based URLs**: Clean, SEO-friendly URLs for products
- **Public endpoints**: Meta can directly access your catalog feeds
- **Admin management**: Full control from the admin panel

## Accessing the Meta Catalog

1. Log in to your admin panel
2. Navigate to **Meta Catalog** in the sidebar
3. Select categories and subcategories as needed
4. Generate and copy catalog URLs

## API Endpoints

### Public Endpoints (No Authentication Required)

These endpoints are designed for Meta to access directly:

#### JSON Format
```
GET /api/meta-catalog/public?category={categorySlug}&subcategory={subcategorySlug}
```

#### XML Format (Recommended for Meta)
```
GET /api/meta-catalog/public?format=xml&category={categorySlug}&subcategory={subcategorySlug}
```

### Admin Endpoints (Authentication Required)

#### Get Catalog Settings
```
GET /api/meta-catalog/settings
```

#### Get Product Count
```
POST /api/meta-catalog/settings
{
  "action": "get_products_count",
  "categorySlug": "electronics",
  "subcategorySlug": "smartphones"
}
```

## URL Parameters

- `category`: Main category slug (optional)
- `subcategory`: Subcategory slug (optional)
- `format`: Output format - "json" or "xml" (default: xml for public endpoint)

## Examples

### All Products
```
https://yourdomain.com/api/meta-catalog/public?format=xml
```

### Electronics Category Only
```
https://yourdomain.com/api/meta-catalog/public?format=xml&category=electronics
```

### Smartphones Subcategory
```
https://yourdomain.com/api/meta-catalog/public?format=xml&category=electronics&subcategory=smartphones
```

## Meta Integration Steps

1. **Access Meta Business Manager**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Navigate to your business account

2. **Create a Catalog**
   - Go to Commerce Manager
   - Click "Create Catalog"
   - Choose "E-commerce" as catalog type

3. **Add Data Source**
   - Select "Website" as upload method
   - Enter your XML feed URL (from the admin panel)
   - Configure update frequency (daily recommended)

4. **Configure Your Shop**
   - Set up Facebook Shop or Instagram Shopping
   - Connect your catalog to your shop
   - Customize your shop appearance

## XML Feed Format

The XML feed follows Google Shopping format with Meta-specific fields:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Tiger Bhai Product Catalog</title>
    <link>https://yourdomain.com</link>
    <description>Product catalog for Meta integration</description>
    
    <item>
      <g:id>product_id</g:id>
      <g:title>Product Name</g:title>
      <g:description>Product Description</g:description>
      <g:link>https://yourdomain.com/product/product-slug</g:link>
      <g:image_link>https://yourdomain.com/image.jpg</g:image_link>
      <g:brand>Tiger Bhai</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>999 INR</g:price>
      <g:sale_price>799 INR</g:sale_price>
      <g:google_product_category>Electronics > Mobile Phones</g:google_product_category>
    </item>
  </channel>
</rss>
```

## Admin Panel Features

### Main Meta Catalog Page
- Category and subcategory selection
- Real-time product count
- URL generation and copying
- Download options (JSON/XML)
- Integration instructions

### Category-Specific Pages
- Filter by subcategories
- View products in the category
- Generate category-specific URLs
- Export category products

### Subcategory-Specific Pages
- View all products in a subcategory
- Generate subcategory-specific URLs
- Detailed product listings
- Meta integration guide

## Troubleshooting

### Common Issues

1. **No products showing**
   - Check if products exist in the selected category
   - Ensure products are not soft-deleted
   - Verify category slugs are correct

2. **XML format errors**
   - Check for special characters in product names/descriptions
   - Ensure image URLs are accessible
   - Verify all required fields are populated

3. **Meta not accepting feed**
   - Ensure XML format is valid
   - Check that URLs are accessible publicly
   - Verify product data completeness

### Performance Considerations

- The public endpoints are cached for 1 hour
- Large catalogs may take time to generate
- Consider pagination for very large product sets

## Security Notes

- Public endpoints don't require authentication
- Admin endpoints require admin authentication
- Product data is sanitized for public consumption
- Sensitive information is excluded from public feeds

## Support

For issues or questions about the Meta Catalog integration:

1. Check the admin panel for error messages
2. Verify your product and category data
3. Test URLs in a browser before submitting to Meta
4. Check Meta Business Manager for feed processing errors

## Updates

The catalog automatically updates when:
- Products are added or modified
- Categories are updated
- Product variants are changed

Meta will fetch updates based on your configured schedule in Business Manager.
