import express from "express";
import { getLibrary, addToLibrary, removeFromLibrary } from "../Controleur/library.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Library
 *   description: Gestion de la librairie personnelle d’un utilisateur
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LibraryEntry:
 *       type: object
 *       required:
 *         - userId
 *         - gameId
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *           example: 2
 *         gameId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-10T14:32:00Z"
 */

/**
 * @swagger
 * /me/library:
 *   get:
 *     summary: Récupère la librairie de l’utilisateur connecté
 *     description: Retourne la liste des jeux possédés par l’utilisateur authentifié.
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des jeux dans la librairie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LibraryEntry'
 *       401:
 *         description: Utilisateur non authentifié
 *
 * /me/library/{gameId}:
 *   post:
 *     summary: Ajoute un jeu à la librairie
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du jeu à ajouter
 *     responses:
 *       201:
 *         description: Jeu ajouté à la librairie
 *       400:
 *         description: Données invalides ou jeu déjà présent
 *       401:
 *         description: Non authentifié
 *
 *   delete:
 *     summary: Retire un jeu de la librairie
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du jeu à retirer
 *     responses:
 *       200:
 *         description: Jeu retiré de la librairie
 *       404:
 *         description: Jeu introuvable dans la librairie
 */


router.get("/", authenticate, getLibrary);
router.post("/:gameId", authenticate, addToLibrary);
router.delete("/:gameId", authenticate, removeFromLibrary);

export default router;
