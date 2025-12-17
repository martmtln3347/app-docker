# On part de l'image officielle node
FROM node

# On exécute des commandes mkdir pour préparer les dossiers qui vont accueillir notre code
RUN mkdir /app && mkdir /app/src

# On définit /app comme le "WORKDIR"
# A partir de cette ligne, toutes les commandes sont relatives au dossier /app
WORKDIR /app

# Copie du fichier package.json (de votre machine) dans le dossier "."
# "." fait référence au dossier actuel, qui est notre WORKDIR (donc c'est /app)
COPY ./package.json .

# Installation des dépendances
# Grâce à notre WORKDIR, cette commande est effectuée depuis le dossier /app de l'image
RUN npm install

# On copie le reste du code dans l'image
COPY ./src ./src

# On définit la commande à lancer lorsque le conteneur démarre
# Notez la syntaxe reloue (mais très secure) : sous forme de liste, pas d'espace
CMD [ "npm", "run", "dev" ]