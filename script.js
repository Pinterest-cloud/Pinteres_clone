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

const MY_CUSTOM_ICON = "https://ik.imagekit.io/Kenzo/IMG_20251226_162306.jpg?updatedAt=1766741300056";
let allFeedData = []; /

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
        

        const gIcon = document.querySelector('.google-btn img');
        if(gIcon) {
            gIcon.src = MY_CUSTOM_ICON;
            gIcon.style.borderRadius = "50%";
        }
        createFloatingCards();
    }
    if(loader) loader.style.display = 'none';
});

window.loginGoogle = () => signInWithPopup(auth, provider);
window.loginEmail = () => {
    const email = document.getElementById('email-log').value;
    const pass = document.getElementById('pass-log').value;
    if(!email || !pass) return showToast("Isi email dan sandi!");
    signInWithEmailAndPassword(auth, email, pass).catch(e => showToast("Gagal: " + e.message));
};
window.logout = () => signOut(auth);

function updateProfileUI(user) {
    const navUser = document.getElementById('nav-username');
    if(navUser) navUser.innerText = user.displayName || user.email.split('@')[0];
    
    const avatar = document.getElementById('avatar-container');
    if(avatar) {
        avatar.innerHTML = `<img src="${user.photoURL || MY_CUSTOM_ICON}" class="w-full h-full object-cover">`;
    }
}

window.showSection = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`tab-${id}`);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll('.mobile-nav button').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById(`nav-${id}`);
    if(navBtn) navBtn.classList.add('active');
    
    lucide.createIcons();
};

function createFloatingCards() {
    const bg = document.getElementById('floating-bg');
    if(!bg) return; bg.innerHTML = '';
    for(let i=0; i<40; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card shadow-lg';
        card.style.left = Math.random() * 90 + '%';
        card.style.animationDelay = Math.random() * 5 + 's';
        card.innerHTML = `<img src="https://picsum.photos/seed/fl-${i}/200/300" class="w-full h-full object-cover">`;
        bg.appendChild(card);
    }
}

function populateFeed() {
    allFeedData = [];
    const feed = document.getElementById('feed-container');
    if(!feed) return;

    for(let i=0; i<60; i++) {
        const h = [250, 400, 300, 450][i % 4];
        const seed = Math.floor(Math.random() * 99999);
        const tags = ["AI Art", "Fotografi", "Anime", "Cyberpunk"];
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        
        const url = `https://pollinations.ai/p/aesthetic-style-${seed}?width=400&height=${h}&seed=${seed}&nologo=true&model=flux`;
        allFeedData.push({ url, title: randomTag });
    }
    renderFeed(allFeedData);
}

function renderFeed(items) {
    const feed = document.getElementById('feed-container');
    feed.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'masonry-item group cursor-pointer bg-gray-200 rounded-xl overflow-hidden mb-4';
        div.innerHTML = `<img src="${item.url}" loading="lazy" class="w-full h-auto hover:scale-105 transition-transform duration-500">`;
        feed.appendChild(div);
    });
}

window.searchAura = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allFeedData.filter(item => item.title.toLowerCase().includes(term));
    renderFeed(filtered);
};

window.uploadFromGallery = (event) => {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const newImg = { url: e.target.result, title: "Unggahan" };
        allFeedData.unshift(newImg);
        renderFeed(allFeedData);
        showToast("Berhasil ditambahkan ke feed!");
    };
    reader.readAsDataURL(file);
};

window.startRealAiProcess = async () => {
    const promptInput = document.getElementById('aiPrompt');
    const prompt = promptInput.value.trim();
    const overlay = document.getElementById('loadingOverlay');
    const resultContainer = document.getElementById('ai-result-container');
    const resultImg = document.getElementById('aiResultImg');
    const btn = document.getElementById('btnGenerate');

    if(!prompt) return showToast("Tulis deskripsi Aura!");

    overlay.style.display = 'flex';
    btn.disabled = true;

    const seed = Math.floor(Math.random() * 999999);
    const apiUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
    
    const imgLoader = new Image();
    imgLoader.src = apiUrl;
    imgLoader.onload = () => {
        resultImg.src = apiUrl;
        resultContainer.classList.remove('hidden');
        overlay.style.display = 'none';
        btn.disabled = false;
        lucide.createIcons();
        showToast("Gambar Berhasil Terwujud!");
    };
    imgLoader.onerror = () => {
        overlay.style.display = 'none';
        btn.disabled = false;
        showToast("Gagal memuat, coba lagi.");
    };
};

window.saveAiResult = () => {
    const imgUrl = document.getElementById('aiResultImg').src;
    window.open(imgUrl, '_blank');
};

function listenGlobalChat() {
    const q = query(collection(db, "aura_chat_v2"), orderBy("createdAt", "asc"));
    onSnapshot(q, (snap) => {
        const box = document.getElementById('chat-box');
        if(!box) return;
        box.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const isMe = d.uid === auth.currentUser?.uid;
            const msg = document.createElement('div');
            msg.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
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

window.addEventListener('load', () => {
    lucide.createIcons();
});
