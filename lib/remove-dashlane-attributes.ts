/**
 * Script pour supprimer les attributs Dashlane qui causent des erreurs d'hydratation
 * À exécuter côté client uniquement
 */

export function removeDashlaneAttributes() {
  if (typeof window === 'undefined') return;

  // Supprimer tous les attributs Dashlane du DOM
  const dashlaneAttributes = [
    'data-dashlane-rid',
    'data-dashlane-classification',
    'data-dashlane-label',
    'data-kwimpalastatus',
    'data-kwimpalaid'
  ];

  const removeAttributes = (element: Element) => {
    dashlaneAttributes.forEach((attr) => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  };

  // Fonction pour nettoyer récursivement
  const cleanElement = (element: Element) => {
    removeAttributes(element);
    element.querySelectorAll('*').forEach(cleanElement);
  };

  // Nettoyer tout le document
  const cleanAll = () => {
    cleanElement(document.body);
  };

  // Exécuter après un court délai pour laisser Dashlane s'initialiser
  setTimeout(cleanAll, 100);
  setTimeout(cleanAll, 500);
  setTimeout(cleanAll, 1000);

  // Observer les nouveaux éléments ajoutés par Dashlane (seulement si pas déjà observé)
  if (!document.body.hasAttribute('data-dashlane-observer')) {
    document.body.setAttribute('data-dashlane-observer', 'true');
    
    const observer = new MutationObserver((mutations) => {
      // Utiliser requestIdleCallback pour éviter de bloquer le rendu
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          mutations.forEach((mutation) => {
            // Nettoyer les nouveaux nœuds
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                cleanElement(node as Element);
              }
            });
            
            // Nettoyer les attributs modifiés
            if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
              removeAttributes(mutation.target as Element);
            }
          });
        });
      } else {
        // Fallback pour les navigateurs sans requestIdleCallback
        setTimeout(() => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                cleanElement(node as Element);
              }
            });
            if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
              removeAttributes(mutation.target as Element);
            }
          });
        }, 0);
      }
    });

    // Observer les changements dans le DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: dashlaneAttributes
    });

    // Nettoyer périodiquement pendant 3 secondes seulement
    const interval = setInterval(cleanAll, 1000);
    setTimeout(() => {
      clearInterval(interval);
      observer.disconnect();
      document.body.removeAttribute('data-dashlane-observer');
    }, 3000);
  }
}

