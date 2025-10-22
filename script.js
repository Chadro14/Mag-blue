document.addEventListener('DOMContentLoaded', () => {

    // --- Gestion du menu Hamburger ---
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            // Ferme le menu si on clique en dehors, mais pas si on clique sur le hamburger lui-même
            if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        });

        // Gestion du scroll doux pour les liens d'ancrage
        document.querySelectorAll('.mobile-menu a[href^="#"], .desktop-nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                mobileMenu.classList.remove('active'); // Ferme le menu mobile si ouvert

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Calcule la position de défilement en tenant compte de la hauteur du header fixe
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

    // --- Carrousel des commentaires (logic pour les faire défiler) ---
    const commentsCarousel = document.getElementById('commentsCarousel');
    if (commentsCarousel) {
        const comments = [
            { text: "Mag-blue a changé ma façon de regarder des films ! Tout est si fluide et organisé.", author: "Sophie L." },
            { text: "Une sélection incroyable et une interface super intuitive. Je recommande à 100% !", author: "Marc D." },
            { text: "Fini de chercher entre les plateformes. Mag-blue regroupe tout, c'est génial !", author: "Léa P." },
            { text: "Le service client est réactif et les mises à jour fréquentes apportent toujours de nouveautés.", author: "Thomas G." },
            { text: "Je n'ai jamais vu un tel catalogue, et la qualité est toujours au rendez-vous.", author: "Amélie B." },
            { text: "Mon abonnement préféré ! Mag-blue surpasse toutes mes attentes en matière de divertissement.", author: "Jean-Luc F." },
        ];

        // Créer les cartes de commentaires et les ajouter au carrousel
        comments.forEach(comment => {
            const commentCard = document.createElement('div');
            commentCard.classList.add('comment-card');
            commentCard.innerHTML = `
                <p>"${comment.text}"</p>
                <span class="author">- ${comment.author}</span>
            `;
            commentsCarousel.appendChild(commentCard);
        });

        // Dupliquer les commentaires pour créer un effet de défilement infini
        // On duplique assez de fois pour éviter les blancs, en fonction du nombre de commentaires visibles
        for (let i = 0; i < comments.length * 2; i++) { // Duplique 2 fois le set original
            const comment = comments[i % comments.length]; // Réutilise les commentaires
            const commentCard = document.createElement('div');
            commentCard.classList.add('comment-card');
            commentCard.innerHTML = `
                <p>"${comment.text}"</p>
                <span class="author">- ${comment.author}</span>
            `;
            commentsCarousel.appendChild(commentCard);
        }

        // Mettre à jour la variable CSS pour l'animation responsive des commentaires
        document.documentElement.style.setProperty('--num-comments', comments.length);
    }

    // --- Animation du carrousel d'images (pour s'assurer qu'il démarre) ---
    // L'animation est principalement gérée par CSS (@keyframes scrollImages)
    // Ce bloc est là si vous aviez besoin d'une logique JS plus complexe,
    // mais pour un simple défilement continu, le CSS est plus performant.
    const imageCarousel = document.getElementById('imageCarousel');
    if (imageCarousel) {
        // Aucune logique JS complexe n'est nécessaire pour le moment ici.
        // L'animation CSS est efficace.
    }
});
