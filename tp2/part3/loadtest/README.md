But: fournir un test de charge contrôlé (pas d'attaque).

Prérequis :
- Testez uniquement sur des systèmes que vous possédez ou sur des environnements de staging.
- Installer `k6` (https://k6.io) ou utiliser l'image Docker `loadimpact/k6`.

Fichiers créés :
- `loadtest/k6-script.js` — script k6 paramétrable.

Exemples d'utilisation :

1) Avec k6 installé localement :

```bash
# envoyer 1000 requêtes réparties sur 50 VUs
TARGET_URL=http://localhost:3000/ VUS=50 ITERATIONS=1000 k6 run loadtest/k6-script.js
```

2) Avec Docker (pratique si k6 non installé) :

```bash
# depuis le dossier du projet
docker run --rm -i \
  -e TARGET_URL=http://host.docker.internal:3000/ \
  -e VUS=50 -e ITERATIONS=1000 \
  -v "${PWD}:/scripts" \
  loadimpact/k6 run /scripts/loadtest/k6-script.js
```

Conseils sûrs :
- Commencez petit (ITERATIONS=100, VUS=5) puis augmentez progressivement.
- Ne testez pas la production sans autorisation.
- Pour mesurer la latence totale de traitement côté serveur, exécutez le test contre une instance locale via `docker-compose` (app + base de données) et surveillez les métriques du serveur.

Interprétation rapide :
- `k6` affiche le temps total d'exécution, les percentiles, et le nombre d'erreurs.
- Ajustez `VUS` (concurrent virtual users) et `ITERATIONS` (nombre total de requêtes) selon vos besoins.

Si vous voulez, je peux :
- ajouter un `docker-compose.yml` de test qui lance votre app + MySQL + k6 (en mode contrôlé),
- ou générer un script Python local qui envoie des requêtes à rythme contrôlé (mais k6 est plus adapté).
