import Game from '../Modele/game.model.js';
import { formatGame } from '../Vue/game.view.js';

export async function listGames(req, res) {
  const games = await Game.findAll();
  res.json(games.map(formatGame));
}

export async function addGame(req, res) {
  try {
    const { slug, title, publisher, releasedAt } = req.body;
    const game = await Game.create({ slug, title, publisher, releasedAt });
    res.status(201).json(formatGame(game));
  } catch (err) {
    res.status(400).json({ error: 'Impossible d’ajouter le jeu', details: err.message });
  }
}

export async function updateGame(req, res) {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) return res.status(404).json({ error: 'Jeu introuvable' });
    await game.update(req.body);
    res.json(formatGame(game));
  } catch (err) {
    res.status(400).json({ error: 'Impossible de modifier le jeu', details: err.message });
  }
}

export async function deleteGame(req, res) {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) return res.status(404).json({ error: 'Jeu introuvable' });
    await game.destroy();
    res.json({ message: 'Jeu supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression', details: err.message });
  }
}
