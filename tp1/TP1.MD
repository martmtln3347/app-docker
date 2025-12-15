🌞 Lancez un conteneur mysql en version 8.4 : 

PC@DESKTOP-TQF20R1 MINGW64 ~
$ docker run --name mysql mysql:8.4
Unable to find image 'mysql:8.4' locally
8.4: Pulling from library/mysql

🌞 Vérifier que le conteneur est actif :

$ docker ps -a
CONTAINER ID   IMAGE                             COMMAND                  CREATED                                       PORTS     NAMES
e479bcc6602b   mysql:8.4                         "docker-entrypoint.s…"   About a minute ago   (1) About a minute ago             mysql

🌞 Consulter les logs du conteneur : 

PC@DESKTOP-TQF20R1 MINGW64 ~
$ docker logs mysql
2025-12-15 09:31:48+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.4.7-1.el9 started.
2025-12-15 09:31:49+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2025-12-15 09:31:49+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.4.7-1.el9 started.
2025-12-15 09:31:49+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
    You need to specify one of the following as an environment variable:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD

🌞 Supprimer le conteneur inactif

$ docker rm mysql
mysql

🌞 Lancer un nouveau conteneur MySQL, vous devez définir un mot de passe pour l'utilisateur root du serveur MySQL

PC@DESKTOP-TQF20R1 MINGW64 ~
$ docker run -e MYSQL_ROOT_PASSWORD=root --name mysql mysql:8.4


2. Un PMA pour accompagner la DB

🌞 Lancer un conteneur PHPMyAdmin

docker run --name phpmyadmin -d --link mysql:db -p 8080:80 phpmyadmin

🌞 Visitez l'interface web de PHPMyAdmin

$ curl http://localhost:8080
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0


3. Compose

🌞 Créer un fichier compose.yml qui a le contenu suivant :

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents
$ cd tp_conteneur/tp1/

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ touch compose.yml

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ vim compose.yml

:wq

🌞 Remplacer par les bonnes valeurs :

$ vim compose.yml

services:
  db:
    image: mysql:8.4
    environment:
      - MYSQL_ROOT_PASSWORD=root

  pma:
    image: phpmyadmin
    ports:
      - "8080:80"

🌞 Lancer la stack compose

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ docker compose up
 Container tp1-db-1  Creating
 Container tp1-db-1  Created
Attaching to db-1, pma-1
db-1  | 2025-12-15 10:40:24+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.4.7-1.el9 started.


🌞 Visitez l'interface Web de PHPMyAdmin et curl

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ curl http://localhost:8080
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0<!doctype html>
<html lang="en" dir="ltr">


🌞 Ajouter la gestion d'un volume à votre compose.yml

services:
  db:
    image: mysql:8.4
    environment:
      - MYSQL_ROOT_PASSWORD=root
    volumes:
      - db_data:/var/lib/mysql

  pma:
    image: phpmyadmin
    ports:
      - "8080:80"

volumes:
   db_data:      

🌞 Prouver que le volume est bien utilisé

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ docker compose up -d
 Container tp1-db-1  Starting
 Container tp1-pma-1  Starting
 Container tp1-pma-1  Started
 Container tp1-db-1  Started

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ docker volume ls
DRIVER    VOLUME NAME
local     3cef1c7bef291cf25894502b74fac7447cecd3573a614c67cef1403006db7395
local     6e33d490be0704526f302f401200658b659011bafd78478675c710aec6c366aa
local     9b7b4905dcad4079ee48d1112ba031dee95978c4a7bf045c6d98e859053aff80
local     27a1a0e201ffc3548b358237e417a840e78ba6561a3583b94c777d0b845f5fda
local     31d79c2805ddf11dc67f537bc4ac332082f19762cf80aa3d3149092af5cb86fd
local     079f82e67f869a50b5124eed2fb7f0305cba65672418d177e6f0454716948161
local     436c392b0a017c143455ce53fede531cd90bf8c4a19b174d27e1a023221ec8f5
local     709f4d51ea584573dd2a9a1d65b79f029e3e8d74fc41d5db6e9bfbef1095eb7c
local     3489b96aa17a8135ba6aaa1a7f124db708b01e02519b8c1648a9cc3b1c75d973
local     6515bbf62a083792adf76708f78ff0f713468d1d4d1fc835152f70c1959461e5
local     151661bf16d3fd253abfe69e9174cd1ac9eefa7c4d3a2eab16d03bc744bbcc44
local     242303b24d1c3c0a48a20166ca04a404e3beffa637094bc50c4d662bacfa42b2
local     b387b59ff0005c6b887f58d95f11a318e7926ba147a2cbfd8b029ebf2ad00bf1
local     c8c468d56a99d3dc328b568f4fc4579e17ff4ce3a88efb49eb5f06ea08d46de3
local     c78c0454a6e3ac1c7edb2dcf66acc539c1ce04cb6f7480197ddae22bc09731b1
local     ee4244fc2501677f5b68784360540e17c9a4c26fe6359a012d0736a942708cc9
local     express-archi-test-qualite-b3-efrei_postgres_data
local     express-archi-test-qualite_postgres_data
local     express-archi-test-qualite_sonardb_data
local     express-archi-test-qualite_sonarqube_data
local     express-archi-test-qualite_sonarqube_extensions
local     express-archi-test-qualite_sonarqube_logs
local     f792f0e425273ebbe1598d92ad3206d45fb6847aa84b189b01442f99b620415d
local     tp1_db_data

🌞 Proposer un nouveau compose.yml

services:
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD=root
    volumes:
      - db_data:/var/lib/postgresql/data

  pma:
    image: adminer
    ports:
      - "8080:8080"

volumes:
   db_data:      


🌞 Prouver que ça run !

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/tp1 (main)
$ docker ps
CONTAINER ID   IMAGE       COMMAND                  CREATED              STATUS          PORTS                                         NAMES
3de04d6cc123   adminer     "entrypoint.sh docke…"   About a minute ago   Up 18 seconds   0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp   tp1-adminer-1
2dc14148703c   mysql:8.4   "docker-entrypoint.s…"   10 minutes ago       Up 10 minutes   3306/tcp, 33060/tcp                           gracious_kapitsa
