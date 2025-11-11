-- Script d'optimisation de la base de données Globe Telecom
-- À exécuter sur PostgreSQL pour améliorer les performances

-- Index sur date_envoi (utilisé pour le tri principal)
CREATE INDEX IF NOT EXISTS idx_messages_date_envoi 
ON globetelecom.messages_contact (date_envoi DESC);

-- Index composé pour les recherches par nom/prénom
CREATE INDEX IF NOT EXISTS idx_messages_names 
ON globetelecom.messages_contact (LOWER(nom), LOWER(prenom));

-- Index sur l'email pour les recherches
CREATE INDEX IF NOT EXISTS idx_messages_email 
ON globetelecom.messages_contact (LOWER(email));

-- Index partiel sur les messages non-vides pour les recherches de contenu
CREATE INDEX IF NOT EXISTS idx_messages_content 
ON globetelecom.messages_contact USING gin(to_tsvector('french', message)) 
WHERE message IS NOT NULL AND message != '';

-- Index composé pour les filtres de services (les plus utilisés)
CREATE INDEX IF NOT EXISTS idx_messages_services 
ON globetelecom.messages_contact (installation, maintenance, surveillance, consultation)
WHERE installation = true OR maintenance = true OR surveillance = true OR consultation = true;

-- Index sur date_envoi avec filtre des derniers 3 mois (pour les requêtes récentes)
CREATE INDEX IF NOT EXISTS idx_messages_recent 
ON globetelecom.messages_contact (date_envoi DESC, id) 
WHERE date_envoi > NOW() - INTERVAL '3 months';

-- Statistiques pour l'optimiseur de requêtes
ANALYZE globetelecom.messages_contact;

-- Afficher les index créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'messages_contact' 
    AND schemaname = 'globetelecom'
ORDER BY indexname;
