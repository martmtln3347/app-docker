export function formatConfig(cfg) {
  return {
    id: cfg._id,
    userId: cfg.userId,
    gameId: cfg.gameId,
    settings: cfg.settings,
    updatedAt: cfg.updatedAt
  };
}
