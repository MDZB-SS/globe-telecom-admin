import { Pool, PoolConfig } from 'pg';

// Construire DATABASE_URL si non défini mais que les variables individuelles le sont
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

const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Augmenter le nombre max de connexions
  min: 2, // Maintenir plus de connexions actives
  idleTimeoutMillis: 30000, // 30 secondes au lieu de 10
  connectionTimeoutMillis: 10000, // 10 secondes au lieu de 5
  keepAlive: true, // Maintenir les connexions actives
  keepAliveInitialDelayMillis: 10000, // Démarrer keepAlive après 10 secondes
};

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    if (!databaseUrl) {
      console.warn('⚠️  DATABASE_URL n\'est pas défini. Vérifiez votre fichier .env.local');
    }
    
    this.pool = new Pool(poolConfig);
    
    this.pool.on('error', (err) => {
      console.error('❌ Erreur inattendue sur le client de base de données:', err);
      
      // Ne pas quitter le processus, mais logger l'erreur
      // Le pool gérera automatiquement la reconnexion
      if (err.message?.includes('Connection terminated') || 
          err.message?.includes('timeout') ||
          err.code === 'ETIMEDOUT' ||
          err.code === 'ECONNRESET') {
        console.warn('⚠️  Connexion perdue, le pool tentera de se reconnecter automatiquement');
      }
    });
    
    // Surveiller les connexions pour détecter les problèmes
    this.pool.on('connect', () => {
      console.log('✅ Nouvelle connexion établie au pool');
    });
    
    this.pool.on('remove', () => {
      console.log('ℹ️  Connexion retirée du pool');
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[], retries: number = 2) {
    const start = Date.now();
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
      } catch (error: any) {
        const isLastAttempt = attempt === retries;
        const isTimeoutError = 
          error.message?.includes('timeout') || 
          error.message?.includes('Connection terminated') ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNRESET';
        
        // Si c'est une erreur de timeout et qu'il reste des tentatives, réessayer
        if (isTimeoutError && !isLastAttempt) {
          console.warn(`⚠️  Timeout de connexion (tentative ${attempt + 1}/${retries + 1}), nouvelle tentative...`);
          // Attendre un peu avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // Si la connexion est fermée, essayer de la rétablir
        if (error.message?.includes('Connection terminated') && !isLastAttempt) {
          console.warn(`⚠️  Connexion fermée (tentative ${attempt + 1}/${retries + 1}), reconnexion...`);
          // Attendre un peu avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        console.error('❌ Database query error:', error);
        
        // Messages d'erreur plus clairs selon le type d'erreur
        if (isTimeoutError) {
          console.error(`\n🔴 TIMEOUT DE CONNEXION:`);
          console.error(`   - La connexion à PostgreSQL a expiré`);
          console.error(`   - Cela peut être dû à:`);
          console.error(`     1. Un réseau lent ou instable`);
          console.error(`     2. Un serveur PostgreSQL surchargé`);
          console.error(`     3. Un pare-feu qui ferme les connexions inactives`);
          console.error(`     4. Des requêtes trop longues`);
          console.error(`\n💡 Solutions:`);
          console.error(`   - Vérifiez la connectivité réseau`);
          console.error(`   - Vérifiez les performances du serveur PostgreSQL`);
          console.error(`   - Augmentez les timeouts si nécessaire\n`);
        } else if (error.code === 'EACCES') {
          const host = process.env.POSTGRES_HOST || 'non défini';
          const port = process.env.POSTGRES_PORT || '5432';
          console.error(`\n🔴 ERREUR DE CONNEXION (EACCES):`);
          console.error(`   - Impossible de se connecter à PostgreSQL`);
          console.error(`   - Adresse: ${host}:${port}`);
          console.error(`\n💡 Solutions possibles:`);
          console.error(`   1. Vérifiez que PostgreSQL est démarré sur ${host}:${port}`);
          console.error(`   2. Vérifiez que le pare-feu autorise la connexion`);
          console.error(`   3. Vérifiez que l'adresse IP ${host} est accessible depuis cette machine`);
          console.error(`   4. Vérifiez que PostgreSQL écoute sur toutes les interfaces (0.0.0.0) ou sur ${host}`);
          console.error(`   5. Testez la connexion avec: psql -h ${host} -p ${port} -U ${process.env.POSTGRES_USER || 'votre_user'} -d ${process.env.POSTGRES_DATABASE || 'globe_telecom'}\n`);
        } else if (error.code === 'ECONNREFUSED') {
          console.error(`\n🔴 CONNEXION REFUSÉE:`);
          console.error(`   - PostgreSQL n'accepte pas la connexion`);
          console.error(`   - Vérifiez que le serveur PostgreSQL est démarré\n`);
        } else if (error.code === 'ENOTFOUND') {
          console.error(`\n🔴 HÔTE INTROUVABLE:`);
          console.error(`   - L'adresse ${error.address || 'non définie'} n'est pas accessible`);
          console.error(`   - Vérifiez que l'adresse IP est correcte\n`);
        } else if (error.code === '28P01' || error.message?.includes('password authentication failed')) {
          console.error(`\n🔴 ERREUR D'AUTHENTIFICATION:`);
          console.error(`   - Identifiants incorrects`);
          console.error(`   - Vérifiez POSTGRES_USER et POSTGRES_PASSWORD dans votre fichier .env\n`);
        } else if (error.code === '3D000' || (error.message?.includes('database') && error.message?.includes('does not exist'))) {
          console.error(`\n🔴 BASE DE DONNÉES INTROUVABLE:`);
          console.error(`   - La base de données "${process.env.POSTGRES_DATABASE || 'globe_telecom'}" n'existe pas`);
          console.error(`   - Créez-la avec: CREATE DATABASE globe_telecom;\n`);
        } else if (error.message?.includes('schema') || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error(`\n🔴 TABLE OU SCHÉMA INTROUVABLE:`);
          console.error(`   - Vérifiez que le schéma "public" existe`);
          console.error(`   - Vérifiez que la table "contact_requests" existe dans ce schéma`);
          console.error(`   - Exécutez le script SQL de création de table si nécessaire\n`);
        }
        
        throw error;
      }
    }
  }

  public async close() {
    await this.pool.end();
  }
}

export default Database.getInstance();