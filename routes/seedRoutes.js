const express = require('express');
const router = express.Router();
const Product = require('../model/Modelschema');

const seedProducts = [
    {
        productname: "Royal Gold Silk Embroidery Thread",
        productdescription: "Premium quality 100% pure silk thread with high sheen. Perfect for intricate embroidery work on wedding dresses and luxury garments. 500m spool.",
        price: 12.99,
        stock: 50,
        category: "Threads",
        material: "Silk",
        colors: ["Gold", "Silver", "Bronze"],
        sizes: ["500m"],
        ImageURL: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=2600&auto=format&fit=crop"
    },
    {
        productname: "Midnight Blue Satin Lining",
        productdescription: "Smooth, lustrous satin lining fabric. Anti-static finish. Adds structure and comfort to tailored jackets and dresses. Sold per meter.",
        price: 8.50,
        stock: 200,
        category: "Linings",
        material: "Satin",
        colors: ["Midnight Blue", "Black", "Champagne"],
        sizes: ["1m", "5m"],
        ImageURL: "https://images.unsplash.com/photo-1548142723-aae7678afa53?q=80&w=2000&auto=format&fit=crop"
    },
    {
        productname: "Professional Tailoring Shears",
        productdescription: "Ergonomic 9-inch tailoring scissors. Japanese stainless steel blades for precise cutting of heavy fabrics and delicate silks.",
        price: 45.00,
        stock: 15,
        category: "Accessories",
        material: "Stainless Steel",
        colors: ["Gold/Black"],
        sizes: ["9 inch"],
        ImageURL: "https://images.unsplash.com/photo-1598300056393-8dd1a56113b2?q=80&w=2000&auto=format&fit=crop"
    },
    {
        productname: "Vintage Gutermann Thread Set",
        productdescription: "Curated set of 20 polyester sewing threads in essential colors. High tensile strength, suitable for all fabric types.",
        price: 35.99,
        stock: 30,
        category: "Threads",
        material: "Polyester",
        colors: ["Assorted"],
        sizes: ["100m spools"],
        ImageURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2000&auto=format&fit=crop"
    },
    {
        productname: "Ivory Cotton Voile Lining",
        productdescription: "Lightweight, breathable 100% cotton voile. Ideal lining for summer dresses and children's wear. Soft drape.",
        price: 6.99,
        stock: 150,
        category: "Linings",
        material: "Cotton",
        colors: ["Ivory", "White", "Blush"],
        sizes: ["1m"],
        ImageURL: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=2000&auto=format&fit=crop"
    },
    {
        productname: "Velvet Evening Gown Fabric",
        productdescription: "Luxurious crushed velvet in deep emerald. 4-way stretch. perfect for evening wear and winter tailoring.",
        price: 22.99,
        stock: 40,
        category: "Fabrics",
        material: "Velvet",
        colors: ["Emerald", "Burgundy", "Navy"],
        sizes: ["1m"],
        ImageURL: "https://images.unsplash.com/photo-1612459792197-e73f57e05fc9?q=80&w=2000&auto=format&fit=crop"
    }
];

router.get('/seed', async (req, res) => {
    try {
        await Product.deleteMany({}); // Clear existing
        await Product.insertMany(seedProducts);
        res.json({ message: "Database seeded with Tailoring Products", count: seedProducts.length });
    } catch (err) {
        console.error(err);
        res.status(500).send("Seeding failed");
    }
});

module.exports = router;
