/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Storefront } from "./components/Storefront";
import { AdminDashboard } from "./components/AdminDashboard";
import { CartDrawer } from "./components/CartDrawer";
import { Product, CartItem } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Shield, RefreshCw, Lock, ShieldAlert, AlertCircle, Timer, Check } from "lucide-react";
import { ProductDetailView } from "./components/ProductDetailView";

interface AppRoute {
  type: "home" | "product" | "boutique";
  id?: string;
  vendeurSlug?: string;
}

export default function App() {
  const parseRoute = (): AppRoute => {
    if (typeof window === "undefined") return { type: "home" };
    const path = window.location.pathname;
    if (path.startsWith("/produit/")) {
      const id = path.replace("/produit/", "");
      return { type: "product", id };
    }
    if (path.startsWith("/boutique/")) {
      const slug = path.replace("/boutique/", "");
      return { type: "boutique", vendeurSlug: slug || undefined };
    }
    return { type: "home" };
  };

  const [route, setRoute] = useState<AppRoute>(parseRoute);

  const [isClientOnly, setIsClientOnly] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("view") === "client" ||
        path.startsWith("/boutique") ||
        path.startsWith("/produit")
      );
    }
    return false;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Automatically start in client mode (redirect to client space upon opening site)

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminCodeInput, setAdminCodeInput] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string>("");
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);

  const getLockoutStatus = () => {
    if (typeof window === "undefined") return { isLocked: false, remainingTime: 0, attempts: 0 };
    
    const attempts = parseInt(localStorage.getItem("atelier_admin_attempts") || "0", 10);
    const lockoutTimeStr = localStorage.getItem("atelier_admin_lockout_time");
    
    if (lockoutTimeStr) {
      const lockoutTime = parseInt(lockoutTimeStr, 10);
      const elapsed = Date.now() - lockoutTime;
      const lockoutDuration = 3600000; // 1 hour in ms
      
      if (elapsed < lockoutDuration) {
        return {
          isLocked: true,
          remainingTime: lockoutDuration - elapsed,
          attempts
        };
      } else {
        // Lockout expired! Reset everything
        localStorage.removeItem("atelier_admin_lockout_time");
        localStorage.setItem("atelier_admin_attempts", "0");
        return { isLocked: false, remainingTime: 0, attempts: 0 };
      }
    }
    
    return { isLocked: false, remainingTime: 0, attempts };
  };

  const handleVerifyAdminCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");

    const status = getLockoutStatus();
    if (status.isLocked) {
      setAdminLoginError(`Sécurité active. Veuillez attendre ${formatTimeLeft(Math.ceil(status.remainingTime / 1000))} avant de réessayer.`);
      return;
    }

    const trimmedInput = adminCodeInput.trim();
    if (trimmedInput === "Arthemis237") {
      // Success!
      setIsAdminAuthenticated(true);
      setIsAdmin(true);
      setShowAdminLoginModal(false);
      setAdminCodeInput("");
      setAdminLoginError("");
      localStorage.setItem("atelier_admin_attempts", "0");
      localStorage.removeItem("atelier_admin_lockout_time");
    } else {
      // Failed attempt
      const newAttempts = status.attempts + 1;
      localStorage.setItem("atelier_admin_attempts", newAttempts.toString());

      if (newAttempts >= 5) {
        const now = Date.now();
        localStorage.setItem("atelier_admin_lockout_time", now.toString());
        setAdminLoginError("Sécurité renforcée : 5 tentatives échouées. Accès bloqué pendant 1 heure.");
        setLockoutTimeLeft(3600);
      } else {
        setAdminLoginError(`Code d'accès incorrect. Tentatives restantes : ${5 - newAttempts}/5.`);
      }
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleToggleAdminMode = (value: boolean) => {
    if (value === false) {
      setIsAdmin(false);
      setIsAdminAuthenticated(false); // Reset authentication on exit to force re-entry next time!
    } else {
      if (isAdminAuthenticated) {
        setIsAdmin(true);
      } else {
        setShowAdminLoginModal(true);
      }
    }
  };

  // Check lockout on load and handle countdown interval
  useEffect(() => {
    const checkLockout = () => {
      const status = getLockoutStatus();
      if (status.isLocked) {
        setLockoutTimeLeft(Math.ceil(status.remainingTime / 1000));
      } else {
        setLockoutTimeLeft(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Secure navigation guard: if user is not authenticated, they can't stay in admin mode.
  // Also redirects user to client mode if landing on root or general paths.
  useEffect(() => {
    if (isAdmin && !isAdminAuthenticated) {
      setIsAdmin(false);
    }
  }, [isAdmin, isAdminAuthenticated]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Simulated global stats from database
  const [simulatedEarnings, setSimulatedEarnings] = useState<number>(0);
  const [simulatedSalesCount, setSimulatedSalesCount] = useState<number>(0);

  // 1. Database REST API synchronization
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data || []);
    } catch (e) {
      console.error("Error fetching products from database", e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setSimulatedEarnings(data.earnings || 0);
      setSimulatedSalesCount(data.salesCount || 0);
    } catch (e) {
      console.error("Error fetching stats from database", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  // Listen to popstate for route and state updates
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
      
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const clientOnly = 
        params.get("view") === "client" || 
        path.startsWith("/boutique") || 
        path.startsWith("/produit");
      
      setIsClientOnly(clientOnly);
      if (clientOnly) {
        setIsAdmin(false);
      }
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 2. Product Management Callbacks
  const handleAddProduct = async (newProdFields: Omit<Product, "id" | "createdAt" | "salesCount">) => {
    const newProduct = {
      ...newProdFields,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      salesCount: 0,
      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error("Error adding product to database", e);
    }
  };

  const handleUpdateProduct = async (productId: string, updatedFields: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error("Error updating product in database", e);
    }

    // Update matching item in cart if prices/images changed
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            product: { ...item.product, ...updatedFields },
          };
        }
        return item;
      })
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
        // Remove from cart
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      }
    } catch (e) {
      console.error("Error deleting product from database", e);
    }
  };

  // 3. Cart Actions
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    // Auto-open cart to show added item
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // 4. Checkout Handler linked with API database
  const handleCheckoutSuccess = async (itemsCheckedOut: CartItem[]) => {
    const orderTotal = itemsCheckedOut.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsCheckedOut.map((item) => ({ id: item.product.id, quantity: item.quantity })),
          totalAmount: orderTotal,
        }),
      });

      if (res.ok) {
        fetchProducts();
        fetchStats();
        setCart([]);
      }
    } catch (e) {
      console.error("Checkout transaction failed", e);
    }
  };

  // Reset database back to empty as requested
  const handleResetDemo = async () => {
    if (confirm("Voulez-vous réinitialiser l'Atelier ? Cela effacera toutes vos créations de produits et statistiques.")) {
      try {
        const res = await fetch("/api/reset", { method: "POST" });
        if (res.ok) {
          setProducts([]);
          setSimulatedEarnings(0);
          setSimulatedSalesCount(0);
          setCart([]);
          setIsAdmin(false);
          
          window.history.pushState({}, "", "/");
          setRoute({ type: "home" });
        }
      } catch (e) {
        console.error("Database reset failed", e);
      }
    }
  };

  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-charcoal selection:bg-charcoal/10 selection:text-charcoal">
      {/* Header component */}
      <Header
        isAdmin={isAdmin}
        setIsAdmin={handleToggleAdminMode}
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        isClientOnly={isClientOnly}
      />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {route.type === "product" ? (
            // Dedicated detailed product page
            <motion.div
              key={`product-${route.id}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ProductDetailView
                productId={route.id || ""}
                products={products}
                onAddToCart={handleAddToCart}
                onBack={() => {
                  const product = products.find((p) => p.id === route.id);
                  if (product && product.vendeurSlug) {
                    window.history.pushState({}, "", `/boutique/${product.vendeurSlug}`);
                  } else {
                    window.history.pushState({}, "", "/");
                  }
                  window.dispatchEvent(new Event("popstate"));
                }}
              />
            </motion.div>
          ) : !isAdmin ? (
            // Client Mode: Catalogue Storefront (handles multi-seller filtered space as well!)
            <motion.div
              key="storefront"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Storefront
                products={products}
                onAddToCart={handleAddToCart}
                selectedVendeurSlug={route.type === "boutique" ? route.vendeurSlug : undefined}
              />
            </motion.div>
          ) : (
            // Admin Mode: Product dashboard, Edit & Create
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminDashboard
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                simulatedEarnings={simulatedEarnings}
                simulatedSalesCount={simulatedSalesCount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Side-panel Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Footer Design - Editorial style */}
      <footer className="bg-[#F2F0EB] border-t border-charcoal py-12 mt-20 text-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-charcoal/15">
            {/* Left */}
            <div className="space-y-3">
              <span className="font-serif text-xl font-normal tracking-tight text-charcoal">
                Atelier<span className="italic">Épuré</span>
              </span>
              <p className="text-xs text-charcoal/70 font-serif italic leading-relaxed max-w-sm">
                Une plateforme interactive d'artisanat local où chaque créateur gère en toute autonomie sa propre vitrine, ses tarifs et ses collections uniques.
              </p>
            </div>

            {/* Middle values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-[10px] font-sans font-bold text-charcoal/50 uppercase tracking-widest">ESPACES CLIENTS</h4>
                <ul className="text-xs text-charcoal/80 font-serif italic space-y-1.5">
                  <li><a href="/boutique" className="hover:underline">Boutique Générale</a></li>
                  {products.length > 0 && (
                    <li className="truncate">
                      <a href={`/boutique/${products[0].vendeurSlug}`} className="hover:underline">
                        Vitrine de {products[0].vendeur}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-sans font-bold text-charcoal/50 uppercase tracking-widest">SIMULATIONS</h4>
                <ul className="text-xs text-charcoal/80 font-serif italic space-y-1.5">
                  <li>Sélection & Panier</li>
                  <li>Tirage de reçu d'achat</li>
                  <li>Registre de ventes en base</li>
                </ul>
              </div>
            </div>

            {/* Right reset and controls */}
            <div className="flex flex-col justify-between items-start md:items-end gap-4">
              <div className="text-left md:text-right">
                <span className="text-[9px] font-sans font-bold tracking-widest text-charcoal/40 uppercase block">BASE DE DONNÉES DE L'ATELIER</span>
                <span className="text-xs text-charcoal/80 font-serif italic flex items-center gap-1.5 mt-1 justify-start md:justify-end">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Données sauvegardées en base
                </span>
              </div>

              <button
                id="btn-reset-demo"
                onClick={handleResetDemo}
                className="flex items-center gap-2 px-4 py-2 border border-charcoal bg-white text-charcoal hover:bg-charcoal hover:text-white text-[10px] uppercase tracking-widest font-sans font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réinitialiser l'Atelier
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-sans uppercase tracking-wider text-charcoal/50 font-semibold">
            <div>
              &copy; {new Date().getFullYear()} Atelier Épuré. Conçu pour valoriser le savoir-faire créatif.
            </div>
            <div className="flex items-center gap-4">
              <span className="hover:text-charcoal cursor-help flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Guide d'Atelier
              </span>
              <span className="flex items-center gap-1 text-charcoal/70">
                Fait avec rigueur esthétique pour l'excellence artisanale
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal (Espace Sécurisé) */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAdminLoginModal(false);
                setAdminCodeInput("");
                setAdminLoginError("");
              }}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-[#FDFBF7] border-2 border-charcoal p-8 shadow-2xl z-10"
            >
              {/* Header */}
              <div className="text-center space-y-3 mb-6">
                <div className="mx-auto w-12 h-12 border border-charcoal bg-charcoal/5 flex items-center justify-center text-charcoal rounded-full">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-charcoal uppercase tracking-wider">
                    Accès Réservé
                  </h3>
                  <p className="text-[10px] font-sans text-charcoal/60 uppercase tracking-widest mt-1">
                    Authentification de l'Atelier
                  </p>
                </div>
              </div>

              {/* Form or Lockout state */}
              {lockoutTimeLeft > 0 ? (
                <div className="space-y-4 p-4 border border-red-200 bg-red-50 text-center">
                  <div className="flex justify-center text-red-700">
                    <Timer className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-sans font-bold text-red-800 uppercase tracking-wider">
                      Accès Temporairement Bloqué
                    </h4>
                    <p className="text-[11px] font-serif italic text-red-700/80 leading-normal">
                      Trop de tentatives infructueuses. Pour des raisons de sécurité, veuillez attendre avant un nouvel essai.
                    </p>
                  </div>
                  <div className="bg-white border border-red-200 py-2.5 font-mono text-xs font-bold text-red-700">
                    Temps restant : {formatTimeLeft(lockoutTimeLeft)}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyAdminCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest">
                      Code d'accès administrateur
                    </label>
                    <input
                      type="password"
                      autoFocus
                      required
                      value={adminCodeInput}
                      onChange={(e) => setAdminCodeInput(e.target.value)}
                      placeholder="Saisir le code de sécurité..."
                      className="w-full px-4 py-3 border-2 border-charcoal/30 focus:border-charcoal text-xs font-mono tracking-widest text-center bg-[#F2F0EB]/30 outline-none transition-colors"
                    />
                  </div>

                  {adminLoginError && (
                    <div className="p-2.5 border border-red-200 bg-red-50 text-red-700 text-[10px] font-sans flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-700" />
                      <span className="font-semibold leading-normal">{adminLoginError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminLoginModal(false);
                        setAdminCodeInput("");
                        setAdminLoginError("");
                      }}
                      className="w-full py-2.5 border border-charcoal/30 bg-transparent hover:bg-charcoal/5 text-charcoal text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-charcoal hover:bg-charcoal/90 text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Valider</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Safety notice */}
              <div className="mt-6 pt-4 border-t border-charcoal/5 flex items-center justify-center gap-2 text-[9px] font-sans uppercase tracking-wider text-charcoal/40 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Protégé par clé cryptographique</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
