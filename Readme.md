# Application de Visioconférence WebRTC

## Configuration SSL/TLS

La sécurisation des communications est obligatoire pour WebRTC. Voici les deux méthodes de configuration SSL/TLS selon votre environnement.

### Environnement de Développement (avec certificat auto-signé)
Pre-requis :
- Node.js
- Nginx
- Certbot
- Docker

1. **Installer Certbot et le plugin Nginx**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Générer un certificat auto-signé**
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"
```

3. **Configurer Nginx avec le certificat auto-signé**
```bash
sudo cp nginx/webrtc-app.conf /etc/nginx/sites-available/webrtc-app.conf
sudo ln -s /etc/nginx/sites-available/webrtc-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Configurer les règles de sécurité du firewall**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
sudo ufw enable
```

#### Dans la console Oracle Cloud :
a. Aller dans Networking > Virtual Cloud Networks
b. Sélectionner votre VCN
c. Ajouter des règles d'entrée pour les ports :
    - 80 (HTTP)
    - 443 (HTTPS)

5. **Démarrer le serveur Node.js**
```bash
sudo docker run -d -p 3000:3000 webrtc-app:latest
```

6. **Tester la connexion**
```bash
curl -k https://localhost:443
```

### Environnement de Production (avec certificat Let's Encrypt)

1. **Installer Certbot et le plugin Nginx**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Obtenir un certificat Let's Encrypt**
```bash
sudo certbot --nginx -d yourdomain.com
```

3. **Configurer Nginx avec le certificat Let's Encrypt**
```bash
sudo cp nginx/webrtc-app.conf /etc/nginx/sites-available/webrtc-app.conf
sudo ln -s /etc/nginx/sites-available/webrtc-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Configurer les règles de sécurité du firewall**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
sudo ufw enable
```

5. **Démarrer le serveur Node.js**
```bash
sudo docker run -d -p 3000:3000 webrtc-app:latest
```

6. **Tester la connexion**
```bash
curl -k https://yourdomain.com:443
```

### Troubleshooting
1. Nginx ecoute sur les ports 80 et 443
```bash
sudo netstat -tulpn | grep nginx
```
``` 
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      8759/nginx: master
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      8759/nginx: master
tcp6       0      0 :::80                   :::*                    LISTEN      8759/nginx: master
tcp6       0      0 :::443                  :::*                    LISTEN      8759/nginx: master
```
Si ce n'est pas le cas, redémarrer le serveur Nginx
```bash
sudo systemctl restart nginx
```
Si nginx n'écoute pas sur les ports 80 et 443, vérifier les points suivants :
a. Verifier que le module SSL de Nginx est installé
```bash
nginx -V 2>&1 | grep -o with-http_ssl_module
```
b. Si le module est présent Verifier que:
- les certificats sont présents dans le répertoire /etc/nginx/ssl et leurs permissions sont correctes
```bash
ls -l /etc/nginx/ssl
```
```
-rw-r--r-- 1 www-data www-data 1269 Jan  2 10:49 nginx.crt
-rw------- 1 www-data www-data 1704 Jan  2 10:49 nginx.key
```
Sinon corrigez les permissions des fichiers:
```bash
sudo chmod 644 /etc/nginx/ssl/nginx.crt
sudo chmod 600 /etc/nginx/ssl/nginx.key
sudo chown www-data:www-data /etc/nginx/ssl/nginx.*
```
c. La configuration Nginx est bien chargée
- Vérifier que le lien symbolique existe
```bash
ls -l /etc/nginx/sites-enabled/webrtc-app.conf
```
- Si non, le créer
```bash
sudo ln -s /etc/nginx/sites-available/webrtc-app.conf /etc/nginx/sites-enabled/
```
Redémarrer le serveur Nginx
```bash
sudo systemctl restart nginx
```
2. La configuration Nginx remonte des conflits
```bash
sudo nginx -t
```
```
2025/01/02 11:44:46 [warn] 8815#8815: conflicting server name "_" on 0.0.0.0:80, ignored
2025/01/02 11:44:46 [warn] 8815#8815: conflicting server name "_" on [::]:80, ignored
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```
a. Désactiver la configuration par défaut de Nginx
```bash
sudo rm /etc/nginx/sites-enabled/default
``` 
b. Vérifier que la configuration Nginx est correcte
```bash
sudo nginx -t
```
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```
c. Redémarrer le serveur Nginx
```bash
sudo systemctl restart nginx
```
3. Le serveur Node.js ecoute sur le port 3000
```bash
sudo netstat -tulpn | grep node
```
```
tcp        0      0 0.0.0.0:3000          0.0.0.0:*               LISTEN      8759/node
```
3. Le firewall autorise les ports 80 et 443
```bash
sudo ufw status
```
```
Status: active
```
4. Le certificat Let's Encrypt est valide

5. Le serveur Node.js est en cours d'exécution
```bash
sudo docker ps
```
```
CONTAINER ID   IMAGE               COMMAND                  CREATED          STATUS          PORTS                                       NAMES
52bf95e01373   webrtc-app:latest   "docker-entrypoint.s…"   56 minutes ago   Up 38 minutes   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp   romantic_pascal
```
