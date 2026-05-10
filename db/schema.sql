-- ============================================================
-- CredibleState Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- Then click "Run"
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ===========================================
-- DROP OLD TABLES (clean slate)
-- ===========================================
drop table if exists inquiries cascade;
drop table if exists properties cascade;

-- ===========================================
-- PROPERTIES TABLE
-- ===========================================
create table properties (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  description     text,
  property_type   text not null check (property_type in ('flat', 'villa', 'pg', 'plot', 'commercial')),
  listing_type    text not null check (listing_type in ('rent', 'sale')),
  price           numeric not null,
  area_sqft       integer,
  bedrooms        integer,
  bathrooms       integer,
  locality        text not null,
  city            text not null default 'Hyderabad',
  address         text,
  has_parking     boolean default false,
  is_gated        boolean default false,
  is_furnished    boolean default false,
  amenities       text[] default '{}',
  images          text[] default '{}',
  agent_name      text,
  phone           text,
  whatsapp        text,
  status          text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'rented', 'sold')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_properties_status   on properties(status);
create index if not exists idx_properties_locality on properties(locality);
create index if not exists idx_properties_listing  on properties(listing_type);
create index if not exists idx_properties_created  on properties(created_at desc);

-- ===========================================
-- INQUIRIES TABLE  (people interested in a property)
-- ===========================================
create table inquiries (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid references properties(id) on delete cascade,
  name         text not null,
  phone        text not null,
  email        text,
  message      text,
  created_at   timestamptz default now()
);

