// Script qui lit directement le fichier .env sans dépendances
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification directe du fichier .env...\n');

const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

let envContent = '';
let fileFound = false;

// Essayer de lire .env.local d'abord (priorité Next.js)
if (fs.existsSync(envLocalPath)) {
  console.log('📄 Fichier .env.local trouvé (priorité Next.js)');
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  fileFound = true;
} else if (fs.existsSync(envPath)) {
  console.log('📄 Fichier .env trouvé');
  envContent = fs.readFileSync(envPath, 'utf8');
  fileFound = true;
} else {
  console.error('❌ Aucun fichier .env ou .env.local trouvé');
  console.log('💡 Créez un fichier .env.local à la racine du projet');
  process.exit(1);
}

// Parser le contenu du fichier .env
const envVars = {};
const lines = envContent.split('\n');

lines.forEach((line, index) => {
  // Ignorer les commentaires et les lignes vides
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Supprimer les guillemets si présents
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  }
});

console.log(`\n📋 Variables trouvées dans le fichier:\n`);

let hasErrors = false;

// Vérifier DATABASE_URL ou les variables individuelles
if (!envVars.DATABASE_URL && !envVars.POSTGRES_HOST) {
  console.error('❌ ERREUR: DATABASE_URL ou POSTGRES_HOST doit être défini');
  hasErrors = true;
} else {
  if (envVars.DATABASE_URL) {
    // Masquer le mot de passe dans l'URL
    const maskedUrl = envVars.DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
    console.log(`✅ DATABASE_URL: ${maskedUrl}`);
  } else {
    console.log('⚠️  DATABASE_URL n\'est pas défini, utilisation des variables individuelles');
    if (envVars.POSTGRES_HOST) {
      console.log(`   ✅ POSTGRES_HOST: ${envVars.POSTGRES_HOST}`);
      console.log(`   ${envVars.POSTGRES_PORT ? '✅' : '⚠️ '} POSTGRES_PORT: ${envVars.POSTGRES_PORT || '5432 (défaut)'}`);
      console.log(`   ${envVars.POSTGRES_DATABASE ? '✅' : '⚠️ '} POSTGRES_DATABASE: ${envVars.POSTGRES_DATABASE || 'globe_telecom (défaut)'}`);
      console.log(`   ${envVars.POSTGRES_USER ? '✅' : '❌'} POSTGRES_USER: ${envVars.POSTGRES_USER ? envVars.POSTGRES_USER : '✗ non défini'}`);
      console.log(`   ${envVars.POSTGRES_PASSWORD ? '✅' : '❌'} POSTGRES_PASSWORD: ${envVars.POSTGRES_PASSWORD ? '***' : '✗ non défini'}`);
      
      if (!envVars.POSTGRES_USER || !envVars.POSTGRES_PASSWORD) {
        console.error('   ❌ POSTGRES_USER et POSTGRES_PASSWORD sont requis si DATABASE_URL n\'est pas défini');
        hasErrors = true;
      }
    }
  }
}

// Vérifier les variables d'authentification
if (!envVars.ADMIN_USER) {
  console.error('❌ ERREUR: ADMIN_USER n\'est pas défini');
  hasErrors = true;
} else {
  console.log(`✅ ADMIN_USER: ${envVars.ADMIN_USER}`);
}

if (!envVars.ADMIN_PASSWORD) {
  console.error('❌ ERREUR: ADMIN_PASSWORD n\'est pas défini');
  hasErrors = true;
} else {
  console.log(`✅ ADMIN_PASSWORD: ${'*'.repeat(envVars.ADMIN_PASSWORD.length)} (${envVars.ADMIN_PASSWORD.length} caractères)`);
}

// Afficher toutes les variables trouvées (pour debug)
console.log('\n📝 Toutes les variables trouvées:');
Object.keys(envVars).forEach(key => {
  if (key.includes('PASSWORD') || key.includes('SECRET')) {
    console.log(`   ${key}=***`);
  } else if (key.includes('DATABASE_URL')) {
    const masked = envVars[key].replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
    console.log(`   ${key}=${masked}`);
  } else {
    console.log(`   ${key}=${envVars[key]}`);
  }
});

console.log('\n📋 Résumé:');
if (hasErrors) {
  console.log('❌ Des variables d\'environnement sont manquantes dans votre fichier .env');
  console.log('\n💡 Vérifiez que votre fichier .env contient au minimum:');
  console.log('   - DATABASE_URL OU (POSTGRES_HOST + POSTGRES_USER + POSTGRES_PASSWORD)');
  console.log('   - ADMIN_USER');
  console.log('   - ADMIN_PASSWORD');
  process.exit(1);
} else {
  console.log('✅ Toutes les variables d\'environnement requises sont présentes dans le fichier');
  console.log('\n💡 Si l\'application ne fonctionne toujours pas, vérifiez:');
  console.log('   1. Que PostgreSQL est démarré et accessible');
  console.log('   2. Que la base de données "globe_telecom" existe');
  console.log('   3. Que le schéma "globetelecom" et la table "messages_contact" existent');
  console.log('   4. Que les identifiants de connexion sont corrects');
  console.log('   5. Redémarrez le serveur Next.js (Ctrl+C puis npm run dev)');
  console.log('   6. Les erreurs dans la console du navigateur (F12)');
  console.log('   7. Les erreurs dans le terminal où npm run dev est lancé');
}

