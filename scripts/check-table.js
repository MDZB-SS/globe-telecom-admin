// Script pour vérifier si la table contact_requests existe
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
  
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const credentials = user && password ? `${encodedUser}:${encodedPassword}@` : '';
  databaseUrl = `postgres://${credentials}${host}:${port}/${database}`;
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL ou POSTGRES_HOST doit être défini dans le fichier .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
});

async function checkTable() {
  try {
    console.log('🔍 Vérification de la table contact_requests...\n');
    
    // Vérifier si le schéma public existe
    const schemaCheck = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'public'
    `);
    
    if (schemaCheck.rows.length === 0) {
      console.error('❌ Le schéma "public" n\'existe pas');
      console.log('💡 Créez-le avec: CREATE SCHEMA public;');
      process.exit(1);
    }
    console.log('✅ Schéma "public" existe');
    
    // Vérifier si la table existe
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'contact_requests'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.error('\n❌ La table "contact_requests" n\'existe pas dans le schéma "public"');
      console.log('\n💡 Pour créer la table, exécutez le script SQL que vous avez fourni:');
      console.log('   psql -h 192.168.0.111 -U globe_user -d globe_telecom -f scripts/create-contact-table.sql');
      console.log('\n   Ou connectez-vous à PostgreSQL et exécutez le script SQL directement.');
      process.exit(1);
    }
    
    console.log('✅ Table "contact_requests" existe');
    
    // Vérifier les colonnes principales
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'contact_requests'
      ORDER BY ordinal_position
    `);
    
    console.log(`\n📋 Colonnes trouvées (${columnsCheck.rows.length}):`);
    const importantColumns = ['id', 'prenom', 'nom', 'email', 'clientType', 'created_at'];
    importantColumns.forEach(col => {
      const found = columnsCheck.rows.find(r => r.column_name === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.data_type})`);
      } else {
        console.log(`   ⚠️  ${col} - manquante`);
      }
    });
    
    // Compter les enregistrements
    const countResult = await pool.query('SELECT COUNT(*) as count FROM public.contact_requests');
    console.log(`\n📊 Nombre d'enregistrements: ${countResult.rows[0].count}`);
    
    await pool.end();
    console.log('\n✅ Tous les tests sont passés !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.message?.includes('does not exist')) {
      console.error('\n💡 La table contact_requests n\'existe pas. Exécutez le script SQL de création.');
    }
    await pool.end();
    process.exit(1);
  }
}

checkTable();

