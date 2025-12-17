export function formatGame(game) {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    publisher: game.publisher,
    releasedAt: game.releasedAt
  };
}
