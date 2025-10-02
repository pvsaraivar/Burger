document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const productItems = document.querySelectorAll('.products-grid .product-item');

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;

        productItems.forEach(item => {
            const productName = item.querySelector('.product-name').textContent.toLowerCase();
            const productCategoryElement = item.querySelector('.product-category');
            // A categoria pode não existir em todos os itens, então verificamos.
            const productCategory = productCategoryElement ? productCategoryElement.textContent.toLowerCase() : '';

            const nameMatch = productName.includes(searchTerm);
            const categoryMatch = (selectedCategory === 'all') || productCategory.includes(selectedCategory);

            if (nameMatch && categoryMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', filterProducts);
    }

    // Executa o filtro uma vez no carregamento, caso haja valores pré-definidos (raro, mas boa prática)
    filterProducts();
});