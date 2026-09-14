// ========== CONFIGURATION SUPABASE ==========
const SUPABASE_URL = "https://xkzijtjjtzookaipycvb.supabase.co";
const SUPABASE_CLE = "sb_publishable_uQ52MvwTFa3M54xEDTAZFQ_7UH2FHDr";

// Initialisation de la connexion
const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_CLE);

// ========== FONCTION VOIR/CACHER MOT DE PASSE (ŒIL) ==========
function voirMotDePasse(idChamp, element) {
    const champ = document.getElementById(idChamp);
    if (champ.type === "password") {
        champ.type = "text";
        element.textContent = "👁️‍🗨️";
    } else {
        champ.type = "password";
        element.textContent = "👁️";
    }
}

// ========== GESTION MENU ==========
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');

menuBtn.addEventListener('click', () => menuOverlay.classList.add('open'));
closeMenu.addEventListener('click', () => menuOverlay.classList.remove('open'));
function fermerMenu() { menuOverlay.classList.remove('open'); }

// ========== GESTION PAGES ==========
function afficherPage(idPage) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
    });
    document.getElementById(idPage).classList.remove('hidden');
    document.getElementById(idPage).classList.add('active');
}

// ========== GESTION UTILISATEUR ==========
let utilisateurActif = null;

// Inscription — Sauvegarde dans Supabase
async function sInscrire() {
    let email = document.getElementById('inscEmail').value.trim();
    let mdp = document.getElementById('inscMdp').value;
    
    if (!email || !mdp) return alert('Veuillez remplir tous les champs.');
    if (mdp.length < 6) return alert('Mot de passe trop court (6 caractères minimum).');

    // Vérifier si déjà inscrit
    const { data: existe } = await supabase
        .from('utilisateurs')
        .select('email')
        .eq('email', email)
        .single()
        .catch(() => ({ data: null }));

    if (existe) return alert('Cet email est déjà utilisé.');

    // Insérer dans Supabase
    const { error } = await supabase
        .from('utilisateurs')
        .insert([{ email: email, mot_de_passe: mdp }]);

    if (error) return alert('Erreur : ' + error.message);
    
    alert(' Inscription réussie ! Vous pouvez vous connecter.');
    afficherPage('pageConnexion');
}

// Connexion — Vérifie dans Supabase
async function seConnecter() {
    let email = document.getElementById('connEmail').value.trim();
    let mdp = document.getElementById('connMdp').value;

    const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('email', email)
        .eq('mot_de_passe', mdp)
        .single();

    if (error || !data) return alert(' Identifiants incorrects.');

    utilisateurActif = data;
    localStorage.setItem('bsl_utilisateur', JSON.stringify(data.email));
    afficherPage('pageAccueil');
    menuBtn.style.display = 'block';
}

// Déconnexion
function deconnexion() {
    utilisateurActif = null;
    localStorage.removeItem('bsl_utilisateur');
    afficherPage('pageConnexion');
    menuBtn.style.display = 'none';
    document.body.removeAttribute('data-theme');
    document.getElementById('btnClair').classList.add('active');
    document.getElementById('btnSombre').classList.remove('active');
    localStorage.removeItem('bsl_theme');
}

// ========== GESTION THÈME ==========
function choisirTheme(theme) {
    if (theme === 'sombre') {
        document.body.setAttribute('data-theme', 'sombre');
        document.getElementById('btnSombre').classList.add('active');
        document.getElementById('btnClair').classList.remove('active');
    } else {
        document.body.removeAttribute('data-theme');
        document.getElementById('btnClair').classList.add('active');
        document.getElementById('btnSombre').classList.remove('active');
    }
    localStorage.setItem('bsl_theme', theme);
}

// ========== AU CHARGEMENT DE LA PAGE ==========
window.onload = () => {
    menuBtn.style.display = 'none'; // Caché avant connexion

    // Restaurer thème
    let sauvegardeTheme = localStorage.getItem('bsl_theme');
    if (sauvegardeTheme === 'sombre') choisirTheme('sombre');

    // Restaurer session si déjà connecté
    let sauvegardeUser = localStorage.getItem('bsl_utilisateur');
    if (sauvegardeUser) {
        utilisateurActif = { email: sauvegardeUser };
        afficherPage('pageAccueil');
        menuBtn.style.display = 'block';
    }
};
