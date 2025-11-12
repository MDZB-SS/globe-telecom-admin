// Script à exécuter AVANT React pour supprimer les attributs Dashlane
// Ce script est injecté dans le <head> pour s'exécuter le plus tôt possible

(function() {
  'use strict';
  
  const dashlaneAttributes = [
    'data-dashlane-rid',
    'data-dashlane-classification',
    'data-dashlane-label',
    'data-kwimpalastatus',
    'data-kwimpalaid'
  ];

  function removeAttributes(element) {
    dashlaneAttributes.forEach(function(attr) {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  }

  function cleanElement(element) {
    removeAttributes(element);
    var children = element.querySelectorAll('*');
    for (var i = 0; i < children.length; i++) {
      cleanElement(children[i]);
    }
  }

  function cleanAll() {
    if (document.body) {
      cleanElement(document.body);
    }
  }

  // Exécuter immédiatement si le body existe déjà
  if (document.body) {
    cleanAll();
  } else {
    // Attendre que le body soit chargé
    document.addEventListener('DOMContentLoaded', cleanAll);
  }

  // Observer les changements
  if (document.body) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // ELEMENT_NODE
            cleanElement(node);
          }
        });
        if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
          removeAttributes(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: dashlaneAttributes
    });
  }
})();

