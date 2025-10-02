document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const nav = document.querySelector('header nav');

    if (menuIcon && nav) {
        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('active');
            nav.classList.toggle('menu-open');
        });
    }
});