#!/bin/bash

# Deploy script para ITO Game
# Uso: ./deploy.sh "mensagem do commit"

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER="root@159.89.152.188"
KEY="~/.ssh/id_rsa"

echo -e "${YELLOW}🚀 Iniciando deploy do ITO...${NC}\n"

# 1. Commit e push (se tiver mensagem)
if [ -n "$1" ]; then
    echo -e "${GREEN}📝 Commitando alterações...${NC}"
    git add .
    git commit -m "$1" || true
    git push origin main
else
    echo -e "${GREEN}📤 Pushando alterações existentes...${NC}"
    git push origin main 2>/dev/null || echo "Nada para pushar"
fi

# 2. Atualizar servidor
echo -e "\n${GREEN}🔄 Atualizando servidor...${NC}"
ssh -i $KEY $SERVER "cd /var/www/ito && git pull && cd client && npm install && cd .. && npm run build && pm2 restart ito"

echo -e "\n${GREEN}✅ Deploy concluído!${NC}"
echo -e "🌐 Acesse: http://159.89.152.188"
