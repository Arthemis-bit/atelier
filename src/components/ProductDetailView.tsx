import React, { useState } from "react";
import { ArrowLeft, Star, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, Share2, MessageSquare } from "lucide-react";
import { Product } from "../types";
import { motion, AnimatePresence } from "motion/react";

const getWhatsAppLink = (number: string, text: string) => {
  const cleanNumber = number.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

const getActiveSellerWhatsapp = (): string => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("atelier_seller_account");
      if (saved) {
        const account = JSON.parse(saved);
        if (account && account.whatsapp) {
          return account.whatsapp;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  return "+237693573891"; // Default Cameroon number requested by user
};

interface ProductDetailViewProps {
  productId: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBack: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  products,
  onAddToCart,
  onBack,
}) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4 max-w-md mx-auto">
        <h3 className="text-2xl font-serif text-charcoal">Pièce Introuvable</h3>
        <p className="text-sm text-charcoal/70 font-serif italic leading-relaxed">
          Cette création n'existe pas ou a été retirée du catalogue par l'artisan.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 border border-charcoal bg-charcoal text-white text-[10px] uppercase tracking-widest font-bold font-sans hover:bg-white hover:text-charcoal transition-all cursor-pointer"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const handleShareProduct = async () => {
    const shareUrl = `${window.location.origin}/produit/${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Découvrez "${product.name}" sur l'Atelier Épuré`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if cancelled or not supported
        console.log("Navigator share failed, using fallback copy", err);
      }
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleInstantBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName.trim() || !orderEmail.trim()) {
      alert("Veuillez remplir vos informations de livraison.");
      return;
    }

    // Process instant simulation order
    setOrderSuccess(true);
    
    // Add product to cart first or directly checkout with this single product
    const orderTotal = product.price;
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: product.id, quantity: 1 }],
        totalAmount: orderTotal,
      }),
    }).then(() => {
      // Refresh global products data in the app in the background if possible, but let the user know
    });
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderSuccess(false);
    setOrderName("");
    setOrderEmail("");
  };

  return (
    <div className="space-y-8 py-4">
      {/* Back navigation & Artisan Space Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-charcoal/10 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 group text-xs font-sans font-bold uppercase tracking-wider text-charcoal hover:opacity-75 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Retour aux collections</span>
        </button>

        {product.vendeur && (
          <div className="text-xs font-serif italic text-charcoal/80 flex items-center gap-2">
            Création originale par :
            <a
              href={`/boutique/${product.vendeurSlug}`}
              className="font-sans font-bold uppercase tracking-wider text-charcoal hover:underline not-italic"
            >
              {product.vendeur} &rarr;
            </a>
          </div>
        )}
      </div>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 bg-white border border-charcoal p-8 sm:p-12">
        {/* Left column: Large high-res image */}
        <div className="md:col-span-6 space-y-4">
          <div className="aspect-[3/4] bg-[#F2F0EB] border border-charcoal relative overflow-hidden group">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-4 left-4 bg-white text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-charcoal px-3 py-1 border border-charcoal">
              {product.category}
            </span>
          </div>
          <p className="text-[10px] text-charcoal/40 font-mono uppercase text-center tracking-widest">
            RÉFÉRENCE PIÈCE : {product.id}
          </p>
        </div>

        {/* Right column: Editorial description & purchase action buttons */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Seller and category header */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-charcoal/50">
                <span>{product.category}</span>
                <span>•</span>
                <span className="text-charcoal font-bold bg-[#F2F0EB] px-2 py-0.5 border border-charcoal/15">{product.vendeur || "Atelier Épuré"}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-charcoal leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Badge */}
            <div className="py-4 border-t border-b border-charcoal/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-charcoal/40 font-sans uppercase tracking-widest block font-bold mb-1">PRIX EXPOSÉ</span>
                <span className="font-sans text-2xl font-extrabold text-charcoal">
                  {product.price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              
              {/* Popularity indicator */}
              <div className="text-right">
                <span className="text-[9px] text-charcoal/40 font-sans uppercase tracking-widest block font-bold mb-1">POPULARITÉ</span>
                <span className="font-serif text-xs text-charcoal/80 italic">
                  Acquise {product.salesCount || 0} fois par nos visiteurs
                </span>
              </div>
            </div>

            {/* Stars rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-charcoal">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 fill-current ${
                      i < Math.floor(product.rating || 4.7) ? "opacity-100" : "opacity-20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-charcoal/60 font-bold">
                {product.rating || 4.7} / 5.0 (Avis clients de l'atelier)
              </span>
            </div>

            {/* Detailed Description */}
            <div className="space-y-3">
              <span className="text-[9px] text-charcoal/40 font-sans uppercase tracking-widest block font-bold">HISTOIRE & COMPOSITION DE L'ARTICLE</span>
              <p className="text-sm text-charcoal/80 font-serif leading-relaxed italic whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Checkout & Purchase buttons container */}
          <div className="space-y-4 pt-6 border-t border-charcoal/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-detail-add-cart"
                onClick={() => onAddToCart(product)}
                className="py-3.5 px-6 border border-charcoal bg-white text-charcoal text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-charcoal hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Ajouter au panier
              </button>

              <button
                id="btn-detail-instant-buy"
                onClick={() => setShowOrderModal(true)}
                className="py-3.5 px-6 border border-charcoal bg-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#F2F0EB] hover:text-charcoal transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Commander la pièce
              </button>
            </div>

            <a
              id="btn-detail-whatsapp"
              href={getWhatsAppLink(
                getActiveSellerWhatsapp(),
                `Bonjour, je souhaite commander la pièce unique "${product.name}" (Réf: ${product.id}) au prix de ${product.price.toLocaleString('fr-FR')} FCFA.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 border border-green-600 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Commander via WhatsApp (693573891)
            </a>

            <button
              id="btn-detail-share"
              onClick={handleShareProduct}
              className="w-full py-3 px-6 border border-charcoal bg-[#F2F0EB]/65 hover:bg-charcoal hover:text-white text-charcoal text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-700" />
                  <span className="text-green-700 font-bold">Lien de la pièce copié !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Partager ce produit</span>
                </>
              )}
            </button>

            {/* Editorial trust info */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center border-t border-charcoal/5">
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 text-charcoal/60 mx-auto" />
                <span className="text-[9px] font-sans font-bold uppercase text-charcoal/70 tracking-wider block">Garantie Atelier</span>
                <span className="text-[8px] font-serif text-charcoal/50 italic block">100% fait main</span>
              </div>
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-charcoal/60 mx-auto" />
                <span className="text-[9px] font-sans font-bold uppercase text-charcoal/70 tracking-wider block">Livraison soignée</span>
                <span className="text-[8px] font-serif text-charcoal/50 italic block">Emballage renforcé</span>
              </div>
              <div className="space-y-1">
                <RefreshCw className="w-4 h-4 text-charcoal/60 mx-auto" />
                <span className="text-[9px] font-sans font-bold uppercase text-charcoal/70 tracking-wider block">Retours Libres</span>
                <span className="text-[8px] font-serif text-charcoal/50 italic block">Sous 14 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSTANT ORDER MODAL */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderModal}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#FDFBF7] border border-charcoal overflow-hidden max-w-md w-full shadow-2xl relative z-10 p-8 space-y-6"
            >
              {!orderSuccess ? (
                <>
                  <div className="border-b border-charcoal/10 pb-4">
                    <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-charcoal/50 font-bold block">
                      COMMANDE RAPIDE SIMULÉE
                    </span>
                    <h3 className="font-serif font-normal text-charcoal text-2xl mt-1">
                      Réserver cette œuvre unique
                    </h3>
                    <p className="text-xs text-charcoal/60 font-serif italic mt-1.5 leading-relaxed">
                      Complétez ce formulaire pour simuler l'achat instantané de la création <strong className="text-charcoal font-semibold">"{product.name}"</strong> à l'artisan <strong className="text-charcoal font-semibold">{product.vendeur}</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleInstantBuy} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                        Votre Nom complet
                      </label>
                      <input
                        type="text"
                        required
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        placeholder="Ex. Hélène Dubois"
                        className="w-full px-3 py-2 border border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                        Adresse E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        placeholder="helene@example.com"
                        className="w-full px-3 py-2 border border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none"
                      />
                    </div>

                    <div className="bg-[#F2F0EB] p-3 text-xs font-serif italic text-charcoal/75 border border-charcoal/10">
                      Montant de la commande : <strong className="text-charcoal not-italic font-sans font-bold text-sm float-right">{product.price.toLocaleString('fr-FR')} FCFA</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeOrderModal}
                        className="py-2.5 border border-charcoal bg-white text-charcoal text-[9px] uppercase tracking-widest font-bold hover:bg-[#F2F0EB] transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="py-2.5 border border-charcoal bg-charcoal text-white text-[9px] uppercase tracking-widest font-bold hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
                      >
                        Valider la Commande
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-6">
                  <div className="w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center mx-auto border border-charcoal">
                    <Check className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl text-charcoal">Félicitations, {orderName} !</h3>
                    <p className="text-xs text-charcoal/70 font-serif italic leading-relaxed max-w-xs mx-auto">
                      Votre commande simulée pour <strong className="text-charcoal font-semibold">"{product.name}"</strong> auprès de <strong className="text-charcoal font-semibold">{product.vendeur}</strong> a été enregistrée avec succès dans le grand livre de l'atelier.
                    </p>
                  </div>

                  <div className="bg-[#F2F0EB]/60 p-4 border border-charcoal/10 rounded text-[11px] font-mono text-charcoal/80 space-y-1">
                    <p className="font-bold">REÇU DE TRANSACTION : #SIM-{Date.now().toString().slice(-6)}</p>
                    <p>Destinataire : {orderEmail}</p>
                    <p>Pièce : {product.name}</p>
                    <p>Total payé : {product.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>

                  <button
                    onClick={closeOrderModal}
                    className="w-full py-3 bg-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
                  >
                    Retour aux créations
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
