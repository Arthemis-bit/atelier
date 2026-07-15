import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "database.json");

// Ensure database file exists with empty products list by default
function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ products: [], stats: { earnings: 0, salesCount: 0 } }, null, 2),
      "utf-8"
    );
  }
}

initDb();

function readDb() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { products: [], stats: { earnings: 0, salesCount: 0 } };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

app.use(express.json({ limit: "50mb" })); // Handle larger images in base64 format

// API: Get products
app.get("/api/products", (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

// API: Get stats
app.get("/api/stats", (req, res) => {
  const db = readDb();
  res.json(db.stats || { earnings: 0, salesCount: 0 });
});

// API: Add product
app.post("/api/products", (req, res) => {
  const db = readDb();
  const newProduct = req.body;
  
  newProduct.createdAt = newProduct.createdAt || new Date().toISOString();
  newProduct.salesCount = newProduct.salesCount || 0;
  newProduct.rating = newProduct.rating || 5.0;
  
  // Sanitize seller name for slug
  const sellerName = newProduct.vendeur || "Atelier Épuré";
  const sellerSlug = sellerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, ""); // trim dashes
    
  newProduct.vendeur = sellerName;
  newProduct.vendeurSlug = sellerSlug || "general";

  db.products = db.products || [];
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

// API: Update product
app.put("/api/products/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const updatedProduct = req.body;
  
  db.products = db.products || [];
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    const sellerName = updatedProduct.vendeur || "Atelier Épuré";
    const sellerSlug = sellerName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
      
    updatedProduct.vendeur = sellerName;
    updatedProduct.vendeurSlug = sellerSlug || "general";
    
    db.products[index] = { ...db.products[index], ...updatedProduct };
    writeDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// API: Delete product
app.delete("/api/products/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  
  db.products = db.products || [];
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    const deleted = db.products.splice(index, 1);
    writeDb(db);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// API: Checkout
app.post("/api/checkout", (req, res) => {
  const db = readDb();
  const { items, totalAmount } = req.body; // items: [{ id, quantity }]
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid items" });
  }

  db.products = db.products || [];
  // Update sales count for each product
  items.forEach((item: any) => {
    const product = db.products.find((p: any) => p.id === item.id);
    if (product) {
      product.salesCount = (product.salesCount || 0) + item.quantity;
    }
  });

  // Update stats
  db.stats = db.stats || { earnings: 0, salesCount: 0 };
  db.stats.earnings = (db.stats.earnings || 0) + totalAmount;
  db.stats.salesCount = (db.stats.salesCount || 0) + items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  writeDb(db);
  res.json({ success: true, stats: db.stats });
});

// API: Reset database
app.post("/api/reset", (req, res) => {
  const db = {
    products: [],
    stats: {
      earnings: 0,
      salesCount: 0
    }
  };
  writeDb(db);
  res.json({ success: true });
});

// Serve Vite or Static build
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
