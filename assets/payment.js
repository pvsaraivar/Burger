document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do carrinho da sessão
    loadCartItems();
    
    // Configurar seleção de método de pagamento
    setupPaymentMethodSelection();
    
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
            // Mostrar formulário correspondente ao método selecionado
            const methodValue = this.value;
            
            if (methodValue === 'pix') {
                // Simular geração de QR code PIX quando selecionado
                document.getElementById('pix-qrcode-container').style.display = 'block';
                
                // Aqui você poderia gerar um QR code real usando uma biblioteca
                // Por enquanto, apenas simulamos com um placeholder
                const pixQrCode = document.getElementById('pix-qrcode');
                if (pixQrCode && !pixQrCode.hasChildNodes()) {
                    pixQrCode.innerHTML = `
                        <div style="width: 150px; height: 150px; background-color: white; display: flex; align-items: center; justify-content: center;">
                            <span style="color: black;">QR Code PIX</span>
                        </div>
                    `;
                }
                
                const pixCopyPaste = document.getElementById('pix-copy-paste');
                if (pixCopyPaste) {
                    pixCopyPaste.textContent = '00020126580014BR.GOV.BCB.PIX0136example@domain.com5204000053039865802BR5913Clau Burger6008Sao Paulo62070503***63041D2C';
                }
            } else {
                // Esconder container PIX para outros métodos
                document.getElementById('pix-qrcode-container').style.display = 'none';
            }
        });
    });
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