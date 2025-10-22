// PAS D'IMPORTS FIREBASE ICI, car nous utilisons les CDN "compat" qui exposent un objet global `firebase`.

document.addEventListener('DOMContentLoaded', () => {
    // Vérifiez si firebase est défini (cela signifie que les scripts CDN ont bien chargé)
    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined') {
        console.error("Firebase n'est pas initialisé. Vérifiez les scripts CDN dans index.html.");
        alert("Erreur: Firebase n'a pas pu être chargé. Veuillez vérifier votre connexion ou la console du navigateur.");
        return; // Arrêter l'exécution si Firebase n'est pas prêt
    }

    // Récupérer l'instance d'authentification Firebase via l'API "compat"
    const auth = firebase.auth();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

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

        // --- Vérifier l'état de l'authentification au chargement de la page ---
        auth.onAuthStateChanged(user => { // API compat
            if (user) {
                const userName = user.displayName || user.email.split('@')[0];
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: userName, uid: user.uid }));
                window.location.href = 'dashboard.html';
            } else {
                emailAuthSection.style.display = 'none';
                showEmailAuthBtn.style.display = 'block';
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            }
        });

        // --- Gérer la connexion avec Google ---
        googleAuthBtn.addEventListener('click', async () => {
            authMessage.textContent = 'Connexion avec Google en cours...';
            authMessage.style.color = 'var(--light-gray)';
            try {
                await auth.signInWithPopup(googleProvider); // API compat
            } catch (error) {
                console.error("Erreur lors de la connexion Google:", error);
                if (error.code !== 'auth/popup-closed-by-user') {
                    authMessage.textContent = `Erreur: ${error.message}`;
                    authMessage.style.color = 'var(--error-red)';
                } else {
                    authMessage.textContent = 'Connexion annulée.';
                    authMessage.style.color = 'var(--light-gray)';
                }
            }
        });

        // --- Afficher la section d'authentification par e-mail/mot de passe ---
        showEmailAuthBtn.addEventListener('click', () => {
            emailAuthSection.style.display = 'block';
            showEmailAuthBtn.style.display = 'none';
            authMessage.textContent = '';
        });

        // --- Basculer entre les formulaires de connexion et d'inscription ---
        toggleRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authMessage.textContent = '';
            authMessage.style.color = 'var(--error-red)';
        });

        toggleLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            authMessage.textContent = '';
            authMessage.style.color = 'var(--error-red)';
        });

        // --- Gérer l'inscription par e-mail et mot de passe ---
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            authMessage.textContent = 'Inscription en cours...';
            authMessage.style.color = 'var(--light-gray)';

            try {
                await auth.createUserWithEmailAndPassword(email, password); // API compat
                authMessage.textContent = 'Inscription réussie ! Connexion automatique...';
                authMessage.style.color = 'var(--button-green)';
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

        // --- Gérer la connexion par e-mail et mot de passe ---
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            authMessage.textContent = 'Connexion en cours...';
            authMessage.style.color = 'var(--light-gray)';

            try {
                await auth.signInWithEmailAndPassword(email, password); // API compat
                authMessage.textContent = 'Connexion réussie ! Redirection...';
                authMessage.style.color = 'var(--button-green)';
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
    const dashboardPage = document.querySelector('body:not(.auth-page)');
    if (dashboardPage) {
        // L'instance d'authentification 'auth' est directement accessible ici car 'script.js' est un module unique.

        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        const welcomeMessage = document.getElementById('welcomeMessage');
        const logoutBtn = document.getElementById('logoutBtn');

        // Vérifier l'état de l'authentification Firebase sur la page du tableau de bord
        auth.onAuthStateChanged(user => {
            if (user) {
                const userName = user.displayName || user.email.split('@')[0];
                welcomeMessage.textContent = `Salut ${userName} !`;
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: userName, uid: user.uid }));
            } else {
                localStorage.removeItem('magblue_currentUser');
                window.location.href = 'index.html';
            }
        });

        // --- Gestion du menu Hamburger ---
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        document.querySelectorAll('.mobile-menu-item .menu-toggle').forEach(toggleBtn => {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggleBtn.dataset.target;
                const submenu = document.getElementById(targetId);

                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    if (openSubmenu.id !== targetId) {
                        openSubmenu.classList.remove('active');
                        openSubmenu.previousElementSibling.classList.remove('active');
                    }
                });

                submenu.classList.toggle('active');
                toggleBtn.classList.toggle('active');
            });
        });

        document.addEventListener('click', (event) => {
            if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.classList.remove('active');
                });
            }
        });

        // --- Gérer la déconnexion via Firebase ---
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await auth.signOut(); // API compat
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
                alert("Erreur lors de la déconnexion. Veuillez réessayer.");
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
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
