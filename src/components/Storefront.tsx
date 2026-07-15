/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, SlidersHorizontal, Eye, Plus, ShoppingBag, Star, X, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import { STORES_CATEGORIES } from "../data";

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedVendeurSlug?: string;
}

export const Storefront: React.FC<StorefrontProps> = ({ products, onAddToCart, selectedVendeurSlug }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Custom banner customization states
  const [customBannerSubtitle, setCustomBannerSubtitle] = useState<string>("ÉDITION LIMITÉE & PIÈCES UNIQUES");
  const [customBannerTitle, setCustomBannerTitle] = useState<string>("La beauté du grès brute et des matières nobles.");
  const [customBannerDesc, setCustomBannerDesc] = useState<string>(
    `"Une esthétique forgée dans le calme de l'atelier, où l'imperfection devient signature." Découvrez nos créations locales et artisanales.`
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSubtitle = localStorage.getItem("client_banner_subtitle");
      const savedTitle = localStorage.getItem("client_banner_title");
      const savedDesc = localStorage.getItem("client_banner_desc");

      if (savedSubtitle) setCustomBannerSubtitle(savedSubtitle);
      if (savedTitle) setCustomBannerTitle(savedTitle);
      if (savedDesc) setCustomBannerDesc(savedDesc);
    }
  }, []);

  // Get active seller name
  const sellerName = products.find((p) => p.vendeurSlug === selectedVendeurSlug)?.vendeur || "Artisan";

  // Filter products by seller first if in individual seller space
  const sellerProducts = selectedVendeurSlug
    ? products.filter((p) => p.vendeurSlug === selectedVendeurSlug)
    : products;

  // Filters and searches
  const filteredProducts = sellerProducts
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "Tous" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.vendeur && product.vendeur.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // Default/Latest
    });

  return (
    <div className="space-y-12 py-4">
      {/* Editorial Hero Banner */}
      {selectedVendeurSlug ? (
        <div className="relative border border-charcoal bg-[#F2F0EB] text-charcoal py-16 px-8 sm:px-16 flex flex-col justify-center min-h-[280px]">
          {/* Subtle decorative background graphic overlay */}
          <div className="absolute top-6 right-8 text-[120px] font-serif italic text-charcoal/5 select-none pointer-events-none hidden md:block">
            Artisan
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-sans text-charcoal/60 font-bold border-b border-charcoal/30 pb-1">
              BOUTIQUE EXCLUSIVE
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight leading-tight text-charcoal">
              La collection de <br />
              <span className="italic">{sellerName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/80 font-serif leading-relaxed italic max-w-lg">
              Découvrez la vitrine personnelle de {sellerName}. Toutes les créations ci-dessous ont été conçues et tarifées de manière indépendante.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border border-charcoal bg-[#F2F0EB] text-charcoal py-16 px-8 sm:px-16 flex flex-col justify-center min-h-[280px]">
          {/* Subtle decorative background graphic overlay */}
          <div className="absolute top-6 right-8 text-[120px] font-serif italic text-charcoal/5 select-none pointer-events-none hidden md:block">
            Atelier
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-sans text-charcoal/60 font-bold border-b border-charcoal/30 pb-1">
              {customBannerSubtitle}
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight leading-tight text-charcoal whitespace-pre-line">
              {customBannerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/80 font-serif leading-relaxed italic max-w-lg">
              {customBannerDesc}
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar - Editorial layout with sharp borders */}
      <div className="border border-charcoal p-6 space-y-5 bg-white">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/60" />
            <input
              id="storefront-search"
              type="text"
              placeholder="RECHERCHER UNE PIÈCE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-charcoal/30 focus:border-charcoal text-xs font-sans tracking-wider uppercase bg-transparent outline-none transition-colors"
            />
          </div>

          {/* Sort Filter Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal/70" />
            <span className="text-[10px] uppercase tracking-wider text-charcoal/60 font-semibold font-sans whitespace-nowrap">Trier par:</span>
            <select
              id="storefront-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-charcoal text-xs font-sans tracking-wider uppercase bg-white outline-none cursor-pointer"
            >
              <option value="default">Par défaut</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
              <option value="name">Nom : A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pill Buttons - Sharp Editorial styles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none border-t border-charcoal/10 pt-4">
          <button
            id="cat-all"
            onClick={() => setSelectedCategory("Tous")}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-sans font-bold transition-all whitespace-nowrap ${
              selectedCategory === "Tous"
                ? "bg-charcoal text-white"
                : "border border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-[#F2F0EB]"
            }`}
          >
            Tous les produits
          </button>
          {STORES_CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              id={`cat-${i}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-sans font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-charcoal text-white"
                  : "border border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-[#F2F0EB]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid with sharp borders */}
      {products.length === 0 ? (
        <div className="text-center py-16 px-6 border border-dashed border-charcoal bg-[#F2F0EB]/30 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 border border-charcoal rounded-full flex items-center justify-center text-charcoal mx-auto bg-white">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-serif text-charcoal">L'Atelier est un écran vierge</h3>
          <p className="text-xs text-charcoal/70 leading-relaxed font-serif italic">
            "Chaque grand projet commence par une table de travail nue." <br />
            Il n'y a actuellement aucun produit exposé sur le site.
          </p>
          <div className="pt-2">
            <p className="text-[10px] font-sans font-bold tracking-[0.15em] text-charcoal/80 uppercase">
              Pour commencer :
            </p>
            <p className="text-xs text-charcoal/60 font-sans mt-1">
              Activez le mode <strong className="text-charcoal font-semibold">Administrateur</strong> en haut à droite pour importer vos pièces artisanales uniques et leurs images depuis votre appareil.
            </p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-charcoal/30 bg-[#F2F0EB]/30">
          <ShoppingBag className="w-10 h-10 text-charcoal/40 mx-auto mb-4" />
          <h3 className="text-lg font-serif italic text-charcoal">Aucune pièce disponible</h3>
          <p className="text-xs text-charcoal/60 mt-1 max-w-xs mx-auto font-sans uppercase tracking-wider">
            Aucun article correspondant à vos filtres actuels.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col bg-white overflow-hidden border border-charcoal hover:shadow-lg transition-all duration-300 relative"
              >
                {/* Product Image Area */}
                <div 
                  onClick={() => {
                    window.history.pushState({}, "", `/produit/${product.id}`);
                    window.dispatchEvent(new Event("popstate"));
                  }}
                  className="relative aspect-[3/4] bg-[#F2F0EB] overflow-hidden border-b border-charcoal cursor-pointer"
                  title={`Voir la page détaillée de ${product.name}`}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category label */}
                  <span className="absolute top-4 left-4 bg-white text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-charcoal px-3 py-1 border border-charcoal">
                    {product.category}
                  </span>

                  {/* Actions Hover Overlays */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 justify-end animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`btn-share-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const shareUrl = `${window.location.origin}/produit/${product.id}`;
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            text: `Découvrez "${product.name}" sur l'Atelier Épuré`,
                            url: shareUrl,
                          }).catch(err => console.log("Share failed", err));
                        } else {
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            setCopiedProductId(product.id);
                            setTimeout(() => setCopiedProductId(null), 2000);
                          });
                        }
                      }}
                      className="p-2 bg-white hover:bg-charcoal hover:text-white text-charcoal border border-charcoal transition-all cursor-pointer flex items-center justify-center"
                      title={copiedProductId === product.id ? "Lien copié !" : "Copier le lien de partage"}
                    >
                      {copiedProductId === product.id ? (
                        <Check className="w-4 h-4 text-green-700" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      id={`btn-quickview-${product.id}`}
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 bg-white hover:bg-charcoal hover:text-white text-charcoal border border-charcoal transition-colors cursor-pointer"
                      title="Aperçu rapide"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-add-cart-hover-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white text-[10px] uppercase tracking-widest font-sans font-bold hover:bg-white hover:text-charcoal border border-charcoal transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>

                {/* Product Details info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-charcoal">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 fill-current ${
                              i < Math.floor(product.rating || 4.7) ? "opacity-100" : "opacity-20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-charcoal/60">
                        ({product.rating || 4.7})
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => {
                        window.history.pushState({}, "", `/produit/${product.id}`);
                        window.dispatchEvent(new Event("popstate"));
                      }}
                      className="font-serif font-normal text-charcoal text-xl mb-1 hover:italic transition-all cursor-pointer hover:text-charcoal/80"
                      title={`Voir la page détaillée de ${product.name}`}
                    >
                      {product.name}
                    </h3>

                    {/* Seller label */}
                    <p className="text-[10px] font-sans tracking-wide text-charcoal/50 mb-3 font-semibold uppercase">
                      Artisan : <span className="text-charcoal font-bold">{product.vendeur || "Atelier Épuré"}</span>
                    </p>

                    {/* Shortened description */}
                    <p className="text-xs text-charcoal/70 font-serif leading-relaxed line-clamp-3 mb-6">
                      {product.description}
                    </p>
                  </div>

                  {/* Bottom details price & add button */}
                  <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                    <div className="font-sans text-sm font-bold tracking-wider text-charcoal">
                      {product.price.toFixed(2)} €
                    </div>

                    <button
                      id={`btn-add-cart-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="px-4 py-2 bg-charcoal text-white text-[10px] uppercase tracking-widest font-sans font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
                    >
                      <span>Acheter</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Product Detail Modal (Aperçu Rapide) with Editorial elements */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#FDFBF7] border border-charcoal overflow-hidden max-w-2xl w-full shadow-2xl relative z-10 flex flex-col md:flex-row"
            >
              <button
                id="modal-close"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-charcoal hover:text-white border border-charcoal text-charcoal transition-colors z-20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product Image left */}
              <div className="w-full md:w-1/2 aspect-[4/5] bg-[#F2F0EB] relative border-b md:border-b-0 md:border-r border-charcoal">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-white text-[9px] font-sans font-bold uppercase tracking-wider text-charcoal px-3 py-1 border border-charcoal">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Details right */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-charcoal">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 fill-current ${
                            i < Math.floor(selectedProduct.rating || 4.7) ? "opacity-100" : "opacity-25"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-charcoal/60">
                      {selectedProduct.rating || 4.7} / 5.0
                    </span>
                  </div>

                  <h3 className="font-serif font-normal text-charcoal text-2xl sm:text-3xl leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <div className="font-sans text-xl font-bold tracking-wider text-charcoal border-b border-charcoal/10 pb-4">
                    {selectedProduct.price.toFixed(2)} €
                  </div>

                  <div className="pt-2">
                    <h4 className="text-[9px] font-sans font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">
                      La confection de la pièce
                    </h4>
                    <p className="text-sm text-charcoal/80 font-serif italic leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-charcoal/10 mt-8 space-y-3">
                  <button
                    id="modal-add-cart"
                    onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full py-3 bg-charcoal text-white font-sans text-xs uppercase tracking-widest font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
                  >
                    <span>Ajouter à votre Sélection</span>
                  </button>

                  <button
                    id="modal-share"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/produit/${selectedProduct.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: selectedProduct.name,
                          text: `Découvrez "${selectedProduct.name}" sur l'Atelier Épuré`,
                          url: shareUrl,
                        }).catch(err => console.log("Share failed", err));
                      } else {
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          setCopiedProductId(selectedProduct.id);
                          setTimeout(() => setCopiedProductId(null), 2000);
                        });
                      }
                    }}
                    className="w-full py-2.5 border border-charcoal/30 bg-[#F2F0EB]/50 hover:bg-charcoal hover:text-white text-charcoal text-[10px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedProductId === selectedProduct.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-700" />
                        <span className="text-green-700 font-bold">Lien copié !</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Partager ce produit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
