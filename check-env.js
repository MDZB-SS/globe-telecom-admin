// Script de vérification des variables d'environnement
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env ou .env.local
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(`📄 Chargement de ${envFile}...`);
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        // Ignorer les commentaires et les lignes vides
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Retirer les guillemets si présents
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            // Ne pas écraser les variables déjà définies
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      return envFile;
    }
  }
  return null;
}

const loadedFile = loadEnvFile();
if (loadedFile) {
  console.log(`✅ Fichier ${loadedFile} chargé\n`);
} else {
  console.log('⚠️  Aucun fichier .env ou .env.local trouvé\n');
}

console.log('🔍 Vérification des variables d\'environnement...\n');

let hasErrors = false;

// Vérifier DATABASE_URL ou les variables individuelles
if (!process.env.DATABASE_URL && !process.env.POSTGRES_HOST) {
  console.error('❌ ERREUR: DATABASE_URL ou POSTGRES_HOST doit être défini');
  hasErrors = true;
} else {
  if (process.env.DATABASE_URL) {
    // Masquer le mot de passe dans l'URL
    const maskedUrl = process.env.DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
    console.log(`✅ DATABASE_URL est défini: ${maskedUrl}`);
  } else {
    console.log('⚠️  DATABASE_URL n\'est pas défini, utilisation des variables individuelles');
    if (process.env.POSTGRES_HOST) {
      console.log(`   ✅ POSTGRES_HOST: ${process.env.POSTGRES_HOST}`);
      console.log(`   ${process.env.POSTGRES_PORT ? '✅' : '⚠️ '} POSTGRES_PORT: ${process.env.POSTGRES_PORT || '5432 (défaut)'}`);
      console.log(`   ${process.env.POSTGRES_DATABASE ? '✅' : '⚠️ '} POSTGRES_DATABASE: ${process.env.POSTGRES_DATABASE || 'globe_telecom (défaut)'}`);
      console.log(`   ${process.env.POSTGRES_USER ? '✅' : '❌'} POSTGRES_USER: ${process.env.POSTGRES_USER ? '✓ défini' : '✗ non défini'}`);
      console.log(`   ${process.env.POSTGRES_PASSWORD ? '✅' : '❌'} POSTGRES_PASSWORD: ${process.env.POSTGRES_PASSWORD ? '✓ défini' : '✗ non défini'}`);
      
      if (!process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD) {
        console.error('   ❌ POSTGRES_USER et POSTGRES_PASSWORD sont requis si DATABASE_URL n\'est pas défini');
        hasErrors = true;
      }
    }
  }
}

// Vérifier les variables d'authentification
if (!process.env.ADMIN_USER) {
  console.error('❌ ERREUR: ADMIN_USER n\'est pas défini');
  hasErrors = true;
} else {
  console.log(`✅ ADMIN_USER: ${process.env.ADMIN_USER}`);
}

if (!process.env.ADMIN_PASSWORD) {
  console.error('❌ ERREUR: ADMIN_PASSWORD n\'est pas défini');
  hasErrors = true;
} else {
  console.log(`✅ ADMIN_PASSWORD: ${'*'.repeat(process.env.ADMIN_PASSWORD.length)} (${process.env.ADMIN_PASSWORD.length} caractères)`);
}

console.log('\n📋 Résumé:');
if (hasErrors) {
  console.log('❌ Des variables d\'environnement sont manquantes. Veuillez corriger votre fichier .env');
  console.log('\n💡 Vérifiez que votre fichier .env contient au minimum:');
  console.log('   - DATABASE_URL OU (POSTGRES_HOST + POSTGRES_USER + POSTGRES_PASSWORD)');
  console.log('   - ADMIN_USER');
  console.log('   - ADMIN_PASSWORD');
  process.exit(1);
} else {
  console.log('✅ Toutes les variables d\'environnement requises sont présentes');
  console.log('\n💡 Si l\'application ne fonctionne toujours pas, vérifiez:');
  console.log('   1. Que PostgreSQL est démarré et accessible');
  console.log('   2. Que la base de données "globe_telecom" existe');
  console.log('   3. Que le schéma "public" et la table "contact_requests" existent');
  console.log('   4. Que les identifiants de connexion sont corrects');
  console.log('   5. Les erreurs dans la console du navigateur (F12)');
  console.log('   6. Les erreurs dans le terminal où npm run dev est lancé');
}

