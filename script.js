document.addEventListener('DOMContentLoaded', () => {
    // --- Logique pour la page d'authentification (index.html) ---
    const authPage = document.querySelector('.auth-page');
    if (authPage) {
        const googleAuthBtn = document.getElementById('googleAuthBtn');
        const showEmailAuthBtn = document.getElementById('showEmailAuth');
        const emailAuthSection = document.getElementById('emailAuthSection');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleRegisterLink = document.getElementById('toggleRegister');
        const toggleLoginLink = document.getElementById('toggleLogin');
        const authMessage = document.getElementById('authMessage');

        let users = JSON.parse(localStorage.getItem('magblue_users')) || [];
        let currentUser = null; // Utilisateur actuellement connecté (simulé)

        // Simuler la connexion avec Google
        googleAuthBtn.addEventListener('click', () => {
            // Dans une vraie app, cela déclencherait un pop-up Google OAuth.
            // Ici, on simule une connexion réussie et on redirige.
            alert('Connexion avec Google simulée réussie !');
            localStorage.setItem('magblue_currentUser', JSON.stringify({ email: 'user@google.com', name: 'Utilisateur Google' }));
            window.location.href = 'dashboard.html';
        });

        // Afficher/Masquer la section d'authentification par e-mail
        showEmailAuthBtn.addEventListener('click', () => {
            emailAuthSection.style.display = 'block';
            showEmailAuthBtn.style.display = 'none'; // Masquer le bouton "Continuer avec E-mail"
        });

        // Basculer entre les formulaires de connexion et d'inscription
        toggleRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authMessage.textContent = '';
        });

        toggleLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            authMessage.textContent = '';
        });

        // Simuler l'inscription par e-mail
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            if (password.length < 6) {
                authMessage.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
                return;
            }

            if (users.some(user => user.email === email)) {
                authMessage.textContent = 'Cet e-mail est déjà enregistré.';
                return;
            }

            users.push({ email, password });
            localStorage.setItem('magblue_users', JSON.stringify(users));
            authMessage.textContent = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
            authMessage.style.color = 'var(--button-green)'; // Message de succès
            // Rediriger vers la connexion
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            document.getElementById('loginEmail').value = email; // Pré-remplir l'e-mail
        });

        // Simuler la connexion par e-mail
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                authMessage.textContent = 'Connexion réussie ! Redirection...';
                authMessage.style.color = 'var(--button-green)';
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: user.email.split('@')[0] }));
                window.location.href = 'dashboard.html';
            } else {
                authMessage.textContent = 'E-mail ou mot de passe incorrect.';
                authMessage.style.color = 'var(--error-red)';
            }
        });
    }

    // --- Logique pour le Tableau de Bord (dashboard.html) ---
    const dashboardPage = document.querySelector('body:not(.auth-page)');
    if (dashboardPage) {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        const welcomeMessage = document.getElementById('welcomeMessage');
        const logoutBtn = document.getElementById('logoutBtn');

        // Vérifier si l'utilisateur est "connecté"
        const storedUser = localStorage.getItem('magblue_currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            welcomeMessage.textContent = `Salut ${user.name || user.email.split('@')[0]} !`;
        } else {
            // Si pas d'utilisateur, rediriger vers la page de connexion
            window.location.href = 'index.html';
            return; // Arrêter l'exécution du script pour cette page
        }

        // Toggle du menu mobile (Hamburger)
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        // Toggle des sous-menus dans le menu mobile
        document.querySelectorAll('.mobile-menu-item .menu-toggle').forEach(toggleBtn => {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggleBtn.dataset.target;
                const submenu = document.getElementById(targetId);

                // Fermer les autres sous-menus ouverts
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    if (openSubmenu.id !== targetId) {
                        openSubmenu.classList.remove('active');
                        openSubmenu.previousElementSibling.classList.remove('active'); // Enlève 'active' du toggle parent
                    }
                });

                // Ouvrir ou fermer le sous-menu cliqué
                submenu.classList.toggle('active');
                toggleBtn.classList.toggle('active'); // Pour faire tourner l'icône
            });
        });

        // Fermer le menu mobile (et sous-menus) si l'on clique en dehors
        document.addEventListener('click', (event) => {
            if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.classList.remove('active');
                });
            }
        });

        // Déconnexion
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('magblue_currentUser');
            window.location.href = 'index.html';
        });

        // Optionnel : Ajout d'un effet de scroll doux pour les ancres
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                // Fermer le menu mobile et les sous-menus lors d'un clic sur une ancre
                mobileMenu.classList.remove('active');
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.classList.remove('active');
                });

                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }
});
                                            
