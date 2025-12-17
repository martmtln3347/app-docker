import bcrypt from "bcrypt";

const passwords = ["password"]; // liste des mots de passe à hasher
for (const pwd of passwords) {
  const hash = await bcrypt.hash(pwd, 10); // 10 = "salt rounds"
  console.log(`${pwd} => ${hash}`);
}
