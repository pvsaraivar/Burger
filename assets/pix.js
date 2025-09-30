// Configuração da API PIX da Fire Banking
const FIRE_BANKING_API = {
    baseUrl: 'https://api.firebanking.com.br',
    clientId: 'SEU_CLIENT_ID', // Substitua pelo seu Client ID da Fire Banking
    clientSecret: 'SEU_CLIENT_SECRET', // Substitua pelo seu Client Secret da Fire Banking
    pixKey: 'SUA_CHAVE_PIX', // Substitua pela sua chave PIX cadastrada na Fire Banking
    merchantName: 'Clau Burger',
    merchantCity: 'São Paulo'
};

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const pixForm = document.getElementById('pixPaymentForm');
    const generatePixButton = document.getElementById('generatePixButton');
    const pixQrCodeContainer = document.getElementById('pixQrCodeContainer');
    const pixQrCodeElement = document.getElementById('pixQrCode');
    const pixCopyPasteElement = document.getElementById('pixCopyPaste');
    const pixStatusElement = document.getElementById('pixStatus');
    
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
        }
        
        e.target.value = value;
    });
    
    // Evento de clique no botão de gerar PIX
    generatePixButton.addEventListener('click', function() {
        if (pixForm.checkValidity()) {
            generatePix();
        } else {
            pixForm.reportValidity();
        }
    });
    
    // Função para obter token de autenticação da Fire Banking
    async function getFireBankingToken() {
        try {
            // Em um ambiente real, esta chamada deve ser feita pelo backend para proteger suas credenciais
            const response = await fetch(`${FIRE_BANKING_API.baseUrl}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'client_id': FIRE_BANKING_API.clientId,
                    'client_secret': FIRE_BANKING_API.clientSecret
                })
            });
            
            if (!response.ok) {
                throw new Error('Falha na autenticação com a Fire Banking');
            }
            
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Erro ao obter token:', error);
            throw error;
        }
    }
    
    // Função para gerar o PIX
    async function generatePix() {
        const name = document.getElementById('name').value;
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        
        // Mostrar indicador de carregamento
        generatePixButton.textContent = 'Gerando...';
        generatePixButton.disabled = true;
        updatePixStatus('Conectando com a Fire Banking...', 'pending');
        
        try {
            // Obter token de autenticação
            const token = await getFireBankingToken();
            
            // Criar cobrança PIX na Fire Banking
            const pixData = await createFireBankingPixCharge(token, {
                name,
                cpf,
                amount,
                description
            });
            
            // Exibir o QR Code
            displayPixQrCode(pixData);
            
            // Iniciar verificação de pagamento
            checkPaymentStatus(pixData.transactionId, token);
            
        } catch (error) {
            updatePixStatus(`Erro: ${error.message}`, 'error');
            console.error('Erro ao gerar PIX:', error);
        } finally {
            // Restaurar o botão
            generatePixButton.textContent = 'Gerar QR Code PIX';
            generatePixButton.disabled = false;
        }
    }
    
    // Função para criar cobrança PIX na Fire Banking
    async function createFireBankingPixCharge(token, data) {
        try {
            updatePixStatus('Gerando cobrança PIX...', 'pending');
            
            // Em um ambiente real, esta chamada deve ser feita pelo backend
            const response = await fetch(`${FIRE_BANKING_API.baseUrl}/api/v1/pix/charges`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pixKey: FIRE_BANKING_API.pixKey,
                    amount: parseFloat(data.amount),
                    description: data.description,
                    merchantName: FIRE_BANKING_API.merchantName,
                    merchantCity: FIRE_BANKING_API.merchantCity,
                    payerName: data.name,
                    payerDocument: data.cpf,
                    expiresIn: 3600 // Expira em 1 hora
                })
            });
            
            if (!response.ok) {
                throw new Error('Falha ao criar cobrança PIX');
            }
            
            const responseData = await response.json();
            
            return {
                qrCodeText: responseData.qrCode,
                copyPasteText: responseData.copyPaste,
                transactionId: responseData.transactionId
            };
        } catch (error) {
            console.error('Erro ao criar cobrança PIX:', error);
            throw error;
        }
    }
    
    // Função para verificar o status do pagamento
    async function checkPaymentStatus(transactionId, token) {
        try {
            updatePixStatus('Aguardando pagamento...', 'pending');
            
            // Verificar a cada 5 segundos
            const checkInterval = setInterval(async () => {
                try {
                    const response = await fetch(`${FIRE_BANKING_API.baseUrl}/api/v1/pix/transactions/${transactionId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error('Falha ao verificar status do pagamento');
                    }
                    
                    const data = await response.json();
                    
                    if (data.status === 'COMPLETED') {
                        clearInterval(checkInterval);
                        updatePixStatus('Pagamento confirmado! Obrigado pela compra.', 'success');
                    } else if (data.status === 'EXPIRED') {
                        clearInterval(checkInterval);
                        updatePixStatus('O código PIX expirou. Por favor, gere um novo.', 'error');
                    } else if (data.status === 'FAILED') {
                        clearInterval(checkInterval);
                        updatePixStatus('Falha no pagamento. Por favor, tente novamente.', 'error');
                    }
                    
                } catch (error) {
                    console.error('Erro ao verificar status:', error);
                }
            }, 5000);
            
            // Parar de verificar após 1 hora (tempo de expiração do PIX)
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 3600000);
            
        } catch (error) {
            console.error('Erro ao iniciar verificação de pagamento:', error);
        }
    }
    
    // Função para exibir o QR Code PIX
    function displayPixQrCode(pixData) {
        // Limpar o container do QR Code
        pixQrCodeElement.innerHTML = '';
        
        // Gerar o QR Code usando a biblioteca qrcode.js
        QRCode.toCanvas(pixQrCodeElement, pixData.qrCodeText, {
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function(error) {
            if (error) console.error(error);
        });
        
        // Exibir o texto para copiar e colar
        pixCopyPasteElement.textContent = pixData.copyPasteText;
        pixCopyPasteElement.addEventListener('click', function() {
            navigator.clipboard.writeText(pixData.copyPasteText)
                .then(() => {
                    alert('Código PIX copiado para a área de transferência!');
                })
                .catch(err => {
                    console.error('Erro ao copiar: ', err);
                });
        });
        
        // Mostrar o container do QR Code
        pixQrCodeContainer.classList.add('active');
    }
    
    // Função para atualizar o status do pagamento
    function updatePixStatus(message, status) {
        pixStatusElement.textContent = message;
        pixStatusElement.className = 'pix-status';
        if (status) {
            pixStatusElement.classList.add(status);
        }
    }
});