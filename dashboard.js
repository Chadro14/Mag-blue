document.addEventListener('DOMContentLoaded', () => {
    // --- Gestion du menu Hamburger pour le Dashboard ---
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const welcomeMessageMobile = document.getElementById('welcomeMessageMobile'); // Message de bienvenue mobile

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            // Ferme le menu si on clique en dehors
            if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                // Ferme également les sous-menus ouverts
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.classList.remove('active'); // Retire la classe active du toggle
                });
            }
        });

        // Gestion des sous-menus (Catégories, Mes listes)
        document.querySelectorAll('.mobile-menu-item .menu-toggle').forEach(toggleBtn => {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggleBtn.dataset.target; // Ex: 'categoriesSubmenu'
                const submenu = document.getElementById(targetId);

                // Ferme les autres sous-menus ouverts
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    if (openSubmenu.id !== targetId) {
                        openSubmenu.classList.remove('active');
                        openSubmenu.previousElementSibling.classList.remove('active'); // Retire la classe active du toggle
                    }
                });

                // Ouvre/ferme le sous-menu actuel
                submenu.classList.toggle('active');
                toggleBtn.classList.toggle('active'); // Ajoute/retire la classe active au bouton
            });
        });

        // Gestion du scroll doux pour les liens d'ancrage dans le menu mobile (si applicable)
        document.querySelectorAll('.mobile-menu a.menu-link[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                mobileMenu.classList.remove('active'); // Ferme le menu mobile
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => { // Ferme les sous-menus
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.classList.remove('active');
                });

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerOffset = document.querySelector('.main-header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // --- Gestion de la déconnexion ---
    const logoutBtn = document.getElementById('logoutBtn'); // Bouton desktop
    const logoutBtnMobile = document.getElementById('logoutBtnMobile'); // Bouton mobile

    const performLogout = (e) => {
        e.preventDefault();
        // Ici, on simule une déconnexion en redirigeant vers la page d'accueil
        // Dans une vraie application, il faudrait effacer le token de session, etc.
        localStorage.removeItem('magblue_currentUser'); // Efface toute info utilisateur stockée
        window.location.href = 'index.html'; // Redirige vers la page d'accueil
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', performLogout);
    }
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', performLogout);
    }

    // --- Message de bienvenue (pour le tableau de bord) ---
    const welcomeMessage = document.getElementById('welcomeMessage');
    // Récupère le nom d'utilisateur si stocké (sinon utilise un message générique)
    const currentUser = JSON.parse(localStorage.getItem('magblue_currentUser'));
    if (welcomeMessage) {
        if (currentUser && currentUser.name) {
            welcomeMessage.textContent = `Salut ${currentUser.name} ! Bienvenue sur Mag-blue.`;
            if(welcomeMessageMobile) welcomeMessageMobile.textContent = `Salut ${currentUser.name} !`;
        } else {
            welcomeMessage.textContent = `Bienvenue sur Mag-blue !`;
            if(welcomeMessageMobile) welcomeMessageMobile.textContent = `Salut !`;
        }
    }
});
                                                     
