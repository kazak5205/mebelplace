#!/bin/bash

# SSH Keys Setup for GitHub Actions Auto-Deploy
# Run this script on your VPS server

echo "🔐 Setting up SSH keys for GitHub Actions..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Public key for GitHub Actions
PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDFLu25P+GrWMMYSOM5iec3jTfJ1x4zQhrcl7ml+8k6uC1vpCubiK5LI9zqqi+b+3aIR8MoE7m9uN6i6zOTsvYxcZ4iPoHFCau81JRRyZpfLMebn75L+L22TpAd2pobm2i77NChB/kccNZT/Ic4oN+Bc9xbsrX+So1Ym2HZ0E5C8gZbzXxBQggN25SAQvkciyIAowEgCIrcSl5XGm5CTRUQFb3DVqhoJ/BV65eZ3JIJTkvqGKL5MpKFNddBh5kPPoYhO8ZNUMcbJuwrI5+U1xRhDjAcp7ksEZ6oYLHJaxudENZGN7HOs7k9b/BFFtGuXqrvVO0e3qDz1NfCl1DzqKMC0/42Z29klP6eK/Dcba+CLKT7ZD8/7COrMQSJ/4bb25wTfBjYd7hSVc36CPpvdoRK8ZrcVViQfEooAnc1cz3egtsdMBjnG7swtG6PSzv0SNNCD4aBsb9EHIEw4qKnz1dOlAu4yFVBypLua4XZsArcG37JhZPKTU01jEZkhlolhjW7fLQ35d5YCqJB7C98cXb0/JP12DO8Wlvf7WZ57HNCdOnMmV+9AT481dTHVe0LJ2K/5n4L78d/dQ5zEVDc/FKBp0ge8sDOMuO0+TEsKrntGZNcBsqwpoVklzvRoPR2JI4ntMhfwEw3mumVmtpPQ4YWW33SIIT/JrAHWvIKhFDAXQ== mebelplace-auto-deploy@github-actions"

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add public key to authorized_keys
echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo -e "${GREEN}✅ Public key added to authorized_keys${NC}"

# Check if key already exists
if grep -q "mebelplace-auto-deploy@github-actions" ~/.ssh/authorized_keys; then
    echo -e "${GREEN}✅ SSH key configured successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Key might not have been added correctly${NC}"
fi

# Display authorized keys count
KEY_COUNT=$(grep -c "^ssh-" ~/.ssh/authorized_keys)
echo -e "${GREEN}📋 Total authorized keys: $KEY_COUNT${NC}"

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Test SSH connection from your local machine"
echo "2. Add the PRIVATE key to GitHub Secrets as VPS_SSH_KEY"
echo "3. Configure other GitHub Secrets (VPS_HOST, VPS_USERNAME, VPS_PORT)"
echo ""
echo -e "${YELLOW}Important: Make sure you have the private key stored securely!${NC}"