create index if not exists idx_inquiries_property on inquiries(property_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
alter table properties enable row level security;
alter table inquiries  enable row level security;

-- Anyone can read VERIFIED properties (public site)
drop policy if exists "Public can read verified properties" on properties;
create policy "Public can read verified properties"
  on properties for select
  using (status = 'verified');

-- Anyone can submit a property (status defaults to 'pending', you approve later)
drop policy if exists "Public can insert pending properties" on properties;
create policy "Public can insert pending properties"
  on properties for insert
  with check (status = 'pending');

-- Anyone can submit an inquiry
drop policy if exists "Public can insert inquiries" on inquiries;
create policy "Public can insert inquiries"
  on inquiries for insert
  with check (true);

-- ===========================================
-- SEED DATA — 12 realistic Hyderabad properties
-- ===========================================
insert into properties (slug, title, description, property_type, listing_type, price, area_sqft, bedrooms, bathrooms, locality, city, address, has_parking, is_gated, is_furnished, amenities, agent_name, phone, whatsapp, status) values

('2bhk-kondapur-furnished-18k', '2BHK Furnished Flat in Kondapur', 'Spacious 2BHK semi-furnished apartment in a gated community. Walking distance to Hitech City metro. Power backup, 24x7 security, kids play area, swimming pool. Ideal for IT professionals.', 'flat', 'rent', 18000, 1150, 2, 2, 'Kondapur', 'Hyderabad', 'Lanco Hills, Kondapur', true, true, true, ARRAY['Lift','Power Backup','24x7 Security','Swimming Pool','Gym','Kids Play Area'], 'Ramesh Kumar', '+919876543210', '+919876543210', 'verified'),

('3bhk-gachibowli-luxury-35k', 'Luxury 3BHK in Gachibowli', 'Premium 3BHK apartment with master bedroom, modular kitchen, italian marble flooring. Located in Aparna Sarovar Grande. Close to Wipro Circle, ISB, and DLF. Cab pickups easy.', 'flat', 'rent', 35000, 1850, 3, 3, 'Gachibowli', 'Hyderabad', 'Aparna Sarovar Grande, Gachibowli', true, true, true, ARRAY['Lift','Power Backup','Swimming Pool','Gym','Clubhouse','Garden','24x7 Security'], 'Priya Sharma', '+919876543211', '+919876543211', 'verified'),

('1bhk-madhapur-bachelor-12k', '1BHK for Bachelors in Madhapur', 'Cozy 1BHK perfect for working professionals. Fully furnished with bed, wardrobe, fridge, washing machine, geyser. Walking distance to Inorbit Mall and Hitech City.', 'flat', 'rent', 12000, 600, 1, 1, 'Madhapur', 'Hyderabad', 'Image Gardens Road, Madhapur', false, false, true, ARRAY['Lift','Power Backup','Furnished'], 'Ahmed Khan', '+919876543212', '+919876543212', 'verified'),

('villa-jubilee-hills-65l', '4BHK Villa in Jubilee Hills', 'Independent villa in prime Jubilee Hills location. Large terrace, private parking for 2 cars, Italian marble flooring throughout, modular kitchen with chimney. 24x7 water supply.', 'villa', 'sale', 65000000, 3200, 4, 5, 'Jubilee Hills', 'Hyderabad', 'Road No. 36, Jubilee Hills', true, true, false, ARRAY['Garden','Terrace','2 Car Parking','Borewell','Solar Water Heater'], 'Suresh Reddy', '+919876543213', '+919876543213', 'verified'),

('pg-ameerpet-girls-7500', 'Girls PG in Ameerpet', 'Safe and clean PG accommodation for working women and students. Triple sharing room with attached washroom. Includes meals (3 times/day), WiFi, laundry, daily housekeeping. CCTV surveillance.', 'pg', 'rent', 7500, null, null, 1, 'Ameerpet', 'Hyderabad', 'Behind Maitrivanam, Ameerpet', false, true, true, ARRAY['WiFi','Meals Included','Laundry','CCTV','Hot Water','AC'], 'Lakshmi Devi', '+919876543214', '+919876543214', 'verified'),

('2bhk-banjara-hills-25k', '2BHK Premium in Banjara Hills', 'Stunning 2BHK in heart of Banjara Hills. East facing, vastu compliant, premium fittings. Close to GVK One Mall, Apollo Hospital, top schools. Perfect family home.', 'flat', 'rent', 25000, 1400, 2, 2, 'Banjara Hills', 'Hyderabad', 'Road No. 12, Banjara Hills', true, true, false, ARRAY['Lift','Power Backup','24x7 Security','Visitor Parking','Vastu Compliant'], 'Vikram Singh', '+919876543215', '+919876543215', 'verified'),

('3bhk-financial-district-flat-1.2cr', '3BHK in Financial District', 'Brand new 3BHK in My Home Avatar. Luxury amenities, infinity pool, sky lounge, 5-star clubhouse. Walking distance to Microsoft, Amazon, Google offices. Investment grade property.', 'flat', 'sale', 12000000, 1750, 3, 3, 'Financial District', 'Hyderabad', 'My Home Avatar, Nanakramguda', true, true, false, ARRAY['Swimming Pool','Gym','Clubhouse','Sky Lounge','Garden','Cricket Net','24x7 Security'], 'Anjali Rao', '+919876543216', '+919876543216', 'verified'),

('2bhk-miyapur-affordable-15k', '2BHK Family Home in Miyapur', 'Affordable 2BHK on 3rd floor (lift available). Close to Miyapur metro station. Open kitchen, balcony with city view. Decent for small family or 2-3 bachelors. Pets allowed.', 'flat', 'rent', 15000, 1050, 2, 2, 'Miyapur', 'Hyderabad', 'Allwyn Colony, Miyapur', true, true, false, ARRAY['Lift','Power Backup','Pets Allowed','Balcony'], 'Mohan Babu', '+919876543217', '+919876543217', 'verified'),

('plot-shamshabad-90l', '300 sqyd Plot in Shamshabad', 'HMDA approved residential plot in upcoming gated community. Wide 40ft roads, 24x7 security, water supply, electricity. Near airport, ORR. Excellent investment with high appreciation.', 'plot', 'sale', 9000000, 2700, null, null, 'Shamshabad', 'Hyderabad', 'NH44, Shamshabad', false, true, false, ARRAY['Gated Community','Wide Roads','HMDA Approved','Compound Wall','Water Supply'], 'Ravi Teja', '+919876543218', '+919876543218', 'verified'),

('1bhk-secunderabad-couple-9500', '1BHK for Newly Married Couple', 'Cozy 1BHK near Paradise Circle, Secunderabad. Fully furnished including bed, sofa, fridge, washing machine, microwave. Bachelor restriction — only family or couples. Quiet locality.', 'flat', 'rent', 9500, 550, 1, 1, 'Secunderabad', 'Hyderabad', 'SP Road, Secunderabad', false, false, true, ARRAY['Furnished','Power Backup','Family Only'], 'Ali Hussain', '+919876543219', '+919876543219', 'verified'),

('shop-himayat-nagar-commercial-50k', 'Commercial Shop in Himayat Nagar', '500 sqft commercial shop on main road. Excellent footfall area, ideal for retail, cafe, salon, clinic. Glass front, white tiles flooring, separate washroom. 3 phase electricity.', 'commercial', 'rent', 50000, 500, null, 1, 'Himayat Nagar', 'Hyderabad', 'Main Road, Himayat Nagar', false, false, false, ARRAY['Main Road','Glass Front','3 Phase Power','Washroom'], 'Naresh Goud', '+919876543220', '+919876543220', 'verified'),

('villa-tellapur-gated-1.8cr', '3BHK Villa in Tellapur', 'Independent villa in My Home Bhooja, gated community. East facing, private garden, double height living room, modular kitchen, premium fittings. Near outer ring road exit.', 'villa', 'sale', 18000000, 2400, 3, 4, 'Tellapur', 'Hyderabad', 'My Home Bhooja, Tellapur', true, true, false, ARRAY['Garden','Clubhouse','Swimming Pool','Gym','24x7 Security','Children Park'], 'Deepa Reddy', '+919876543221', '+919876543221', 'verified');
