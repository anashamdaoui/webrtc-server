#! /bin/bash

echo "Mettre à jour le système"
sudo apt-get update
sudo apt-get upgrade -y

echo "Installer les prérequis"
sudo apt-get install -y ca-certificates curl gnupg git vim net-tools netfilter-persistent iptables-persistent 

echo "Ajouter la clé GPG officielle de Docker"
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "Configurer le repository Docker"
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Mettre à jour et installer Docker"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Démarrer et activer Docker"
sudo systemctl start docker
sudo systemctl enable docker

echo "Ajouter votre utilisateur au groupe docker (optionnel, pour éviter d'utiliser sudo)"
sudo usermod -aG docker $USER

echo "Générer une clé SSH pour github"
ssh-keygen -t ed25519 -C "anashamdaoui@gmail.com"

echo "Ajouter la clé SSH à github"
cat ~/.ssh/id_ed25519.pub
echo "Copier la clé SSH et l'ajouter à github"

echo "Appuillez sur une touche pour continuer"
read

echo "Cloner le dépôt"
git clone git@github.com:anashamdaoui/webrtc.git

echo "Builder l'image docker"
cd webrtc
sudo docker build -t webrtc-app:latest .

echo "Vérifier que le conteneur est en cours d'exécution"
sudo docker ps

echo "Installer Certbot et le plugin Nginx"
sudo apt install certbot python3-certbot-nginx -y

echo "Générer un certificat auto-signé"
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"

echo "Configurer Nginx avec le certificat auto-signé"
sudo cp nginx/webrtc-app.conf /etc/nginx/sites-available/webrtc-app.conf
sudo ln -s /etc/nginx/sites-available/webrtc-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo netstat -tulpn | grep nginx


echo "Configurer les règles de sécurité du firewall"
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save

echo "Lancer le conteneur"
sudo docker run -d -p 3000:3000 webrtc-app:latest
sudo docker ps

echo "Se référer au README.md pour le troubleshooting"

