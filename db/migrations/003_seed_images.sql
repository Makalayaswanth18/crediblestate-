-- ============================================================
-- Migration 003 — Add real photos to seed listings
-- Uses high-quality Unsplash photos so the site looks professional
-- before agents upload real photos.
-- Run in Supabase SQL Editor.
-- ============================================================

-- Flats / apartments
update properties set images = array[
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
  'https://images.unsplash.com/photo-1556909190-eccf4a8bf97a?w=1200&q=80'
] where slug = '2bhk-kondapur-furnished-18k';

update properties set images = array[
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80'
] where slug = '3bhk-gachibowli-luxury-35k';

update properties set images = array[
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'
] where slug = '1bhk-madhapur-bachelor-12k';

update properties set images = array[
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  'https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80'
] where slug = '2bhk-banjara-hills-25k';

update properties set images = array[
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200&q=80'
] where slug = '3bhk-financial-district-flat-1.2cr';

update properties set images = array[
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80'
] where slug = '2bhk-miyapur-affordable-15k';

update properties set images = array[
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80'
] where slug = '1bhk-secunderabad-couple-9500';

-- Villas
update properties set images = array[
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'
] where slug = 'villa-jubilee-hills-65l';

update properties set images = array[
  'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fe6ba75?w=1200&q=80'
] where slug = 'villa-tellapur-gated-1.8cr';

-- PG
update properties set images = array[
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=80',
  'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1200&q=80'
] where slug = 'pg-ameerpet-girls-7500';

-- Plot
update properties set images = array[
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&q=80'
] where slug = 'plot-shamshabad-90l';

-- Commercial
update properties set images = array[
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80'
] where slug = 'shop-himayat-nagar-commercial-50k';
