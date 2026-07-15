/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Trash2, ShoppingBag, Plus, Minus, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutSuccess: (items: CartItem[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate a brief API call/processing time
    setTimeout(() => {
      setIsCheckingOut(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  const confirmReceipt = () => {
    onCheckoutSuccess([...cartItems]);
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <>
      {/* Drawer Overlay & Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#FDFBF7] border-l border-charcoal shadow-2xl z-50 flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-charcoal flex justify-between items-center bg-[#F2F0EB]">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-charcoal" />
                  <h2 className="text-xl font-serif font-normal text-charcoal">
                    Votre Sélection ({totalItemsCount})
                  </h2>
                </div>
                <button
                  id="btn-close-cart"
                  onClick={onClose}
                  className="p-2 border border-charcoal bg-white text-charcoal hover:bg-charcoal hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-14 h-14 border border-charcoal/20 bg-[#F2F0EB] flex items-center justify-center text-charcoal mb-4">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif italic text-charcoal text-lg mb-2">
                      Votre panier est vide
                    </h3>
                    <p className="text-xs text-charcoal/60 font-sans uppercase tracking-wider max-w-xs mb-6">
                      Explorez notre collection et ajoutez des pièces artisanales uniques.
                    </p>
                    <button
                      id="btn-empty-cart-back"
                      onClick={onClose}
                      className="px-6 py-3 bg-charcoal text-white text-[10px] uppercase tracking-widest font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
                    >
                      Continuer les Achats
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 p-3 border border-charcoal/15 bg-white relative hover:border-charcoal transition-colors"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover bg-[#F2F0EB] border border-charcoal/10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] uppercase font-sans tracking-[0.15em] text-charcoal/50 font-bold">
                          {item.product.category}
                        </span>
                        <h4 className="text-base font-serif font-normal text-charcoal truncate mt-0.5">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-sans font-bold text-charcoal/80 mt-1">
                          {item.product.price.toLocaleString('fr-FR')} FCFA
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center border border-charcoal bg-white">
                            <button
                              id={`btn-qty-minus-${item.product.id}`}
                              onClick={() =>
                                onUpdateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-1 text-charcoal hover:bg-[#F2F0EB] transition-colors cursor-pointer"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-mono font-bold text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              id={`btn-qty-plus-${item.product.id}`}
                              onClick={() =>
                                onUpdateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="p-1 text-charcoal hover:bg-[#F2F0EB] transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            id={`btn-remove-item-${item.product.id}`}
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-charcoal/40 hover:text-charcoal p-1 transition-colors cursor-pointer"
                            title="Supprimer l'article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Checkout Panel */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-charcoal bg-[#F2F0EB] space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans uppercase tracking-wider text-charcoal/60">
                      <span>Sous-total</span>
                      <span className="font-sans font-bold">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs font-sans uppercase tracking-wider text-charcoal/60">
                      <span>Livraison d'Atelier</span>
                      <span className="text-charcoal font-bold">Offerte</span>
                    </div>
                    <div className="border-t border-charcoal/10 my-3 pt-3 flex justify-between text-base font-serif text-charcoal">
                      <span>Total Estimé</span>
                      <span className="font-sans font-bold text-lg text-charcoal">
                        {subtotal.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  <button
                    id="btn-checkout"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3.5 bg-charcoal text-white font-sans text-xs uppercase tracking-widest font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors flex items-center justify-center gap-2 disabled:bg-charcoal/60 cursor-pointer"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        TIRAGE DE FACTURE...
                      </span>
                    ) : (
                      <>
                        Confirmer l'Achat Simulé <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-center text-charcoal/40 font-mono">
                    PROTOTYPE - SIMULATION SANS TRANSACTION RÉELLE
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Success Confirmation Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={confirmReceipt}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#FDFBF7] border border-charcoal p-8 max-w-md w-full shadow-2xl relative z-10 text-center"
            >
              <div className="w-12 h-12 border border-charcoal bg-charcoal text-white flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-serif font-normal text-charcoal mb-2">
                Sélection Validée
              </h3>
              <p className="text-xs text-charcoal/70 font-serif italic mb-6">
                Merci pour votre commande fictive. Les pièces ont été enregistrées pour mettre à jour les statistiques de l'Atelier.
              </p>

              {/* Receipt mockup - beautiful editorial card */}
              <div className="border border-dashed border-charcoal/40 bg-[#F2F0EB]/50 p-5 text-left font-mono text-[11px] space-y-2.5 mb-6 text-charcoal">
                <div className="text-center font-bold pb-2 border-b border-charcoal/15 tracking-wider">
                  FACTURE D'ATELIER SIMULÉE
                </div>
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="truncate max-w-[220px]">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>{(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
                <div className="border-t border-charcoal/15 pt-2 flex justify-between font-bold text-sm">
                  <span>Total Réglé</span>
                  <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="text-center text-[9px] text-charcoal/50 pt-1.5 font-sans uppercase tracking-wider">
                  {new Date().toLocaleDateString("fr-FR")} — ATELIER ÉPURÉ
                </div>
              </div>

              <button
                id="btn-confirm-receipt"
                onClick={confirmReceipt}
                className="w-full py-3 bg-charcoal text-white font-sans text-xs uppercase tracking-widest font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
              >
                Continuer les Découvertes
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
