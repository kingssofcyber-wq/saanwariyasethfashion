# Demo catalogue — 30 products

These sample listings are seeded into MySQL by `npm run db:seed`. Names and photography are placeholders for testing; replace them with accurate product data and SKU-specific photos before accepting orders.

| # | Product | Category | Demo price | Demo MRP |
|---:|---|---|---:|---:|
| 1 | Royal Zari Silk Festive Saree | Sarees | ₹1,899 | ₹3,299 |
| 2 | Mauve Embroidered Suit Set | Suits & Sets | ₹1,499 | ₹2,499 |
| 3 | Classic Gold-Tone Statement Earrings | Jewellery | ₹599 | ₹999 |
| 4 | Minimal Rose Dial Watch | Watches | ₹1,299 | ₹2,199 |
| 5 | Structured Everyday Tote Bag | Bags | ₹1,099 | ₹1,799 |
| 6 | Ivory Embroidered Festive Juttis | Footwear | ₹799 | ₹1,399 |
| 7 | Linen Blend Casual Shirt | Men's Wear | ₹899 | ₹1,499 |
| 8 | Textured Cushion Cover Set of 2 | Home & Living | ₹499 | ₹899 |
| 9 | Pearl Layered Necklace | Jewellery | ₹749 | ₹1,199 |
| 10 | Midnight Classic Steel Watch | Watches | ₹1,599 | ₹2,699 |
| 11 | Everyday Printed Cotton Saree | Sarees | ₹999 | ₹1,699 |
| 12 | Pastel Kurta & Trouser Set | Suits & Sets | ₹1,199 | ₹1,999 |
| 13 | Ruby Woven Occasion Saree | Sarees | ₹2,199 | ₹3,799 |
| 14 | Midnight Floral Georgette Saree | Sarees | ₹1,399 | ₹2,299 |
| 15 | Sage Green Anarkali Suit Set | Suits & Sets | ₹1,799 | ₹2,999 |
| 16 | Ivory Straight Kurta Set | Suits & Sets | ₹1,099 | ₹1,899 |
| 17 | Kundan-Inspired Choker Set | Jewellery | ₹1,299 | ₹2,199 |
| 18 | Everyday Pearl Stud Earrings | Jewellery | ₹349 | ₹699 |
| 19 | Silver Mesh Minimal Watch | Watches | ₹1,499 | ₹2,499 |
| 20 | Heritage Brown Classic Watch | Watches | ₹1,799 | ₹2,899 |
| 21 | Quilted Mini Shoulder Bag | Bags | ₹899 | ₹1,599 |
| 22 | Weekend Canvas Backpack | Bags | ₹999 | ₹1,699 |
| 23 | Classic White Everyday Sneakers | Footwear | ₹1,199 | ₹1,999 |
| 24 | Neutral Block Heel Sandals | Footwear | ₹999 | ₹1,699 |
| 25 | Textured Casual Overshirt | Men's Wear | ₹1,199 | ₹1,999 |
| 26 | Classic Cotton Polo Shirt | Men's Wear | ₹699 | ₹1,199 |
| 27 | Sculpted Ceramic Table Vase | Home & Living | ₹649 | ₹1,099 |
| 28 | Soft Neutral Cushion Cover Set | Home & Living | ₹549 | ₹899 |
| 29 | Minimal Everyday Sunglasses | Accessories | ₹499 | ₹899 |
| 30 | Gold-Tone Layered Bracelet | Jewellery | ₹449 | ₹799 |


## Product gallery and category image note

Product detail pages display up to six thumbnails. If a product has an `images` JSON array in the existing Product.images field, those URLs are preferred; otherwise the gallery uses the main image and category/demo imagery. Suits, Kurtis, Lehengas and Ethnic Wear category cards use bundled local WebP images. Demo images are illustrative and should be replaced with exact photos for each live SKU.
