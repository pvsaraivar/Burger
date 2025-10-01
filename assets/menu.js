document.addEventListener('DOMContentLoaded', function() {
    // Filtro de categorias
    const categoryButtons = document.querySelectorAll('.category-button');
    const productItems = document.querySelectorAll('.product-item');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove classe active de todos os botões
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona classe active ao botão clicado
            button.classList.add('active');
            
            const category = button.getAttribute('data-category');
            
            // Filtra os produtos
            productItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Funcionalidade do carrinho
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotalValue = document.getElementById('cart-total-value');
    const checkoutButton = document.getElementById('checkout-button');
    
    let cart = [];
    
    // Adiciona evento de clique aos botões "Adicionar ao Carrinho"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productItem = button.closest('.product-item');
            const productName = productItem.querySelector('.product-name').textContent;
            const productPrice = productItem.querySelector('.product-price').textContent;
            const priceValue = parseFloat(productPrice.replace('R$ ', '').replace(',', '.'));
            
            // Verifica se o produto já está no carrinho
            const existingItem = cart.find(item => item.name === productName);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: productName,
                    price: priceValue,
                    quantity: 1
                });
            }
            
            updateCart();
            
            // Feedback visual
            button.textContent = 'Adicionado!';
            setTimeout(() => {
                button.textContent = 'Adicionar ao Carrinho';
            }, 1000);
        });
    });
    
    // Atualiza o carrinho
    function updateCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
            cartTotalValue.textContent = 'R$ 0,00';
            checkoutButton.style.opacity = '0.5';
            checkoutButton.style.pointerEvents = 'none';
            return;
        }
        
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                </div>
                <button class="remove-item" data-index="${index}">×</button>
            `;
            
            cartItems.appendChild(cartItemElement);
        });
        
        // Salva o carrinho no localStorage para uso na página de pagamento
        localStorage.setItem('cartItems', JSON.stringify(cart));
        
        cartTotalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        checkoutButton.style.opacity = '1';
        checkoutButton.style.pointerEvents = 'auto';
        // Adiciona eventos aos botões de quantidade e remoção
        document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCart();
            });
        });
        
        document.querySelectorAll('.quantity-btn.increase').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                cart[index].quantity += 1;
                updateCart();
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
    
    // Finalizar pedido - Agora apenas redireciona para a página de pagamento
    checkoutButton.addEventListener('click', (e) => {
        if (cart.length === 0) {
            e.preventDefault();
            alert('Seu carrinho está vazio!');
            return;
        }
        
        // Salva o carrinho no localStorage antes de redirecionar
        localStorage.setItem('cartItems', JSON.stringify(cart));
    });
});