// Import des fonctions nécessaires de Firebase SDK v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// =========================================================================
// VOTRE CONFIGURATION FIREBASE
// REMPLACEZ CES VALEURS PAR CELLES DE VOTRE PROJET FIREBASE ACTUEL
// (Actuellement, il semble que ce soit le projet "congo-ia" que vous utilisez)
// =========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyALMEMpf7VF8_eL2KnwWkWpAjepY7wKf6Q",
    authDomain: "congo-ia.firebaseapp.com", 
    projectId: "congo-ia",
    storageBucket: "congo-ia.firebasestorage.app",
    messagingSenderId: "721296628993",
    appId: "1:721296628993:web:e283f6f06306b8ab690f00",
    measurementId: "G-2NFRN9HPLW" 
};

// =========================================================================
// INITIALISATION DE FIREBASE
// =========================================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Obtenir l'instance d'authentification
const googleProvider = new GoogleAuthProvider(); // Fournisseur Google pour la connexion

// =========================================================================
// LOGIQUE PRINCIPALE DU DOM ET DE L'AUTHENTIFICATION
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

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
        // Cette fonction est le "point central" de l'authentification.
        // Elle s'exécute à chaque changement d'état (connexion, déconnexion, chargement initial).
        onAuthStateChanged(auth, user => {
            if (user) {
                // Si un utilisateur est connecté, on le redirige vers le tableau de bord.
                const userName = user.displayName || user.email.split('@')[0];
                // Stocker les informations de l'utilisateur dans localStorage pour un accès facile
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: userName, uid: user.uid }));
                window.location.href = 'dashboard.html';
            } else {
                // Si aucun utilisateur n'est connecté, on s'assure que les formulaires de connexion/inscription sont prêts.
                // Au chargement initial, la section e-mail est cachée par défaut.
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
                await signInWithPopup(auth, googleProvider); // Déclenche la fenêtre pop-up Google
                // La redirection vers 'dashboard.html' sera gérée par 'onAuthStateChanged' suite au succès.
            } catch (error) {
                console.error("Erreur lors de la connexion Google:", error);
                // Gérer spécifiquement si l'utilisateur annule le pop-up de connexion
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
            showEmailAuthBtn.style.display = 'none'; // Cache le bouton "Continuer avec E-mail"
            authMessage.textContent = ''; // Efface les messages d'état précédents
        });

        // --- Basculer entre les formulaires de connexion et d'inscription ---
        toggleRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authMessage.textContent = ''; // Efface les messages lors du basculement
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
                await createUserWithEmailAndPassword(auth, email, password); // Crée le compte Firebase
                authMessage.textContent = 'Inscription réussie ! Connexion automatique...';
                authMessage.style.color = 'var(--button-green)';
                // La redirection sera gérée par 'onAuthStateChanged'.
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
                await signInWithEmailAndPassword(auth, email, password); // Connecte l'utilisateur
                authMessage.textContent = 'Connexion réussie ! Redirection...';
                authMessage.style.color = 'var(--button-green)';
                // La redirection sera gérée par 'onAuthStateChanged'.
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
        // 'auth' est directement accessible ici car tout le fichier est un module unique.

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
                localStorage.setItem('magblue_currentUser', JSON.stringify({ email: user.email, name: userName, uid: user.uid }));
            } else {
                // Utilisateur non connecté, rediriger vers la page de connexion
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
                await signOut(auth); // Déconnecte l'utilisateur de Firebase
                // La redirection vers index.html sera gérée par 'onAuthStateChanged'.
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
                alert("Erreur lors de la déconnexion. Veuillez réessayer.");
            }
        });

        // --- Optionnel : Ajout d'un effet de scroll doux pour les ancres ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                // Ferme le menu mobile et les sous-menus lors d'un clic sur une ancre
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
                           
