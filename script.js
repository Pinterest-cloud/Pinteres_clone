import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHJKndz9GNJM5PF3-QwI6OA8oEIo2n4eg",
    authDomain: "visiaura-79db0.firebaseapp.com",
    projectId: "visiaura-79db0",
    storageBucket: "visiaura-79db0.firebasestorage.app",
    messagingSenderId: "303849950518",
    appId: "1:303849950518:web:f20967ceeb6ad5695bb797"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const MY_ICON = "https://ik.imagekit.io/Kenzo/IMG_20251226_162306.jpg?updatedAt=1766741300056";
let allFeed = [];

// AGAR FUNGSI BISA DIPANGGIL DARI HTML (MODUL SCOPE)
window.loginGoogle = () => signInWithPopup(auth, provider);
window.loginEmail = () => {
    const e = document.getElementById('email-log').value;
    const p = document.getElementById('pass-log').value;
    signInWithEmailAndPassword(auth, e, p).catch(err => window.showToast(err.message));
};
window.logout = () => signOut(auth);

window.showSection = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${id}`).classList.remove('hidden');
    document.querySelectorAll('.mobile-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-${id}`)?.classList.add('active');
    lucide.createIcons();
};

window.searchAura = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allFeed.filter(item => item.title.toLowerCase().includes(term));
    renderFeed(filtered);
};

window.uploadFromGallery = (event) => {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        allFeed.unshift({ url: e.target.result, title: "Lokal" });
        renderFeed(allFeed);
    };
    reader.readAsDataURL(file);
};

window.startRealAiProcess = async () => {
    const prompt = document.getElementById('aiPrompt').value;
    if(!prompt) return;
    document.getElementById('loadingOverlay').style.display = 'flex';
    const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
    const img = document.getElementById('aiResultImg');
    img.src = url;
    img.onload = () => {
        document.getElementById('ai-result-container').classList.remove('hidden');
        document.getElementById('loadingOverlay').style.display = 'none';
    };
};

window.sendMsg = async () => {
    const input = document.getElementById('chat-input');
    if(!input.value) return;
    await addDoc(collection(db, "aura_chat_v2"), {
        text: input.value,
        user: auth.currentUser.displayName || "User",
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp()
    });
    input.value = '';
};

window.showToast = (m) => {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = m;
    t.classList.remove('toast-hidden');
    setTimeout(() => t.classList.add('toast-hidden'), 3000);
};

// LISTEN AUTH
onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loader');
    if (user) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        document.getElementById('nav-username').innerText = user.displayName || "Sobat Aura";
        document.getElementById('avatar-container').innerHTML = `<img src="${user.photoURL || MY_ICON}" class="w-full h-full object-cover">`;
        initApp();
    } else {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
        document.getElementById('google-icon').src = MY_ICON;
        createBg();
    }
    loader.style.display = 'none'; // MATIKAN LOADING SCREEN
});

function initApp() {
    allFeed = [];
    for(let i=0; i<30; i++) {
        allFeed.push({ url: `https://picsum.photos/seed/${i+40}/400/${[300,500,400][i%3]}`, title: "Aura" });
    }
    renderFeed(allFeed);
    listenChat();
}

function renderFeed(items) {
    const container = document.getElementById('feed-container');
    container.innerHTML = items.map(it => `<div class="masonry-item"><img src="${it.url}"></div>`).join('');
}

function listenChat() {
    const q = query(collection(db, "aura_chat_v2"), orderBy("createdAt", "asc"));
    onSnapshot(q, (snap) => {
        const box = document.getElementById('chat-box');
        box.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const isMe = d.uid === auth.currentUser.uid;
            box.innerHTML += `<div class="flex ${isMe ? 'justify-end' : 'justify-start'}"><div class="${isMe ? 'bg-red-500 text-white' : 'bg-gray-100'} p-3 rounded-2xl text-sm">${d.text}</div></div>`;
        });
        box.scrollTop = box.scrollHeight;
    });
}

function createBg() {
    const bg = document.getElementById('floating-bg');
    bg.innerHTML = '';
    for(let i=0; i<20; i++) {
        bg.innerHTML += `<div class="floating-card" style="left:${Math.random()*90}%; animation-delay:${Math.random()*5}s"><img src="https://picsum.photos/seed/${i}/100/140" class="w-full h-full object-cover"></div>`;
    }
}
