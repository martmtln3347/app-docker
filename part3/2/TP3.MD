



🌞 Récupérer le dernier compose.yml, le copier dans part3/2/compose.yml et ajouter

services:
  db:
    image: mysql:8.4
    environment:
      - MYSQL_ROOT_PASSWORD=root
    volumes:
      - db_data:/var/lib/mysql

  pyroscope:
    image: grafana/pyroscope:latest

  tempo:
    image: grafana/tempo:latest
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml 

  prometheus:
    image: prom/prometheus:latest
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom_data:/prometheus
    ports:
      - "9090:9090"
    restart: always
    depends_on:
      - tempo   

  grafana:
    image: grafana/grafana:latest
    ports:
      - "8000:3000"
    environment:
      - GF_PLUGINS_PREINSTALL_SYNC=grafana-pyroscope-app
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_AUTH_DISABLE_LOGIN_FORM=true
    depends_on:
      - prometheus        

  phpmyadmin:
    image: phpmyadmin
    ports:
      - "8080:80"

  app: 
    image: shitty_app:1.0
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
    environment:
      - DB_HOST=db # en supposant que vous avez bien déclaré votre conteneur MySQL avec le nom "db"
      - DB_USER=root
      - DB_PASSWORD=root
      - DB_NAME=shitty_app_db
      - DB_PORT=3306
      - PORT=3000
      - OTEL_SERVICE_NAME=shitty_app
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf    

volumes:
  db_data:
   - "/my/own/datadir:/var/lib/mysql"
  prom_data:


🌞 Lancer la stack

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/part3/2 (main)
$ curl http://localhost:8000
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0


PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/part3/2 (main)
$ curl http://localhost:3000
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0

🌞 Preuve que ça tourne !

PC@DESKTOP-TQF20R1 MINGW64 ~/Documents/tp_conteneur/part3/2 (main)
$ docker compose ps
NAME             IMAGE                      COMMAND                  SERVICE      CREATED          STATUS          PORTS
2-app-1          shitty_app:1.0             "docker-entrypoint.s…"   app          10 minutes ago   Up 7 minutes    0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
2-db-1           mysql:8.4                  "docker-entrypoint.s…"   db           10 minutes ago   Up 10 minutes   3306/tcp, 33060/tcp
2-grafana-1      grafana/grafana:latest     "/run.sh"                grafana      10 minutes ago   Up 7 minutes    0.0.0.0:8000->3000/tcp, [::]:8000->3000/tcp
2-phpmyadmin-1   phpmyadmin                 "/docker-entrypoint.…"   phpmyadmin   10 minutes ago   Up 7 minutes    0.0.0.0:8080->80/tcp, [::]:8080->80/tcp
2-prometheus-1   prom/prometheus:latest     "/bin/prometheus --c…"   prometheus   10 minutes ago   Up 7 minutes    0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp
2-pyroscope-1    grafana/pyroscope:latest   "/usr/bin/pyroscope …"   pyroscope    10 minutes ago   Up 10 minutes   4040/tcp
2-tempo-1        grafana/tempo:latest       "/tempo -config.file…"   tempo        10 minutes ago   Up 10 minutes

🌞 En vous aidant de la WebUI

Temps moyen route API GET / = 10 ms
temps moyen de réponse de la route API POST /add = 12 ms
quantité de RAM utilisée pour un GET / = 45.234375