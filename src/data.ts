/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

export const INITIAL_PRODUCTS: Product[] = [];

export interface CuratedImage {
  url: string;
  label: string;
  category: string;
}

export const CURATED_IMAGES: CuratedImage[] = [
  // Mode
  {
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
    label: "Baskets Rouges Sport",
    category: "Mode"
  },
  {
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
    label: "Sac à Main Cuir Bordeaux",
    category: "Mode"
  },
  {
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
    label: "Veste en Jean Classique",
    category: "Mode"
  },
  {
    url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop",
    label: "Baskets Blanches Toile",
    category: "Mode"
  },
  
  // Technologie
  {
    url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop",
    label: "Montre Connectée Sport",
    category: "Technologie"
  },
  {
    url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop",
    label: "Clavier Mécanique Rétroéclairé",
    category: "Technologie"
  },
  {
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop",
    label: "Tablette Tactile Pro",
    category: "Technologie"
  },
  {
    url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
    label: "Enceinte Connectée",
    category: "Technologie"
  },

  // Maison & Déco
  {
    url: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&auto=format&fit=crop",
    label: "Tasse à Café en Céramique",
    category: "Maison & Déco"
  },
  {
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop",
    label: "Fauteuil Design Moderne",
    category: "Maison & Déco"
  },
  {
    url: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&auto=format&fit=crop",
    label: "Plateau en Bois Brut",
    category: "Maison & Déco"
  },
  {
    url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
    label: "Affiche Artistique Murale",
    category: "Maison & Déco"
  },

  // Beauté
  {
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    label: "Flacon de Parfum d'Exception",
    category: "Beauté"
  },
  {
    url: "https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600&auto=format&fit=crop",
    label: "Vernis à Ongles Naturel",
    category: "Beauté"
  },
  {
    url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
    label: "Savons Saponifiés à Froid",
    category: "Beauté"
  },
  {
    url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop",
    label: "Huile de Soin Corps & Cheveux",
    category: "Beauté"
  }
];

export const STORES_CATEGORIES = [
  "Mode",
  "Technologie",
  "Maison & Déco",
  "Beauté",
  "Épicerie Fine",
  "Autre"
];
