'use client';

import { useEffect } from 'react';
import { removeDashlaneAttributes } from '@/lib/remove-dashlane-attributes';

/**
 * Composant qui supprime les attributs Dashlane pour éviter les erreurs d'hydratation
 */
export default function DashlaneCleanup() {
  useEffect(() => {
    // Fonction de nettoyage agressive
    const clean = () => {
      if (typeof window === 'undefined') return;
      
      const attrs = ['data-dashlane-rid', 'data-dashlane-classification', 'data-dashlane-label', 'data-kwimpalastatus', 'data-kwimpalaid'];
      
      const removeFromElement = (el: Element) => {
        attrs.forEach(attr => {
          if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
          }
        });
      };
      
      const cleanRecursive = (el: Element) => {
        removeFromElement(el);
        try {
          el.querySelectorAll('*').forEach(cleanRecursive);
        } catch (e) {
          // Ignorer les erreurs
        }
      };
      
      // Nettoyer tout le document
      if (document.documentElement) cleanRecursive(document.documentElement);
      if (document.body) cleanRecursive(document.body);
    };
    
    // Exécuter immédiatement
    clean();
    removeDashlaneAttributes();
    
    // Exécuter plusieurs fois pour être sûr
    const timers = [
      setTimeout(() => { clean(); removeDashlaneAttributes(); }, 50),
      setTimeout(() => { clean(); removeDashlaneAttributes(); }, 100),
      setTimeout(() => { clean(); removeDashlaneAttributes(); }, 200),
      setTimeout(() => { clean(); removeDashlaneAttributes(); }, 500),
      setTimeout(() => { clean(); removeDashlaneAttributes(); }, 1000),
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return null;
}

