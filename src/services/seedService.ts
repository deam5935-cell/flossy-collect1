import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SAMPLE_PRODUCTS = [
  {
    name: "Midnight Silk Evening Gown",
    price: 3200,
    category: "Women",
    gender: "Women",
    description: "An exquisite piece crafted from 100% pure Italian silk. This midnight blue gown features a hand-draped bodice and a subtle side slit for a silhouette that commands attention at any gala.",
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800"],
    stock: 5,
    isFeatured: true,
    specs: {
      material: "100% Mulberry Silk",
      origin: "Handmade in Milan",
      care: "Professional Dry Clean Only",
      fit: "True to size, floor-length"
    }
  },
  {
    name: "Architectural Cashmere Blazer",
    price: 1850,
    category: "Men",
    gender: "Men",
    description: "Redefining modern tailoring. This blazer is meticulously structured from heavy-weight Mongolian cashmere, featuring sharp lapels and a hidden button placket for a minimalist aesthetic.",
    images: ["https://images.unsplash.com/photo-1594932224528-760c316b307b?auto=format&fit=crop&q=80&w=800"],
    stock: 8,
    isFeatured: true,
    specs: {
      material: "95% Cashmere, 5% Virgin Wool",
      origin: "Tailored in London",
      care: "Steam clean only",
      fit: "Structured slim fit"
    }
  },
  {
    name: "24K Gold 'Unity' Cuff",
    price: 4500,
    category: "Accessories",
    gender: "Unisex",
    description: "A statement of timeless elegance. This handcrafted cuff is forged from solid 24K gold, featuring intricate African geometric patterns that symbolize eternal connection.",
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"],
    stock: 3,
    isFeatured: true,
    specs: {
      material: "Solid 24K Yellow Gold",
      origin: "Artisanally crafted in Accra",
      weight: "48g",
      adjustable: "No"
    }
  },
  {
    name: "Onyx Horizon Sunglasses",
    price: 450,
    category: "Accessories",
    gender: "Unisex",
    description: "Protect your vision with style. These oversized frames are carved from premium black acetate with polarized gradient lenses and gold-tone hardware accents.",
    images: ["https://images.unsplash.com/photo-1511499767390-a8a1931b3c74?auto=format&fit=crop&q=80&w=800"],
    stock: 15,
    isFeatured: false,
    specs: {
      material: "Eco-Acetate",
      lenses: "UVA/UVB 400 Protection",
      hardware: "Gold-plated Titanium",
      case: "Include leather hardshell"
    }
  },
  {
    name: "Imperial Oud Parfum",
    price: 980,
    category: "Beauty",
    gender: "Unisex",
    description: "The essence of luxury. A profound blend of aged Agarwood, Damascus Rose, and Saffron. A scent that lingers for 24 hours, evolving into a warm skin-scent of amber and musk.",
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"],
    stock: 12,
    isFeatured: true,
    specs: {
      volume: "100ml / 3.4 fl oz",
      concentration: "Extrait de Parfum",
      top_notes: "Saffron, Cardamom",
      base_notes: "Oud, Amber, Sandalwood"
    }
  },
  {
    name: "Sculpted Nappa Leather Boots",
    price: 1200,
    category: "Footwear",
    gender: "Women",
    description: "Walk with confidence. These ankle boots feature a unique architectural heel and are crafted from the softest Nappa leather that molds to your foot's shape.",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800"],
    stock: 10,
    isFeatured: false,
    specs: {
      material: "Italian Nappa Leather",
      sole: "Stacked Leather",
      heel_height: "85mm",
      closure: "Side zip"
    }
  }
];

export async function seedProducts() {
  const productsCol = collection(db, 'products');
  
  // Basic check to see if we already have many products
  const q = query(productsCol, limit(1));
  const snap = await getDocs(q);
  
  if (snap.size > 0 && !window.confirm("Products already exist. Do you want to add sample products anyway?")) {
    return;
  }

  console.log("Seeding started...");
  for (const productData of SAMPLE_PRODUCTS) {
    try {
      await addDoc(productsCol, {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added: ${productData.name}`);
    } catch (err) {
      console.error(`Failed to add ${productData.name}:`, err);
    }
  }
  console.log("Seeding completed.");
  alert("Product catalog successfully seeded with sample pieces.");
}
