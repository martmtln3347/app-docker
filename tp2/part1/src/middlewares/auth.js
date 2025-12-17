import jwt from "jsonwebtoken";

// =============================
// 🔐 AUTHENTICATE
// =============================
// Vérifie la présence et la validité du token JWT
export function authenticate(req, res, next) {
  // Autoriser aussi l’en-tête "Authorization" avec majuscule (selon le test runner)
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }

  // Supporte à la fois "Bearer <token>" et "<token>" seul
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) {
    return res.status(401).json({ error: "Token invalide" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, roles }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }
}

// =============================
// 🧩 AUTHORIZE ROLE
// =============================
// Vérifie que l'utilisateur possède un rôle requis
export function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ error: "Accès interdit : aucun rôle détecté" });
    }

    // Normalisation → accepte ADMIN ou ROLE_ADMIN
    const normalizedRoles = req.user.roles.map((r) => r.toUpperCase());
    const target = requiredRole.toUpperCase();
    const prefixed = `ROLE_${target}`;

    if (!normalizedRoles.includes(target) && !normalizedRoles.includes(prefixed)) {
      return res
        .status(403)
        .json({ error: `Accès interdit : rôle ${requiredRole} requis` });
    }

    next();
  };
}
