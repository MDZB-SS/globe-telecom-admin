#!/bin/bash
# Script de diagnostic PostgreSQL

echo "🔍 Diagnostic PostgreSQL"
echo "========================"
echo ""

echo "1. Vérification de l'installation PostgreSQL:"
echo "----------------------------------------------"
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL est installé"
    psql --version
else
    echo "❌ PostgreSQL n'est pas installé ou pas dans le PATH"
fi
echo ""

echo "2. Recherche des services PostgreSQL:"
echo "-------------------------------------"
echo "Services systemd:"
sudo systemctl list-units --type=service --all | grep -i postgres || echo "Aucun service trouvé"
echo ""
echo "Fichiers de service:"
sudo systemctl list-unit-files | grep -i postgres || echo "Aucun fichier de service trouvé"
echo ""

echo "3. Processus PostgreSQL en cours:"
echo "----------------------------------"
ps aux | grep -i postgres | grep -v grep || echo "Aucun processus PostgreSQL trouvé"
echo ""

echo "4. Port 5432:"
echo "------------"
sudo netstat -tlnp 2>/dev/null | grep 5432 || sudo ss -tlnp 2>/dev/null | grep 5432 || echo "Port 5432 non utilisé"
echo ""

echo "5. Packages PostgreSQL installés:"
echo "---------------------------------"
if command -v dpkg &> /dev/null; then
    dpkg -l | grep postgresql || echo "Aucun package PostgreSQL trouvé"
elif command -v rpm &> /dev/null; then
    rpm -qa | grep postgresql || echo "Aucun package PostgreSQL trouvé"
else
    echo "Gestionnaire de paquets non identifié"
fi
echo ""

echo "6. Configuration PostgreSQL (si trouvée):"
echo "-----------------------------------------"
if [ -d /etc/postgresql ]; then
    echo "Répertoires de configuration trouvés:"
    ls -la /etc/postgresql/
    echo ""
    for dir in /etc/postgresql/*/main; do
        if [ -d "$dir" ]; then
            echo "Configuration dans $dir:"
            if [ -f "$dir/postgresql.conf" ]; then
                echo "  listen_addresses: $(grep '^listen_addresses' "$dir/postgresql.conf" | head -1)"
                echo "  port: $(grep '^port' "$dir/postgresql.conf" | head -1)"
            fi
        fi
    done
else
    echo "Aucun répertoire de configuration trouvé dans /etc/postgresql"
fi
echo ""

echo "✅ Diagnostic terminé"

