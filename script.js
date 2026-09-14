const SUPABASE_URL = "https://xkzijtjjtzookaipycvb.supabase.co";
const SUPABASE_CLE = "sb_publishable_uQ52MvwTFa3M54xEDTAZFQ_7UH2FHDr";

const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_CLE);

// VOIR / CACHER MOT DE PASSE
function voirMotDePasse(idChamp, element) {
    const champ = document.getElementById(idChamp);
    if (champ.type === "password") {
        champ.type = "text";
        element.textContent = "CACHER";
    } else {
        champ.type = "password";
        element.textContent = "VOIR";
    }
}

// MENU
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');

menuBtn.addEventListener('click', () => menuOverlay.classList.add('open'));
closeMenu.addEventListener('click', () => menuOverlay.classList.remove('open'));
function fermerMenu() { menuOverlay.classList.remove('open'); }

// NAVIGATION PAGES
function afficherPage(idPage) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
    });
    document.getElementById(idPage).classList.remove('hidden');
    document.getElementById(idPage).classList.add('active');
}

let utilisateurActif = null;

// INSCRIPTION COMPLETE
async function sInscrire() {
    let nom = document.getElementById('inscNom').value.trim();
    let prenom = document.getElementById('inscPrenom').value.trim();
    let email = document.getElementById('inscEmail').value.trim();
    let mdp = document.getElementById('inscMdp').value;

    if (!nom || !prenom || !email || !mdp) {
        return alert('Veuillez remplir TOUS les champs.');
    }
    if (mdp.length < 6) {
        return alert('Le mot de passe doit contenir au moins 6 caractères.');
    }

    // Vérifier si email existe déjà
    const { data: existe } = await supabase
        .from('utilisateurs')
        .select('email')
        .eq('email', email)
        .single()
        .catch(() => ({ data: null }));

    if (existe) {
        return alert('Cette adresse email est déjà utilisée.');
    }

    // Insérer le nouvel utilisateur
    const { error } = await supabase
        .from('utilisateurs')
        .insert([{ 
            nom: nom,
            prenom: prenom,
            email: email, 
            mot_de_passe: mdp 
        }]);

    if (error) {
        return alert('Erreur : ' + error.message);
    }

    alert('Inscription réussie ! Vous pouvez vous connecter.');
    afficherPage('pageConnexion');
}

// CONNEXION
async function seConnecter() {
    let email = document.getElementById('connEmail').value.trim();
    let mdp = document.getElementById('connMdp').value;

    const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('email', email)
        .eq('mot_de_passe', mdp)
        .single();

    if (error || !data) {
        return alert('Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.');
    }

    utilisateurActif = data;
    localStorage.setItem('bsl_utilisateur', JSON.stringify(data.email));
    afficherPage('pageAccueil');
    menuBtn.style.display = 'block';
}

// DECONNEXION
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

// CHOIX THEME
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

// AU CHARGEMENT
window.onload = () => {
    menuBtn.style.display = 'none';

    let sauvegardeTheme = localStorage.getItem('bsl_theme');
    if (sauvegardeTheme === 'sombre') choisirTheme('sombre');

    let sauvegardeUser = localStorage.getItem('bsl_utilisateur');
    if (sauvegardeUser) {
        utilisateurActif = { email: sauvegardeUser };
        afficherPage('pageAccueil');
        menuBtn.style.display = 'block';
    }
};
