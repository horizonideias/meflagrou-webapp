#!/bin/bash
# =========================================================================
# MEFLAGROU.COM - SCRIPT AUTOMATIZADO DE INSTALAÇÃO EM VPS (UBUNTU / DEBIAN)
# =========================================================================

set -e

echo "🚀 [1/5] Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

echo "🐳 [2/5] Instalando Docker e Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    sudo apt install docker-compose -y
fi

echo "📦 [3/5] Configurando diretórios do meflagrou.com..."
mkdir -p /var/www/meflagrou/themes/meflagrou
mkdir -p /var/www/meflagrou/plugins/meflagrou-core

echo "⚡ [4/5] Iniciando contêineres Docker (WordPress 6.7 + MariaDB 10.11)..."
cd /var/www/meflagrou
docker-compose up -d

echo "🎉 [5/5] Instalação concluída com sucesso!"
echo "--------------------------------------------------------"
echo "🌐 Acesse seu site em: http://$(curl -s ifconfig.me)"
echo "🔐 Painel WordPress: http://$(curl -s ifconfig.me)/wp-admin"
echo "--------------------------------------------------------"
