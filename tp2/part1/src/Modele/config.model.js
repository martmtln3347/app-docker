import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, index: true },
    gameId: { type: Number, required: true, index: true },
    settings: {
      difficulty: { type: String, default: "normal" },
      resolution: { type: String, default: "1080p" },
      language: { type: String, default: "fr" },
      dlcs: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
    collection: "game_configs", // aligne avec ta collection existante
  }
);

// 1 config par (userId, gameId)
configSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export default mongoose.model("GameConfig", configSchema);
