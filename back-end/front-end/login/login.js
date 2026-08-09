const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const formError = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');

const loginTitle = document.getElementById('loginTitle');
const loginSubtitle = document.getElementById('loginSubtitle');
const switchModeText = document.getElementById('switchModeText');
const switchModeLink = document.getElementById('switchModeLink');

const togglePassword = document.getElementById('togglePassword');

// 'login' or 'signup' — controls which endpoint we call and the page copy
let mode = 'login';

const COPY = {
    login: {
        title: 'Connexion',
        subtitle: 'Connectez-vous pour accéder à votre espace.',
        submit: 'Se connecter',
        switchText: 'Pas encore de compte ?',
        switchLink: 'Créer un compte',
        endpoint: '/api/auth/login',
        successRedirect: '../index.html'
    },
    signup: {
        title: 'Créer un compte',
        subtitle: 'Choisissez un nom d\'utilisateur et un mot de passe.',
        submit: 'Créer le compte',
        switchText: 'Déjà un compte ?',
        switchLink: 'Se connecter',
        endpoint: '/api/auth/signup',
        successRedirect: null // after signup we send them to login instead of straight in
    }
};

function applyModeCopy(){
    const c = COPY[mode];
    loginTitle.textContent = c.title;
    loginSubtitle.textContent = c.subtitle;
    submitBtnText.textContent = c.submit;
    switchModeText.textContent = c.switchText;
    switchModeLink.textContent = c.switchLink;
    hideError();
}

switchModeLink.addEventListener('click', (e) => {
    e.preventDefault();
    mode = mode === 'login' ? 'signup' : 'login';
    applyModeCopy();
});

togglePassword.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePassword.querySelector('ion-icon').setAttribute(
        'name',
        isHidden ? 'eye-off-outline' : 'eye-outline'
    );
});

function showError(message){
    formErrorText.textContent = message;
    formError.classList.remove('hidden');
}

function hideError(){
    formError.classList.add('hidden');
}

function setLoading(isLoading){
    submitBtn.disabled = isLoading;
    if (isLoading) {
        submitBtn.innerHTML = '<span class="spinner"></span>';
    } else {
        submitBtn.innerHTML =
            '<ion-icon name="log-in-outline"></ion-icon><span id="submitBtnText">' +
            COPY[mode].submit + '</span>';
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showError('Merci de remplir tous les champs.');
        return;
    }

    setLoading(true);

    try {
        const res = await fetch(COPY[mode].endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // needed so the session cookie gets set/sent
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Identifiants invalides.');
        }

        if (mode === 'login') {
            window.location.href = COPY.login.successRedirect;
        } else {
            // signup succeeded — switch to login mode so they can sign in
            mode = 'login';
            applyModeCopy();
            showError('Compte créé. Vous pouvez maintenant vous connecter.');
            formError.style.background = '#f0fdf4';
            formError.style.borderColor = '#bbf7d0';
            formError.style.color = '#15803d';
            passwordInput.value = '';
        }
    } catch (err) {
        formError.style.background = '';
        formError.style.borderColor = '';
        formError.style.color = '';
        showError(err.message || 'Une erreur est survenue.');
    } finally {
        setLoading(false);
    }
});