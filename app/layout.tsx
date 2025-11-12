import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { Toaster } from 'sonner'
import DashlaneCleanup from '@/components/DashlaneCleanup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Globe Telecom - Interface d\'Administration',
  description: 'Interface d\'administration sécurisée pour la gestion des messages de contact Globe Telecom',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var dashlaneAttrs = ['data-dashlane-rid', 'data-dashlane-classification', 'data-dashlane-label', 'data-kwimpalastatus', 'data-kwimpalaid'];
                var cleaned = false;
                
                function clean(el) {
                  if (!el || el.nodeType !== 1) return;
                  dashlaneAttrs.forEach(function(a) { 
                    if (el.hasAttribute(a)) el.removeAttribute(a); 
                  });
                  try {
                    Array.from(el.querySelectorAll('*')).forEach(clean);
                  } catch(e) {}
                }
                
                function cleanAll() {
                  if (document.documentElement) clean(document.documentElement);
                  if (document.body) clean(document.body);
                }
                
                // Nettoyer immédiatement
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    cleanAll();
                    cleaned = true;
                  });
                } else {
                  cleanAll();
                  cleaned = true;
                }
                
                // Observer agressif
                var obs = new MutationObserver(function(mutations) {
                  if (!cleaned) return;
                  mutations.forEach(function(mut) {
                    if (mut.type === 'attributes' && mut.target.nodeType === 1) {
                      dashlaneAttrs.forEach(function(a) {
                        if (mut.target.hasAttribute(a)) mut.target.removeAttribute(a);
                      });
                    }
                    mut.addedNodes.forEach(function(n) {
                      if (n.nodeType === 1) clean(n);
                    });
                  });
                });
                
                // Démarrer l'observer dès que possible
                function startObserver() {
                  if (document.body && !document.body.hasAttribute('data-dashlane-obs')) {
                    document.body.setAttribute('data-dashlane-obs', 'true');
                    obs.observe(document.body, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: dashlaneAttrs
                    });
                    // Nettoyer périodiquement pendant 10 secondes
                    var count = 0;
                    var interval = setInterval(function() {
                      cleanAll();
                      count++;
                      if (count >= 10) {
                        clearInterval(interval);
                      }
                    }, 1000);
                  }
                }
                
                if (document.body) {
                  startObserver();
                } else {
                  document.addEventListener('DOMContentLoaded', startObserver);
                }
              })();
            `
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <DashlaneCleanup />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster 
          position="top-right"
          richColors
          expand={false}
          closeButton
        />
      </body>
    </html>
  )
}