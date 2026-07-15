/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Package,
  DollarSign,
  Percent,
  Search,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Coins,
  Upload,
  Image as ImageIcon,
  Share2,
  Eye,
  Store,
  ExternalLink,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import { STORES_CATEGORIES } from "../data";

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id" | "createdAt" | "salesCount">) => void;
  onUpdateProduct: (productId: string, updatedFields: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  simulatedEarnings: number;
  simulatedSalesCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  simulatedEarnings,
  simulatedSalesCount,
}) => {
  // Add Product Form State
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Mode");
  const [newVendeur, setNewVendeur] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageCategoryFilter, setImageCategoryFilter] = useState("Tous");

  const [dragActiveNew, setDragActiveNew] = useState(false);
  const [dragActiveEdit, setDragActiveEdit] = useState(false);

  const handleImageFile = (file: File, isEdit: boolean) => {
    if (!file.type.startsWith("image/")) {
      alert("Veuillez importer uniquement des fichiers image (PNG, JPG, JPEG, WEBP, etc.).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (isEdit) {
        setEditImageUrl(base64);
      } else {
        setNewImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent, isEdit: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (isEdit) setDragActiveEdit(true);
      else setDragActiveNew(true);
    } else if (e.type === "dragleave") {
      if (isEdit) setDragActiveEdit(false);
      else setDragActiveNew(false);
    }
  };

  const handleDrop = (e: React.DragEvent, isEdit: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) setDragActiveEdit(false);
    else setDragActiveNew(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0], isEdit);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0], isEdit);
    }
  };
  
  // Search & Filters in admin catalog
  const [catalogSearch, setCatalogSearch] = useState("");

  // Custom client banner text customization states
  const [clientBannerSubtitle, setClientBannerSubtitle] = useState("");
  const [clientBannerTitle, setClientBannerTitle] = useState("");
  const [clientBannerDesc, setClientBannerDesc] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientBannerSubtitle(localStorage.getItem("client_banner_subtitle") || "ÉDITION LIMITÉE & PIÈCES UNIQUES");
      setClientBannerTitle(localStorage.getItem("client_banner_title") || "La beauté du grès brute et des matières nobles.");
      setClientBannerDesc(localStorage.getItem("client_banner_desc") || `"Une esthétique forgée dans le calme de l'atelier, où l'imperfection devient signature." Découvrez nos créations locales et artisanales.`);
    }
  }, []);

  const handleSaveClientTexts = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("client_banner_subtitle", clientBannerSubtitle.trim());
    localStorage.setItem("client_banner_title", clientBannerTitle.trim());
    localStorage.setItem("client_banner_desc", clientBannerDesc.trim());
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };
  
  // Edit State (which product is being edited)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editVendeur, setEditVendeur] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Statistics calculations
  const totalProducts = products.length;
  const averagePrice = totalProducts > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts 
    : 0;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || !newDescription.trim()) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    if (!newImageUrl) {
      alert("Veuillez importer une image depuis votre appareil pour ce produit !");
      return;
    }

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Veuillez saisir un prix valide supérieur à 0 !");
      return;
    }

    onAddProduct({
      name: newName.trim(),
      price: priceNum,
      description: newDescription.trim(),
      category: newCategory,
      vendeur: newVendeur.trim() || "Atelier Épuré",
      imageUrl: newImageUrl,
    });

    // Reset Form
    setNewName("");
    setNewPrice("");
    setNewDescription("");
    setNewImageUrl("");
    setNewVendeur("");
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditDescription(product.description);
    setEditCategory(product.category);
    setEditVendeur(product.vendeur || "Atelier Épuré");
    setEditImageUrl(product.imageUrl);
  };

  const saveProductEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editName.trim() || !editPrice || !editDescription.trim()) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Prix invalide");
      return;
    }

    onUpdateProduct(editingProduct.id, {
      name: editName.trim(),
      price: priceNum,
      description: editDescription.trim(),
      category: editCategory,
      vendeur: editVendeur.trim() || "Atelier Épuré",
      imageUrl: editImageUrl,
    });

    setEditingProduct(null);
  };

  const filteredCatalog = products.filter((p) =>
    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="space-y-10 py-4">
      {/* PERSONNALISATION DE L'ESPACE CLIENT */}
      <div className="bg-white border-2 border-charcoal p-6 space-y-4">
        <div className="flex items-start gap-4 border-b border-charcoal/10 pb-4">
          <div className="w-10 h-10 border border-charcoal bg-charcoal/5 flex items-center justify-center text-charcoal shrink-0">
            <Edit2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-charcoal">Personnalisation de l'Espace Client</h3>
            <p className="text-xs text-charcoal/60 leading-relaxed font-serif italic">
              Modifiez en temps réel le message d'introduction de l'Atelier d'accueil visible par tous vos visiteurs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveClientTexts} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest">
                Surtitre de la bannière d'accueil
              </label>
              <input
                type="text"
                required
                value={clientBannerSubtitle}
                onChange={(e) => setClientBannerSubtitle(e.target.value)}
                placeholder="Ex. ÉDITION LIMITÉE & PIÈCES UNIQUES"
                className="w-full px-3 py-2 border border-charcoal/30 focus:border-charcoal text-xs bg-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest">
                Titre principal de la bannière
              </label>
              <input
                type="text"
                required
                value={clientBannerTitle}
                onChange={(e) => setClientBannerTitle(e.target.value)}
                placeholder="Ex. La beauté du grès brute"
                className="w-full px-3 py-2 border border-charcoal/30 focus:border-charcoal text-xs bg-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest">
              Description / Paragraphe de la bannière d'accueil
            </label>
            <textarea
              required
              rows={2}
              value={clientBannerDesc}
              onChange={(e) => setClientBannerDesc(e.target.value)}
              placeholder="Ex. Une esthétique forgée dans le calme de l'atelier..."
              className="w-full px-3 py-2 border border-charcoal/30 focus:border-charcoal text-xs bg-transparent outline-none transition-all font-serif italic"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-charcoal/5">
            <div>
              {saveStatus && (
                <span className="text-[10px] text-green-700 font-sans font-semibold uppercase bg-green-50 px-2.5 py-1 border border-green-200">
                  ✓ Enregistré avec succès ! Actualisez l'espace boutique pour voir.
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-charcoal hover:bg-white text-white hover:text-charcoal border border-charcoal text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

      {/* Analytics Summary Bar - Editorial Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-charcoal flex items-center gap-4">
          <div className="w-10 h-10 border border-charcoal flex items-center justify-center text-charcoal">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-charcoal/50 font-bold uppercase tracking-[0.2em] block">PIÈCES EN VENTE</span>
            <span className="font-sans text-xl font-bold text-charcoal">{totalProducts}</span>
          </div>
        </div>

        <div className="bg-white p-6 border border-charcoal flex items-center gap-4">
          <div className="w-10 h-10 border border-charcoal flex items-center justify-center text-charcoal">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-charcoal/50 font-bold uppercase tracking-[0.2em] block">PRIX MOYEN</span>
            <span className="font-sans text-xl font-bold text-charcoal">{averagePrice.toFixed(2)} €</span>
          </div>
        </div>

        <div className="bg-white p-6 border border-charcoal flex items-center gap-4">
          <div className="w-10 h-10 border border-charcoal flex items-center justify-center text-charcoal">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-charcoal/50 font-bold uppercase tracking-[0.2em] block">VENTES SIMULÉES</span>
            <span className="font-sans text-xl font-bold text-charcoal">+{simulatedSalesCount}</span>
          </div>
        </div>

        <div className="bg-white p-6 border border-charcoal flex items-center gap-4 bg-[#F2F0EB]">
          <div className="w-10 h-10 border border-charcoal bg-charcoal flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-charcoal/50 font-bold uppercase tracking-[0.2em] block">REVENUS SIMULÉS</span>
            <span className="font-sans text-xl font-bold text-charcoal">{simulatedEarnings.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Ajouter un Produit FORM */}
        <div className="lg:col-span-5 bg-white border border-charcoal p-6 h-fit space-y-6">
          <div className="border-b border-charcoal/10 pb-4">
            <h2 className="text-xl font-serif font-normal text-charcoal flex items-center gap-2.5">
              <Plus className="w-5 h-5 text-charcoal" />
              Nouveau Produit
            </h2>
            <p className="text-xs text-charcoal/60 font-serif italic mt-1">
              Remplissez les détails ci-dessous pour créer instantanément une nouvelle pièce sur votre site.
            </p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-5">
            {/* Nom */}
            <div>
              <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                Nom du produit *
              </label>
              <input
                id="form-product-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex. Vase d'Art en Grès Cendré"
                className="w-full px-4 py-2.5 border border-charcoal/30 focus:border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none transition-colors"
              />
            </div>

            {/* Vendeur / Artisan */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest">
                  Nom du Vendeur / Artisan *
                </label>
              </div>
              <input
                id="form-product-vendeur"
                type="text"
                required
                value={newVendeur}
                onChange={(e) => setNewVendeur(e.target.value)}
                placeholder="Ex. Atelier de Céramique de Marie"
                className="w-full px-4 py-2.5 border border-charcoal/30 focus:border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prix */}
              <div>
                <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                  Prix (€) *
                </label>
                <div className="relative">
                  <input
                    id="form-product-price"
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="49.00"
                    className="w-full pl-4 pr-8 py-2.5 border border-charcoal/30 focus:border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none transition-colors font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/50 font-mono text-xs">
                    €
                  </span>
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                  Catégorie
                </label>
                <select
                  id="form-product-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-charcoal focus:border-charcoal text-xs font-sans tracking-wide bg-white outline-none cursor-pointer"
                >
                  {STORES_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                Description et détails *
              </label>
              <textarea
                id="form-product-desc"
                required
                rows={4}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Matériaux, dimensions, histoire de fabrication ou de tissage..."
                className="w-full px-4 py-2.5 border border-charcoal/30 focus:border-charcoal text-xs font-serif italic bg-transparent outline-none transition-colors"
              />
            </div>

            {/* Visual Image Chooser -> Replaced with Device Image Uploader */}
            <div>
              <label className="block text-[9px] font-sans font-bold text-charcoal/60 uppercase tracking-widest mb-1.5">
                Image de la pièce *
              </label>
              
              <div
                onDragEnter={(e) => handleDrag(e, false)}
                onDragOver={(e) => handleDrag(e, false)}
                onDragLeave={(e) => handleDrag(e, false)}
                onDrop={(e) => handleDrop(e, false)}
                onClick={() => document.getElementById("file-upload-new")?.click()}
                className={`border border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[170px] relative bg-[#F2F0EB]/30 ${
                  dragActiveNew ? "border-charcoal bg-[#F2F0EB]/80" : "border-charcoal/30 hover:border-charcoal hover:bg-[#F2F0EB]/50"
                }`}
              >
                <input
                  id="file-upload-new"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileInputChange(e, false)}
                />
                
                {newImageUrl ? (
                  <div className="w-full h-full flex flex-col items-center gap-2">
                    <img
                      src={newImageUrl}
                      alt="Aperçu de l'image importée"
                      className="max-h-24 object-contain border border-charcoal/20 bg-[#F2F0EB]"
                    />
                    <span className="text-[9px] font-sans font-bold tracking-widest text-charcoal/50 uppercase mt-1 animate-pulse">
                      IMAGE CHARGÉE — CLIQUER OU GLISSER POUR CHANGER
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5 flex flex-col items-center">
                    <div className="w-10 h-10 border border-charcoal/20 flex items-center justify-center text-charcoal/60">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-serif italic text-charcoal">
                        Glissez-déposez votre image ici
                      </p>
                      <p className="text-[9px] font-sans font-bold tracking-widest text-charcoal/40 uppercase mt-1">
                        OU PARCOUREZ VOTRE APPAREIL
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-create-product"
              type="submit"
              className="w-full py-3 bg-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Créer le Produit
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Gérer le Catalogue Table/List */}
        <div className="lg:col-span-7 bg-white border border-charcoal p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
            <div>
              <h2 className="text-xl font-serif font-normal text-charcoal">
                Catalogue Boutique ({products.length})
              </h2>
              <p className="text-xs text-charcoal/60 font-serif italic mt-1">
                Modifiez rapidement les prix et descriptions de vos pièces ou supprimez-les du catalogue.
              </p>
            </div>

            {/* Catalog Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/50" />
              <input
                id="catalog-search"
                type="text"
                placeholder="RECHERCHER..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-charcoal/30 focus:border-charcoal text-xs font-sans tracking-wider uppercase bg-transparent outline-none"
              />
            </div>
          </div>

          {/* List items with elegant editorial design */}
          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="text-center py-12 text-charcoal/60 font-serif italic">
                Aucun produit ne correspond à vos filtres.
              </div>
            ) : (
              filteredCatalog.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-charcoal/15 bg-[#FDFBF7]/35 hover:bg-[#F2F0EB]/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover bg-white border border-charcoal/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-sans font-bold uppercase tracking-[0.15em] text-charcoal bg-[#F2F0EB] px-2 py-0.5 border border-charcoal/10">
                          {product.category}
                        </span>
                        <span className="text-[9px] font-mono text-charcoal/40">
                          REF: {product.id.slice(0, 8)}
                        </span>
                      </div>
                       <h3 className="font-serif font-normal text-base text-charcoal truncate mt-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-charcoal/70 font-serif italic line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] font-sans text-charcoal/60">
                          Artisan : <span className="font-semibold text-charcoal">{product.vendeur || "Atelier Épuré"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 border-charcoal/10 pt-3 sm:pt-0">
                    {/* Price display */}
                    <div className="text-left sm:text-right">
                      <div className="text-[9px] text-charcoal/40 font-sans uppercase tracking-widest font-bold">PRIX ACTUEL</div>
                      <div className="font-sans text-sm font-bold text-charcoal">
                        {product.price.toFixed(2)} €
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-edit-${product.id}`}
                        onClick={() => startEditing(product)}
                        className="p-2 bg-white text-charcoal hover:text-white hover:bg-charcoal border border-charcoal transition-colors cursor-pointer"
                        title="Modifier le prix et la description"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-${product.id}`}
                        onClick={() => {
                          if (
                            confirm(
                              `Êtes-vous sûr de vouloir retirer "${product.name}" de la vente ?`
                            )
                          ) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-2 bg-white text-charcoal hover:text-white hover:bg-red-600 border border-charcoal transition-colors cursor-pointer"
                        title="Supprimer du catalogue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL DIALOG (For modifying price & description) */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#FDFBF7] border border-charcoal overflow-hidden max-w-lg w-full shadow-2xl relative z-10 p-8"
            >
              <button
                id="edit-modal-close"
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-charcoal hover:text-white border border-charcoal text-charcoal transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-charcoal/15 pb-4 mb-6">
                <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-charcoal/50 font-bold block">
                  MODIFICATION DE PIÈCE
                </span>
                <h3 className="font-serif font-normal text-charcoal text-2xl mt-1">
                  Modifier {editingProduct.name}
                </h3>
              </div>

              <form onSubmit={saveProductEdits} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-[9px] font-sans font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">
                    Nom de l'article
                  </label>
                  <input
                    id="edit-product-name"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-charcoal focus:border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none transition-colors"
                  />
                </div>

                {/* Vendeur / Artisan */}
                <div>
                  <label className="block text-[9px] font-sans font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">
                    Vendeur / Artisan
                  </label>
                  <input
                    id="edit-product-vendeur"
                    type="text"
                    required
                    value={editVendeur}
                    onChange={(e) => setEditVendeur(e.target.value)}
                    className="w-full px-3 py-2 border border-charcoal focus:border-charcoal text-xs font-sans tracking-wide bg-transparent outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price modification */}
                  <div>
                    <label className="block text-[9px] font-sans font-bold text-charcoal/50 uppercase tracking-widest mb-1.5 text-charcoal">
                      Nouveau Prix (€) *
                    </label>
                    <div className="relative">
                      <input
                        id="edit-product-price"
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 border border-charcoal text-xs font-sans tracking-wide bg-white outline-none transition-colors font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal font-mono text-xs">
                        €
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[9px] font-sans font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">
                      Catégorie
                    </label>
                    <select
                      id="edit-product-category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-charcoal text-xs font-sans tracking-wide bg-white outline-none cursor-pointer"
                    >
                      {STORES_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description modification */}
                <div>
                  <label className="block text-[9px] font-sans font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">
                    Modifier la Description *
                  </label>
                  <textarea
                    id="edit-product-desc"
                    required
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-charcoal text-xs font-serif italic bg-transparent outline-none transition-colors"
                  />
                </div>

                {/* Image Upload for editing */}
                <div>
                  <label className="block text-[9px] font-sans font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">
                    Image de la pièce *
                  </label>
                  
                  <div
                    onDragEnter={(e) => handleDrag(e, true)}
                    onDragOver={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, true)}
                    onDrop={(e) => handleDrop(e, true)}
                    onClick={() => document.getElementById("file-upload-edit")?.click()}
                    className={`border border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[170px] relative bg-[#F2F0EB]/30 ${
                      dragActiveEdit ? "border-charcoal bg-[#F2F0EB]/80" : "border-charcoal/30 hover:border-charcoal hover:bg-[#F2F0EB]/50"
                    }`}
                  >
                    <input
                      id="file-upload-edit"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, true)}
                    />
                    
                    {editImageUrl ? (
                      <div className="w-full h-full flex flex-col items-center gap-2">
                        <img
                          src={editImageUrl}
                          alt="Aperçu de l'image importée"
                          className="max-h-24 object-contain border border-charcoal/20 bg-[#F2F0EB]"
                        />
                        <span className="text-[9px] font-sans font-bold tracking-widest text-charcoal/50 uppercase mt-1 animate-pulse">
                          IMAGE CHARGÉE — CLIQUER OU GLISSER POUR CHANGER
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2.5 flex flex-col items-center">
                        <div className="w-10 h-10 border border-charcoal/20 flex items-center justify-center text-charcoal/60">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-serif italic text-charcoal">
                            Glissez-déposez votre image ici
                          </p>
                          <p className="text-[9px] font-sans font-bold tracking-widest text-charcoal/40 uppercase mt-1">
                            OU PARCOUREZ VOTRE APPAREIL
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-charcoal/10 mt-6">
                  <button
                    id="btn-edit-cancel"
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-3 bg-[#F2F0EB] hover:bg-charcoal hover:text-white text-charcoal text-[10px] uppercase tracking-widest font-bold border border-transparent hover:border-charcoal transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    id="btn-edit-save"
                    type="submit"
                    className="flex-1 py-3 bg-charcoal text-white text-[10px] uppercase tracking-widest font-bold border border-charcoal hover:bg-white hover:text-charcoal transition-colors cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
