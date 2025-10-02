document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do carrinho da sessão
    loadCartItems();
    
    // Configurar seleção de método de pagamento
    setupPaymentMethodSelection();
    
    // Configurar funcionalidades específicas para cada método
    setupCreditCardFunctionality();
    setupDebitCardFunctionality();
    setupPixFunctionality();
    
    // Configurar botão de confirmação
    document.getElementById('confirm-payment').addEventListener('click', confirmPayment);
});

// Carregar itens do carrinho
function loadCartItems() {
    // Recuperar itens do localStorage (simulando dados do carrinho)
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalValue = document.getElementById('order-total-value');
    
    if (cartItems.length === 0) {
        orderItemsContainer.innerHTML = '<p>Nenhum item no carrinho</p>';
        orderTotalValue.textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    let itemsHtml = '';
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHtml += `
            <div class="order-item">
                <div class="item-name">${item.name} x ${item.quantity}</div>
                <div class="item-price">R$ ${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = itemsHtml;
    orderTotalValue.textContent = `R$ ${total.toFixed(2)}`;
}

// Configurar seleção de método de pagamento
function setupPaymentMethodSelection() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Remover classe active de todos os métodos
            document.querySelectorAll('.payment-method').forEach(pm => {
                pm.classList.remove('active');
            });
            
            // Adicionar classe active ao método selecionado
            const selectedMethod = this.closest('.payment-method');
            selectedMethod.classList.add('active');
            
            // Mostrar formulário correspondente ao método selecionado
            const methodValue = this.value;
            
            // Esconder todos os formulários
            document.querySelectorAll('.method-form').forEach(form => {
                form.style.display = 'none';
            });
            
            // Mostrar formulário do método selecionado
            const selectedForm = selectedMethod.querySelector('.method-form');
            if (selectedForm) {
                selectedForm.style.display = 'block';
                selectedForm.style.animation = 'slideDown 0.3s ease-out';
            }
            
            // Funcionalidades específicas por método
            if (methodValue === 'pix') {
                handlePixSelection();
            } else if (methodValue === 'credit') {
                handleCreditCardSelection();
            } else if (methodValue === 'debit') {
                handleDebitCardSelection();
            }
        });
    });
}

// Funcionalidade específica para Cartão de Crédito
function setupCreditCardFunctionality() {
    const creditNumberInput = document.getElementById('credit-number');
    const creditExpiryInput = document.getElementById('credit-expiry');
    const creditCvvInput = document.getElementById('credit-cvv');
    const creditInstallmentsSelect = document.getElementById('credit-installments');
    
    // Máscara para número do cartão
    creditNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        // Adicionar espaços a cada 4 dígitos
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
        
        // Detectar bandeira do cartão
        detectCardBrand(value.replace(/\s/g, ''));
    });
    
    // Máscara para data de validade
    creditExpiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        
        if (value.length >= 2) {
            value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
        }
        e.target.value = value;
    });
    
    // Máscara para CVV
    creditCvvInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        e.target.value = value;
    });
    
    // Atualizar opções de parcelamento baseado no valor total
    updateInstallmentOptions(creditInstallmentsSelect);
}

// Funcionalidade específica para Cartão de Débito
function setupDebitCardFunctionality() {
    const debitNumberInput = document.getElementById('debit-number');
    const debitExpiryInput = document.getElementById('debit-expiry');
    const debitCvvInput = document.getElementById('debit-cvv');
    
    // Máscara para número do cartão
    debitNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        // Adicionar espaços a cada 4 dígitos
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
        
        // Detectar bandeira do cartão
        detectCardBrand(value.replace(/\s/g, ''), 'debit');
    });
    
    // Máscara para data de validade
    debitExpiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        
        if (value.length >= 2) {
            value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
        }
        e.target.value = value;
    });
    
    // Máscara para CVV
    debitCvvInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        e.target.value = value;
    });
}

// Funcionalidade específica para PIX
function setupPixFunctionality() {
    // PIX não precisa de configuração inicial, será ativado quando selecionado
}

// Detectar bandeira do cartão
function detectCardBrand(cardNumber, type = 'credit') {
    const brands = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        elo: /^(4011|4312|4389|4514|4573|6277|6362|6363|6504|6505|6516|6550)/
    };
    
    let detectedBrand = 'unknown';
    
    for (const [brand, pattern] of Object.entries(brands)) {
        if (pattern.test(cardNumber)) {
            detectedBrand = brand;
            break;
        }
    }
    
    // Atualizar ícone do cartão
    const methodIcon = document.querySelector(`[data-method="${type}"] .method-icon`);
    if (methodIcon) {
        methodIcon.setAttribute('data-brand', detectedBrand);
        
        // Atualizar emoji baseado na bandeira
        const brandEmojis = {
            visa: '💳',
            mastercard: '💳',
            amex: '💳',
            elo: '💳',
            unknown: '💳'
        };
        
        methodIcon.textContent = brandEmojis[detectedBrand];
    }
}

// Atualizar opções de parcelamento
function updateInstallmentOptions(selectElement) {
    const totalValue = parseFloat(document.getElementById('order-total-value').textContent.replace('R$ ', '').replace(',', '.')) || 0;
    
    selectElement.innerHTML = '';
    
    // Adicionar opções de parcelamento
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        
        if (i === 1) {
            option.textContent = `1x de R$ ${totalValue.toFixed(2)} sem juros`;
        } else if (i <= 3) {
            option.textContent = `${i}x de R$ ${(totalValue / i).toFixed(2)} sem juros`;
        } else {
            const withInterest = totalValue * (1 + (i * 0.02)); // 2% de juros por parcela
            option.textContent = `${i}x de R$ ${(withInterest / i).toFixed(2)} com juros`;
        }
        
        selectElement.appendChild(option);
    }
}

// Handlers específicos para cada método
function handleCreditCardSelection() {
    const creditForm = document.querySelector('[data-method="credit"] .method-form');
    
    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = creditForm.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 300);
    
    // Atualizar parcelamento
    const installmentsSelect = document.getElementById('credit-installments');
    updateInstallmentOptions(installmentsSelect);
}

function handleDebitCardSelection() {
    const debitForm = document.querySelector('[data-method="debit"] .method-form');
    
    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = debitForm.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 300);
}

function handlePixSelection() {
    const pixContainer = document.getElementById('pix-qrcode-container');
    const pixInfo = document.querySelector('.pix-info');
    
    // Mostrar informações do PIX
    pixInfo.innerHTML = `
        <div class="pix-instructions">
            <h3>🔥 Pagamento PIX Instantâneo</h3>
            <p>✅ Aprovação imediata</p>
            <p>✅ Sem taxas adicionais</p>
            <p>✅ Disponível 24h por dia</p>
            <button id="generate-pix-btn" class="generate-pix-btn">
                📱 Gerar QR Code PIX
            </button>
        </div>
    `;
    
    // Configurar botão de gerar PIX
    const generatePixBtn = document.getElementById('generate-pix-btn');
    generatePixBtn.addEventListener('click', generatePixCode);
}

// Gerar código PIX
function generatePixCode() {
    const totalValue = document.getElementById('order-total-value').textContent;
    const pixContainer = document.getElementById('pix-qrcode-container');
    
    // Simular geração de QR Code
    const pixCode = generatePixString(totalValue);
    
    pixContainer.innerHTML = `
        <div class="pix-qr-display">
            <div class="qr-code-placeholder">
                <div class="qr-pattern">
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                    <div class="qr-square"></div>
                </div>
                <p>QR Code PIX</p>
            </div>
            <div class="pix-copy-section">
                <p><strong>Ou copie o código PIX:</strong></p>
                <div class="pix-code-container">
                    <input type="text" id="pix-code-input" value="${pixCode}" readonly>
                    <button id="copy-pix-btn" class="copy-btn">📋 Copiar</button>
                </div>
                <p class="pix-timer">⏰ Código válido por 30 minutos</p>
            </div>
        </div>
    `;
    
    pixContainer.style.display = 'block';
    
    // Configurar botão de copiar
    document.getElementById('copy-pix-btn').addEventListener('click', function() {
        const pixCodeInput = document.getElementById('pix-code-input');
        pixCodeInput.select();
        document.execCommand('copy');
        
        this.textContent = '✅ Copiado!';
        this.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            this.textContent = '📋 Copiar';
            this.style.backgroundColor = '';
        }, 2000);
    });
    
    // Simular verificação de pagamento
    simulatePixPaymentCheck();
}

// Gerar string PIX simulada
function generatePixString(totalValue) {
    const value = totalValue.replace('R$ ', '').replace(',', '.');
    return `00020126580014BR.GOV.BCB.PIX0136clauburger@pix.com.br5204000053039865802BR5913Clau Burger6008Sao Paulo62070503***6304${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

// Simular verificação de pagamento PIX
function simulatePixPaymentCheck() {
    const pixContainer = document.getElementById('pix-qrcode-container');
    
    // Adicionar status de verificação
    const statusDiv = document.createElement('div');
    statusDiv.className = 'pix-status';
    statusDiv.innerHTML = `
        <div class="status-indicator">
            <div class="loading-spinner"></div>
            <p>Aguardando pagamento...</p>
        </div>
    `;
    
    pixContainer.appendChild(statusDiv);
}

// Confirmar pagamento
function confirmPayment() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (!selectedMethod) {
        alert('Por favor, selecione um método de pagamento');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerAddress = document.getElementById('customer-address').value;
    const customerNumber = document.getElementById('customer-number').value;
    
    if (!customerName || !customerPhone || !customerAddress || !customerNumber) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Simulação de processamento de pagamento
    const paymentMethod = selectedMethod.value;
    
    if (paymentMethod === 'credit') {
        const cardNumber = document.getElementById('credit-number').value;
        const cardExpiry = document.getElementById('credit-expiry').value;
        const cardCvv = document.getElementById('credit-cvv').value;
        const cardName = document.getElementById('credit-name').value;
        
        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
            alert('Por favor, preencha todos os dados do cartão');
            return;
        }
    } else if (paymentMethod === 'debit') {
        const cardNumber = document.getElementById('debit-number').value;
        const cardExpiry = document.getElementById('debit-expiry').value;
        const cardCvv = document.getElementById('debit-cvv').value;
        const cardName = document.getElementById('debit-name').value;
        
        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
            alert('Por favor, preencha todos os dados do cartão');
            return;
        }
    }
    
    // Simulação de processamento bem-sucedido
    alert('Pagamento processado com sucesso! Seu pedido foi confirmado.');
    
    // Limpar carrinho após pagamento bem-sucedido
    localStorage.removeItem('cartItems');
    
    // Redirecionar para a página inicial após alguns segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}