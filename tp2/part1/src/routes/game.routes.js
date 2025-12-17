import { Router } from "express";
import { listGames, addGame, updateGame, deleteGame } from "../Controleur/game.controller.js";
import { authenticate, authorizeRole } from "../middlewares/auth.js";

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Gestion des jeux (CRUD)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - slug
 *         - title
 *         - publisher
 *         - dateSortie
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         slug:
 *           type: string
 *           example: "witcher-3"
 *         title:
 *           type: string
 *           example: "The Witcher 3: Wild Hunt"
 *         publisher:
 *           type: string
 *           example: "CD Projekt"
 *         dateSortie:
 *           type: string
 *           example: "2015-05-19"
 */

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Liste tous les jeux
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Liste des jeux disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *   post:
 *     summary: Ajoute un nouveau jeu (ADMIN)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: Jeu créé
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit (non admin)
 *
 * /games/{id}:
 *   patch:
 *     summary: Modifie un jeu existant (ADMIN)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: Jeu modifié
 *       404:
 *         description: Jeu introuvable
 *   delete:
 *     summary: Supprime un jeu (ADMIN)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Jeu supprimé
 *       403:
 *         description: Accès interdit (non admin)
 *       404:
 *         description: Jeu introuvable
 */

const router = Router();

// Liste publique des jeux
router.get("/", listGames);

// Routes protégées (ADMIN)
router.post("/", authenticate, authorizeRole("ADMIN"), addGame);
router.patch("/:id", authenticate, authorizeRole("ADMIN"), updateGame);
router.delete("/:id", authenticate, authorizeRole("ADMIN"), deleteGame);

export default router;
