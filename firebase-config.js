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

// ─── FIRESTORE HELPERS ───
window.saveScoreToFirestore = async function(data) {
    if (!window.firebaseDB || !window.isUserLoggedIn) return null;
    try {
        const doc = {
            userId: window.currentUser.uid,
            userName: window.currentUser.displayName,
            userPhoto: window.currentUser.photoURL,
            gameType: data.gameType,
            score: data.score,
            accuracy: data.accuracy || 0,
            maxCombo: data.maxCombo || 0,
            totalQuestions: data.totalQuestions || 0,
            correctCount: data.correctCount || 0,
            difficulty: data.difficulty || '',
            duration: data.duration || 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        const ref = await window.firebaseDB.collection('scores').add(doc);
        return ref.id;
    } catch (e) {
        console.error('Save score error:', e);
        return null;
    }
};

window.getLeaderboardFromFirestore = async function(gameType, limitCount = 100) {
    if (!window.firebaseDB) return [];
    try {
        const snap = await window.firebaseDB.collection('scores')
            .where('gameType', '==', gameType)
            .orderBy('score', 'desc')
            .limit(limitCount)
            .get();
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const bestMap = new Map();
        all.forEach(entry => {
            const existing = bestMap.get(entry.userId);
            if (!existing || entry.score > existing.score) {
                bestMap.set(entry.userId, entry);
            }
        });
        return Array.from(bestMap.values());
    } catch (e) {
        console.error('Leaderboard fetch error:', e);
        return [];
    }
};

window.getUserScoresFromFirestore = async function(gameType) {
    if (!window.firebaseDB || !window.isUserLoggedIn) return [];
    try {
        const snap = await window.firebaseDB.collection('scores')
            .where('gameType', '==', gameType)
            .where('userId', '==', window.currentUser.uid)
            .orderBy('score', 'desc')
            .limit(20)
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error('User scores fetch error:', e);
        return [];
    }
};

window.getGlobalStatsFromFirestore = async function() {
    if (!window.firebaseDB) return { totalScores: 0, latest: null };
    try {
        const snap = await window.firebaseDB.collection('scores')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        const totalSnap = await window.firebaseDB.collection('scores').count().get();
        return { totalScores: totalSnap.data().count, latest: snap.empty ? null : snap.docs[0].data() };
    } catch (e) {
        return { totalScores: 0, latest: null };
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

// ─── LEADERBOARD DISPLAY HELPERS ───
window.renderLeaderboardTable = function(scores, container, options = {}) {
    const { showUserPhoto = true, highlightUserId = null, maxEntries = 10, emptyMessage = 'Belum ada skor tersimpan.' } = options;
    const c = typeof container === 'string' ? document.getElementById(container) : container;
    if (!c) return;

    if (!scores || scores.length === 0) {
        c.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${emptyMessage}</div>`;
        return;
    }

    const medals = ['bg-amber-500 text-slate-950', 'bg-slate-300 text-slate-800', 'bg-orange-600 text-white'];
    const entries = scores.slice(0, maxEntries);

    let html = '<div class="space-y-2">';
    entries.forEach((s, i) => {
        const isMe = highlightUserId && s.userId === highlightUserId;
        const medal = i < 3 ? medals[i] : 'bg-slate-700 text-slate-300';
        const highlight = isMe ? 'ring-1 ring-accent/40 bg-accent/5' : '';
        const ts = s.createdAt ? (s.createdAt.toDate ? s.createdAt.toDate().toLocaleDateString('id-ID') : new Date(s.createdAt.seconds * 1000).toLocaleDateString('id-ID')) : (s.date || '-');

        html += `
        <div class="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-white/5 ${highlight} transition-all">
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <span class="w-6 h-6 rounded-full ${medal} flex items-center justify-center text-xs font-bold shrink-0">${i + 1}</span>
                ${showUserPhoto ? (s.userPhoto ? `<img src="${s.userPhoto}" class="w-7 h-7 rounded-full border border-white/10 shrink-0" referrerpolicy="no-referrer">` : `<div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">${(s.userName || '?').charAt(0).toUpperCase()}</div>`) : ''}
                <div class="min-w-0 flex-1">
                    <div class="text-xs sm:text-sm font-semibold text-slate-200 truncate">${isMe ? '<span class="text-accent">Kamu</span>' : (s.userName || 'Anonymous')}</div>
                    <div class="text-[10px] text-slate-500">${ts}${s.difficulty ? ' \u00b7 ' + s.difficulty : ''}${s.accuracy != null ? ' \u00b7 ' + s.accuracy + '%' : ''}</div>
                </div>
            </div>
            <div class="text-amber-400 font-extrabold text-sm sm:text-base shrink-0 ml-2">${Number(s.score).toLocaleString('id-ID')}</div>
        </div>`;
    });
    html += '</div>';
    c.innerHTML = html;
};

window.formatFirestoreTimestamp = function(ts) {
    if (!ts) return '-';
    if (ts.toDate) return ts.toDate().toLocaleDateString('id-ID');
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('id-ID');
    return '-';
};
