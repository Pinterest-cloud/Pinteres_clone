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
const GOOGLE_ICON_FIX = "https://ik.imagekit.io/Kenzo/IMG_20251226_162306.jpg?updatedAt=1766741300056";

onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loader');
    const authSec = document.getElementById('auth-section');
    const appContent = document.getElementById('app-content');

    if (user) {
        authSec.classList.add('hidden');
        appContent.classList.remove('hidden');
        updateProfileUI(user);
        listenGlobalChat();
        populateFeed();
        showToast("Halo, " + (user.displayName || "Sobat Aura"));
    } else {
        authSec.classList.remove('hidden');
        appContent.classList.add('hidden');
        fixGoogleBtnIcon(); 
        createFloatingCards();
    }
    loader.style.display = 'none';
});

function fixGoogleBtnIcon() {
    const btnIcon = document.querySelector('.google-btn img');
    if(btnIcon) {
        btnIcon.src = GOOGLE_ICON_FIX;
        btnIcon.style.borderRadius = "50%"; 
    }
}

window.loginGoogle = () => signInWithPopup(auth, provider);
window.loginEmail = () => {
    const email = document.getElementById('email-log').value;
    const pass = document.getElementById('pass-log').value;
    if(!email || !pass) return;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};
window.logout = () => signOut(auth);

function updateProfileUI(user) {
    document.getElementById('nav-username').innerText = user.displayName || user.email.split('@')[0];
    const avatar = document.getElementById('avatar-container');
    avatar.innerHTML = user.photoURL 
        ? `<img src="${user.photoURL}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">${user.email[0].toUpperCase()}</div>`;
}

window.showSection = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${id}`).classList.remove('hidden');
    document.querySelectorAll('.mobile-nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${id}`).classList.add('active');
    lucide.createIcons();
};

function createFloatingCards() {
    const bg = document.getElementById('floating-bg');
    if(!bg) return; bg.innerHTML = '';
    for(let i=0; i<15; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card shadow-lg';
        card.style.left = Math.random() * 90 + '%';
        card.style.animationDelay = Math.random() * 5 + 's';
        card.innerHTML = `<img src="https://picsum.photos/seed/fl-${i}/200/300" class="w-full h-full object-cover">`;
        bg.appendChild(card);
    }
}

function populateFeed() {
    const feed = document.getElementById('feed-container');
    feed.innerHTML = '';
    for(let i=0; i<50; i++) {
        const h = [250, 400, 300, 450][i % 4];
        const seed = Math.floor(Math.random() * 9999);
        const item = document.createElement('div');
        item.className = 'masonry-item group cursor-pointer bg-gray-200';
        
        const aiUrl = `https://pollinations.ai/p/modest-fashion-style-${seed}?width=400&height=${h}&seed=${seed}&nologo=true`;
        item.innerHTML = `<img src="${aiUrl}" loading="lazy" class="w-full h-auto min-h-[100px]">`;
        feed.appendChild(item);
    }
}

window.startRealAiProcess = async () => {
    const promptInput = document.getElementById('aiPrompt');
    const prompt = promptInput.value.trim();
    const overlay = document.getElementById('loadingOverlay');
    const resultContainer = document.getElementById('ai-result-container');
    const resultImg = document.getElementById('aiResultImg');
    const btn = document.getElementById('btnGenerate');

    if(!prompt) return showToast("Tulis deskripsi auramu!");

    overlay.style.display = 'flex';
    btn.disabled = true;
    btn.innerText = "SHUTTT LAGI BUAT...";

    const seed = Math.floor(Math.random() * 999999);
    const apiUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    resultContainer.classList.add('hidden');
    
    const tempImg = new Image();
    tempImg.src = apiUrl;
    
    tempImg.onload = () => {
        resultImg.src = apiUrl;
        resultContainer.classList.remove('hidden');
        overlay.style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = `<span>BUAT LAGI</span> <i data-lucide="refresh-cw" class="w-4 h-4"></i>`;
        lucide.createIcons();
        showToast("Aura Berhasil Nih!");
    };
    
    tempImg.onerror = () => {
        const retryUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed+1}&nologo=true`;
        resultImg.src = retryUrl;
        resultContainer.classList.remove('hidden');
        overlay.style.display = 'none';
        btn.disabled = false;
        btn.innerText = "AYO SEMANGAT";
    };
};

window.saveAiResult = () => {
    const imgUrl = document.getElementById('aiResultImg').src;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.target = "_blank";
    link.download = `VisiAura-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function listenGlobalChat() {
    const q = query(collection(db, "aura_chat_v2"), orderBy("createdAt", "asc"));
    onSnapshot(q, (snap) => {
        const box = document.getElementById('chat-box');
        box.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const isMe = d.uid === auth.currentUser?.uid;
            const msg = document.createElement('div');
            msg.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
            msg.innerHTML = `
                <div class="${isMe ? 'bg-[#E60023] text-white rounded-2xl rounded-tr-none' : 'bg-white rounded-2xl rounded-tl-none border border-gray-100'} p-3 max-w-[85%] shadow-sm">
                    <p class="text-[8px] font-bold uppercase opacity-50 mb-1">${d.user}</p>
                    <p class="text-sm">${d.text}</p>
                </div>
            `;
            box.appendChild(msg);
        });
        box.scrollTop = box.scrollHeight;
    });
}

window.sendMsg = async () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;
    input.value = '';
    try {
        await addDoc(collection(db, "aura_chat_v2"), {
            text,
            user: auth.currentUser.displayName || auth.currentUser.email,
            uid: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });
    } catch(e) { console.error(e); }
};

window.showToast = (msg) => {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if(!toast || !toastMsg) return;
    toastMsg.innerText = msg;
    toast.classList.remove('toast-hidden');
    setTimeout(() => toast.classList.add('toast-hidden'), 3000);
};

window.onload = () => {
    lucide.createIcons();
};
