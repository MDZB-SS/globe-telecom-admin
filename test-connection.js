// Script de test de connexion à PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
}

// Construire DATABASE_URL si nécessaire
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.POSTGRES_HOST) {
  const user = process.env.POSTGRES_USER || '';
  const password = process.env.POSTGRES_PASSWORD || '';
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT || '5432';
  const database = process.env.POSTGRES_DATABASE || 'globe_telecom';
  
  // Encoder le user et password pour gérer les caractères spéciaux dans l'URL
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const credentials = user && password ? `${encodedUser}:${encodedPassword}@` : '';
  databaseUrl = `postgres://${credentials}${host}:${port}/${database}`;
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL ou POSTGRES_HOST doit être défini dans le fichier .env');
  process.exit(1);
}

// Masquer le mot de passe dans l'URL pour l'affichage
const maskedUrl = databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
console.log('🔄 Test de connexion à PostgreSQL...');
console.log(`📍 URL: ${maskedUrl}`);
console.log(`📍 Host: ${process.env.POSTGRES_HOST || 'depuis DATABASE_URL'}`);
console.log('');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000, // 30 secondes pour les connexions réseau lentes
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test de connectivité réseau basique
async function testNetworkConnectivity() {
  const { exec } = require('child_process');
  const host = process.env.POSTGRES_HOST || '192.168.0.111';
  const port = process.env.POSTGRES_PORT || '5432';
  
  return new Promise((resolve) => {
    console.log(`🔍 Test de connectivité réseau vers ${host}:${port}...`);
    
    // Sur Windows, utiliser Test-NetConnection ou telnet
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `Test-NetConnection -ComputerName ${host} -Port ${port} -InformationLevel Quiet`
      : `timeout 5 bash -c '</dev/tcp/${host}/${port}'`;
    
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.log(`⚠️  Le port ${port} n'est pas accessible depuis cette machine`);
        console.log(`   Cela peut indiquer un problème de pare-feu ou de réseau`);
        console.log(`   Vérifiez que le pare-feu Windows/autorise les connexions sortantes sur le port ${port}`);
        resolve(false);
      } else {
        console.log(`✅ Le port ${port} est accessible`);
        resolve(true);
      }
    });
  });
}

async function testConnection() {
  try {
    // Test de connectivité réseau d'abord
    const networkOk = await testNetworkConnectivity();
    console.log('');
    
    console.log('⏳ Tentative de connexion PostgreSQL...');
    
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    
    console.log('✅ Connexion réussie !');
    console.log(`⏰ Heure serveur: ${result.rows[0].current_time}`);
    console.log(`📦 Version PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    // Tester l'accès à la base de données
    try {
      const dbResult = await pool.query('SELECT current_database() as db');
      console.log(`💾 Base de données: ${dbResult.rows[0].db}`);
    } catch (e) {
      console.log(`⚠️  Impossible de récupérer le nom de la base de données: ${e.message}`);
    }
    
    // Tester l'accès au schéma public
    try {
      const schemaResult = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'public'
      `);
      if (schemaResult.rows.length > 0) {
        console.log('✅ Schéma "public" existe');
      } else {
        console.log('⚠️  Schéma "public" n\'existe pas');
      }
    } catch (e) {
      console.log(`⚠️  Impossible de vérifier le schéma: ${e.message}`);
    }
    
    // Tester l'accès à la table contact_requests
    try {
      const tableResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM public.contact_requests
      `);
      console.log(`✅ Table "contact_requests" accessible (${tableResult.rows[0].count} messages)`);
    } catch (e) {
      if (e.message.includes('does not exist')) {
        console.log('❌ Table "contact_requests" n\'existe pas dans le schéma "public"');
        console.log('   💡 Exécutez le script SQL de création de table fourni');
      } else {
        console.log(`⚠️  Erreur lors de l'accès à la table: ${e.message}`);
      }
    }
    
    await pool.end();
    console.log('\n✅ Tous les tests sont passés !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.error('Code:', error.code);
    
    const host = process.env.POSTGRES_HOST || '192.168.0.111';
    const port = process.env.POSTGRES_PORT || '5432';
    
    if (error.message?.includes('timeout') || error.message?.includes('Connection terminated')) {
      console.error('\n🔴 TIMEOUT DE CONNEXION - Problème probable de pare-feu ou réseau');
      console.error('\n💡 Solutions à vérifier:');
      console.error('\n1. 🔥 PARÈ-FEU WINDOWS:');
      console.error('   Ouvrez PowerShell en administrateur et exécutez:');
      console.error(`   New-NetFirewallRule -DisplayName "PostgreSQL ${port}" -Direction Outbound -LocalPort ${port} -Protocol TCP -Action Allow`);
      console.error(`   New-NetFirewallRule -DisplayName "PostgreSQL ${port}" -Direction Inbound -LocalPort ${port} -Protocol TCP -Action Allow`);
      console.error('\n2. 🌐 RÉSEAU:');
      console.error(`   Testez la connectivité avec: Test-NetConnection -ComputerName ${host} -Port ${port}`);
      console.error(`   Ou avec telnet: telnet ${host} ${port}`);
      console.error('\n3. 🖥️  SERVEUR POSTGRESQL:');
      console.error('   Vérifiez que PostgreSQL écoute sur toutes les interfaces (0.0.0.0)');
      console.error('   Vérifiez le fichier postgresql.conf: listen_addresses = \'*\'');
      console.error('   Vérifiez le fichier pg_hba.conf pour autoriser votre IP');
      console.error('\n4. 🔐 PARE-FEU SERVEUR:');
      console.error(`   Sur le serveur PostgreSQL, autorisez le port ${port}:`);
      console.error('   sudo ufw allow 5432/tcp  (Ubuntu/Debian)');
      console.error('   Ou configurez le pare-feu Windows du serveur');
    } else if (error.code === 'EACCES') {
      console.error('\n💡 Solutions possibles:');
      console.error('   1. Vérifiez que PostgreSQL est démarré');
      console.error('   2. Vérifiez que le pare-feu autorise la connexion');
      console.error('   3. Vérifiez que PostgreSQL écoute sur la bonne adresse IP');
      console.error('   4. Vérifiez que l\'adresse IP est accessible depuis cette machine');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL refuse la connexion. Vérifiez que le serveur est démarré.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Erreur d\'authentification. Vérifiez les identifiants dans votre fichier .env');
    } else if (error.code === '3D000') {
      console.error('\n💡 La base de données n\'existe pas. Créez-la avec: CREATE DATABASE globe_telecom;');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

