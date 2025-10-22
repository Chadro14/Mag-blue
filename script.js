// Les modules sont autonomes, donc document.addEventListener est toujours le bon point de départ.
document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les instances et fonctions Firebase exportées depuis index.html
    // Ces objets sont exportés depuis le script de type "module" dans index.html
    const app = window.firebaseApp;
    const auth = window.firebaseAuth;
    const GoogleAuthProvider = window.GoogleAuthProvider;
    const signInWithPopup = window.signInWithPopup;
    const createUserWithEmailAndPassword = window.createUserWithEmailAndPassword;
    const signInWithEmailAndPassword = window.signInWithEmailAndPassword;
    const signOut = window.signOut;
    const onAuthStateChanged = window.onAuthStateChanged;

    if (!app || !auth) {
        console.error("Firebase n'est pas initialisé correctement. Vérifiez votre index.html.");
        return; // Arrêter si Firebase n'est pas prêt
    }

    // --- Logique pour la page d'authentification (index.html) ---
    const authPage = document.querySelector('.auth-page');

    if (authPage) {
        // Références aux éléments du DOM
        const googleAuthBtn = document.getElementById('googleAuthBtn');
        const showEmailAuthBtn = document.getElementById('showEmailAuth');
        const emailAuthSection = document.getElementById('emailAuthSection');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleRegisterLink = document.getElementById('toggleRegister');
        const toggleLoginLink = document.getElementById('toggleLogin');
        const authMessage = document.getElementById('authMessage');

        const googleProvider = new GoogleAuthProvider();

        // --- Vérifier l'état de l'authentification au chargement ---
        // Cette fonction s'exécute à chaque changement d'état d'authentification (connexion, déconnexion)
        // et redirige l'utilisateur s'il est déjà connecté.
        onAuthStateChanged(auth, user => {
            if (user) {
                // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
                const userName = user.displayName || user.email.split('@')[0];
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: userName, uid: user.uid }));
                window.location.href = 'dashboard.html';
            } else {
                // Si l'utilisateur n'est pas connecté, s'assurer que les formulaires sont visibles.
                // Au chargement, par défaut, la section e-mail est masquée.
                emailAuthSection.style.display = 'none'; // Cacher par défaut
                showEmailAuthBtn.style.display = 'block'; // Afficher le bouton pour e-mail
                loginForm.style.display = 'block'; // Afficher le formulaire de connexion par défaut
                registerForm.style.display = 'none';
            }
        });

        // --- Connexion avec Google ---
        googleAuthBtn.addEventListener('click', async () => {
            authMessage.textContent = 'Connexion avec Google en cours...';
            authMessage.style.color = 'var(--light-gray)';
            try {
                // Déclenche le pop-up de connexion Google
                await signInWithPopup(auth, googleProvider);
                // Si la connexion réussit, onAuthStateChanged s'occupera de la redirection.
            } catch (error) {
                console.error("Erreur lors de la connexion Google:", error);
                // Gérer spécifiquement si l'utilisateur ferme le pop-up
                if (error.code !== 'auth/popup-closed-by-user') {
                    authMessage.textContent = `Erreur: ${error.message}`;
                    authMessage.style.color = 'var(--error-red)';
                } else {
                    authMessage.textContent = 'Connexion annulée.';
                    authMessage.style.color = 'var(--light-gray)';
                }
            }
        });

        // --- Afficher/Masquer la section d'authentification par e-mail ---
        showEmailAuthBtn.addEventListener('click', () => {
            emailAuthSection.style.display = 'block';
            showEmailAuthBtn.style.display = 'none';
            authMessage.textContent = ''; // Effacer les messages précédents
        });

        // --- Basculer entre les formulaires de connexion et d'inscription ---
        toggleRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authMessage.textContent = '';
            authMessage.style.color = 'var(--error-red)'; // Remettre la couleur par défaut pour les futurs messages d'erreur
        });

        toggleLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            authMessage.textContent = '';
            authMessage.style.color = 'var(--error-red)'; // Remettre la couleur par défaut
        });

        // --- Inscription par e-mail et mot de passe ---
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            authMessage.textContent = 'Inscription en cours...';
            authMessage.style.color = 'var(--light-gray)';

            try {
                // Crée un nouvel utilisateur avec e-mail et mot de passe dans Firebase
                await createUserWithEmailAndPassword(auth, email, password);
                authMessage.textContent = 'Inscription réussie ! Connexion automatique...';
                authMessage.style.color = 'var(--button-green)';
                // Si l'inscription réussit, onAuthStateChanged s'occupera de la redirection.
            } catch (error) {
                console.error("Erreur lors de l'inscription:", error);
                let errorMessage = "Erreur lors de l'inscription.";
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Cet e-mail est déjà utilisé. Veuillez vous connecter.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Mot de passe trop faible (min. 6 caractères).';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Format d\'e-mail invalide.';
                }
                authMessage.textContent = `Erreur: ${errorMessage}`;
                authMessage.style.color = 'var(--error-red)';
            }
        });

        // --- Connexion par e-mail et mot de passe ---
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            authMessage.textContent = 'Connexion en cours...';
            authMessage.style.color = 'var(--light-gray)';

            try {
                // Tente de connecter l'utilisateur avec e-mail et mot de passe
                await signInWithEmailAndPassword(auth, email, password);
                authMessage.textContent = 'Connexion réussie ! Redirection...';
                authMessage.style.color = 'var(--button-green)';
                // Si la connexion réussit, onAuthStateChanged s'occupera de la redirection.
            } catch (error) {
                console.error("Erreur lors de la connexion:", error);
                let errorMessage = "Erreur lors de la connexion.";
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    errorMessage = 'E-mail ou mot de passe incorrect.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Format d\'e-mail invalide.';
                }
                authMessage.textContent = `Erreur: ${errorMessage}`;
                authMessage.style.color = 'var(--error-red)';
            }
        });
    }

    // --- Logique pour le Tableau de Bord (dashboard.html) ---
    // Cette partie gère le comportement de la page après la connexion.
    const dashboardPage = document.querySelector('body:not(.auth-page)');
    if (dashboardPage) {
        // Récupérer l'instance d'authentification Firebase
        const auth = window.firebaseAuth;

        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        const welcomeMessage = document.getElementById('welcomeMessage');
        const logoutBtn = document.getElementById('logoutBtn');

        // Vérifier l'état de l'authentification Firebase sur la page du tableau de bord
        onAuthStateChanged(auth, user => {
            if (user) {
                // Utilisateur est connecté. Mettre à jour le message de bienvenue.
                const userName = user.displayName || user.email.split('@')[0];
                welcomeMessage.textContent = `Salut ${userName} !`;
                // Stocker l'utilisateur dans localStorage pour des usages ultérieurs (nom, email, uid)
                // Le localStorage est mis à jour ici pour être sûr qu'il reflète l'état actuel de l'utilisateur Firebase
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: userName, uid: user.uid }));

            } else {
                // Utilisateur non connecté, rediriger vers la page de connexion
                localStorage.removeItem('magblue_currentUser'); // Nettoyer le localStorage
                window.location.href = 'index.html';
            }
        });

        // --- Gestion du menu Hamburger ---
        // Ouvre/ferme le menu principal mobile
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        // Ouvre/ferme les sous-menus à l'intérieur du menu mobile
        document.querySelectorAll('.mobile-menu-item .menu-toggle').forEach(toggleBtn => {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggleBtn.dataset.target; // ID du sous-menu cible (ex: streaming-submenu)
                const submenu = document.getElementById(targetId);

                // Fermer les autres sous-menus ouverts pour n'en avoir qu'un seul à la fois
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    if (openSubmenu.id !== targetId) { // Si ce n'est pas le sous-menu actuel
                        openSubmenu.classList.remove('active');
                        // Enlève la classe 'active' du bouton parent pour réinitialiser l'icône
                        openSubmenu.previousElementSibling.classList.remove('active');
                    }
                });

                // Ouvrir ou fermer le sous-menu cliqué
                submenu.classList.toggle('active');
                toggleBtn.classList.toggle('active'); // Pour faire tourner l'icône chevron
            });
        });

        // Fermer le menu mobile (et tous les sous-menus) si l'on clique en dehors
        document.addEventListener('click', (event) => {
            // Vérifie si le clic n'est pas sur le menu mobile ni sur le bouton hamburger,
            // et si le menu mobile est actuellement ouvert.
            if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active'); // Ferme le menu principal
                // Ferme tous les sous-menus ouverts
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.classList.remove('active'); // Réinitialise l'icône
                });
            }
        });

        // --- Déconnexion Firebase ---
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth); // Déconnecte l'utilisateur de Firebase
                // onAuthStateChanged détectera la déconnexion et redirigera vers index.html
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
                alert("Erreur lors de la déconnexion. Veuillez réessayer.");
            }
        });

        // --- Optionnel : Ajout d'un effet de scroll doux pour les ancres ---
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
                                   
