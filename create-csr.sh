#!/bin/bash

# Создание Certificate Signing Request для iOS Distribution Certificate

echo "Creating Certificate Signing Request..."

# Создаем приватный ключ
openssl genrsa -out ios_distribution.key 2048

# Создаем CSR
openssl req -new -key ios_distribution.key -out ios_distribution.csr -subj "/emailAddress=iskander.bemmuratov@gmail.com/CN=MebelPlace Distribution/C=KZ"

echo "✅ CSR created successfully!"
echo ""
echo "Files created:"
echo "  - ios_distribution.key (private key - KEEP THIS SAFE!)"
echo "  - ios_distribution.csr (certificate request)"
echo ""
echo "Next steps:"
echo "1. Go to https://developer.apple.com/account/resources/certificates/add"
echo "2. Select 'iOS Distribution (App Store and Ad Hoc)'"
echo "3. Upload ios_distribution.csr file"
echo "4. Download the certificate (ios_distribution.cer)"
echo "5. Convert to .p12 using: ./convert-to-p12.sh"

