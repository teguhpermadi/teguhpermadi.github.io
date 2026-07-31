// Firebase Compat SDK v10 - CDN Script Tag compatible
const firebaseScriptBase = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-';

function loadFirebaseScript(name) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = firebaseScriptBase + name + '-compat.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// Expose a promise that resolves when Firebase is fully ready
window.firebaseReady = new Promise(async (resolve) => {
    try {
        await loadFirebaseScript('app');
        await loadFirebaseScript('auth');
        await loadFirebaseScript('firestore');
    } catch (e) {
        console.error('Failed to load Firebase SDK:', e);
        resolve();
        return;
    }

    const firebaseConfig = {
        apiKey: "AIzaSyB7HSo-yLwOtocaLSutb76xma11FjzbbBk",
        authDomain: "math-game-8496d.firebaseapp.com",
        projectId: "math-game-8496d",
        storageBucket: "math-game-8496d.firebasestorage.app",
        messagingSenderId: "196385106192",
        appId: "1:196385106192:web:e5adddea868d91e6f75d95",
        measurementId: "G-KSF4TBQ9TR"
    };

    firebase.initializeApp(firebaseConfig);

    window.firebaseAuth = firebase.auth();
    window.firebaseDB = firebase.firestore();
    window.firebaseSDK = firebase;
    window.isUserLoggedIn = false;
    window.currentUser = null;

    window.firebaseDB.settings({
        cache: { tabManager: 'AUTO' }
    });

    // Resolve once auth state is determined (first callback)
    const unsub = firebase.auth().onAuthStateChanged((user) => {
        window.isUserLoggedIn = !!user;
        window.currentUser = user ? {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            email: user.email || ''
        } : null;
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: window.currentUser } }));
        resolve();
    });

    // Handle redirect result (fire-and-forget, onAuthStateChanged will handle it)
    firebase.auth().getRedirectResult().then((result) => {
        if (result && result.user) {
            console.log('Redirect sign-in successful:', result.user.displayName);
        }
    }).catch((e) => {
        console.error('Redirect sign-in error:', e);
    });
});

// ─── AUTH HELPERS ───
window.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        await firebase.auth().signInWithRedirect(provider);
        return true;
    } catch (e) {
        console.error('Sign-in error:', e);
        return false;
    }
};

window.signOutUser = async function() {
    try {
        await firebase.auth().signOut();
        return true;
    } catch (e) {
        console.error('Sign-out error:', e);
        return false;
    }
};

// ─── AUTH UI RENDERER ───
window.renderAuthUI = function(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;

    function update(user) {
        if (user) {
            c.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        ${user.photoURL ? `<img src="${user.photoURL}" class="w-7 h-7 rounded-full border border-white/20" referrerpolicy="no-referrer">` : `<div class="w-7 h-7 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold text-accent">${user.displayName.charAt(0).toUpperCase()}</div>`}
                        <span class="text-sm font-medium text-slate-200 hidden sm:inline">${user.displayName.split(' ')[0]}</span>
                    </div>
                    <button onclick="signOutUser()" class="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all active:scale-95" title="Logout">
                        <i class="fas fa-right-from-bracket text-sm"></i>
                    </button>
                </div>`;
        } else {
            c.innerHTML = `
                <button onclick="signInWithGoogle()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-black/20">
                    <svg viewBox="0 0 24 24" class="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Masuk
                </button>`;
        }
    }

    update(window.currentUser);
    window.addEventListener('authStateChanged', (e) => update(e.detail.user));
};
