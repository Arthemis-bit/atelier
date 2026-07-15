/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShoppingBag, Settings, Eye, Sparkles } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  cartCount: number;
  onOpenCart: () => void;
  isClientOnly?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  setIsAdmin,
  cartCount,
  onOpenCart,
  isClientOnly = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-charcoal bg-charcoal flex items-center justify-center text-white">
              <ShoppingBag className="w-4.5 h-4.5" id="logo-icon" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-charcoal">
                Atelier<span className="italic font-normal">Épuré</span>
              </span>
              <p className="text-[9px] font-sans uppercase tracking-[0.25em] text-charcoal/60 hidden sm:block mt-0.5">
                Boutique d'Artisans & Créateurs
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mode Switcher */}
            {!isClientOnly ? (
              <div className="border border-charcoal p-0.5 flex items-center bg-white">
                <button
                  id="btn-switch-client"
                  onClick={() => setIsAdmin(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-sans font-semibold transition-all ${
                    !isAdmin
                      ? "bg-charcoal text-white"
                      : "text-charcoal/60 hover:text-charcoal"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Mode Client</span>
                  <span className="xs:hidden">Client</span>
                </button>
                <button
                  id="btn-switch-admin"
                  onClick={() => setIsAdmin(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-sans font-semibold transition-all ${
                    isAdmin
                      ? "bg-charcoal text-white"
                      : "text-charcoal/60 hover:text-charcoal"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Gérer Boutique</span>
                  <span className="xs:hidden">Admin</span>
                </button>
              </div>
            ) : (
              <div className="border border-charcoal bg-[#F2F0EB] px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans font-bold text-charcoal flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Collection Privée
              </div>
            )}

            {/* Cart Button */}
            <button
              id="btn-cart-toggle"
              onClick={onOpenCart}
              className="relative p-2.5 border border-charcoal bg-white hover:bg-warmgray text-charcoal transition-colors cursor-pointer"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-charcoal text-white font-mono text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
