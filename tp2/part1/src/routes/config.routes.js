import express from "express";
import { getConfig, updateConfig } from "../Controleur/config.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Configs
 *   description: Gestion des configurations de jeux pour chaque utilisateur (MongoDB)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Config:
 *       type: object
 *       required:
 *         - userId
 *         - gameId
 *       properties:
 *         _id:
 *           type: string
 *           example: "67a3bfad27a22a9dc7f4b231"
 *         userId:
 *           type: integer
 *           example: 2
 *         gameId:
 *           type: integer
 *           example: 3
 *         settings:
 *           type: object
 *           example:
 *             resolution: "1920x1080"
 *             fullscreen: true
 *             volume: 75
 *             difficulty: "normal"
 *             language: "fr"
 *             dlcs: ["DLC1"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-10T14:35:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-11T10:02:00Z"
 */

/**
 * @swagger
 * /me/configs/{gameId}:
 *   get:
 *     summary: Récupère la configuration d’un jeu
 *     description: Renvoie la configuration MongoDB d’un jeu pour l’utilisateur authentifié.
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du jeu dont on veut la configuration
 *     responses:
 *       200:
 *         description: Configuration trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *       404:
 *         description: Aucune configuration trouvée
 *       401:
 *         description: Non authentifié
 *
 *   put:
 *     summary: Crée ou met à jour la configuration d’un jeu
 *     description: Le corps de la requête correspond directement à l'objet <settings>.
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du jeu concerné
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *                 example: "2560x1440"
 *               fullscreen:
 *                 type: boolean
 *                 example: false
 *               volume:
 *                 type: integer
 *                 example: 80
 *               difficulty:
 *                 type: string
 *                 example: "hard"
 *               language:
 *                 type: string
 *                 example: "fr"
 *               dlcs:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Blood & Wine"]
 *     responses:
 *       200:
 *         description: Configuration mise à jour
 *       201:
 *         description: Nouvelle configuration créée
 *       401:
 *         description: Non authentifié
 */

router.get("/:gameId", authenticate, getConfig);
router.put("/:gameId", authenticate, updateConfig);

export default router;
