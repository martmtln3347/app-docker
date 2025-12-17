import bcrypt from "bcrypt";

const hash = "$2b$10$eMs7NhZvZU5rwjhkRSazyOGa2mdxiMrSf3L/y0tG03lXfHUrMZV.G"; // mets ici le hash que tu as trouvé
(async () => {
  const ok = await bcrypt.compare("password", hash);
  console.log("compare result:", ok);
})();
