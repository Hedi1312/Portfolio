import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

// Lire l'ancien fichier .env s'il existe
let oldEnv = '';
if (fs.existsSync(envPath)) {
  oldEnv = fs.readFileSync(envPath, 'utf8');
}

console.log('🔄 Téléchargement des secrets depuis Doppler...');

try {
  // Exécuter doppler et récupérer la sortie standard (les nouvelles variables d'env)
  const newEnv = execSync('doppler secrets download --no-file --format env', { encoding: 'utf8' });

  // Écrire le nouveau .env
  fs.writeFileSync(envPath, newEnv, 'utf8');

  // Parse les deux fichiers pour comparer
  const parseEnv = (content) => {
    return content.split('\n').reduce((acc, line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        acc[match[1]] = match[2];
      }
      return acc;
    }, {});
  };

  const oldParsed = parseEnv(oldEnv);
  const newParsed = parseEnv(newEnv);

  let addedCount = 0;
  let modifiedCount = 0;
  let deletedCount = 0;

  for (const [key, value] of Object.entries(newParsed)) {
    if (!(key in oldParsed)) {
      addedCount++;
    } else if (oldParsed[key] !== value) {
      modifiedCount++;
    }
  }

  for (const key in oldParsed) {
    if (!(key in newParsed)) {
      deletedCount++;
    }
  }

  console.log(
    `✅ Succès ! ${addedCount} ajoutée(s), ${modifiedCount} modifiée(s), ${deletedCount} supprimée(s).`,
  );
} catch (error) {
  console.error('❌ Erreur lors du téléchargement des secrets:', error.message);
  process.exit(1);
}
