# On part d'une version Node.js légère
FROM node:20-alpine

# On se place dans le dossier /app du conteneur
WORKDIR /app

# On copie d'abord les fichiers de définition (pour le cache)
COPY package*.json ./

# On installe les dépendances
RUN npm install

# On copie le reste du projet
COPY . .

# On expose le port 3000
EXPOSE 3000

# La commande de démarrage
CMD ["npm", "run", "dev"]