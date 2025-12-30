import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHJKndz9GNJM5PF3-QwI6OA8oEIo2n4eg",
    authDomain: "visiaura-79db0.firebaseapp.com",
    projectId: "visiaura-79db0",
    storageBucket: "visiaura-79db0.firebasestorage.app",
    messagingSenderId: "303849950518",
    appId: "1:303849950518:web:f20967ceeb6ad5695bb797",
    measurementId: "G-LGMPTPG0C1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loader');
    const authSec = document.getElementById('auth-section');
    const appContent = document.getElementById('app-content');

    if (user) {
        authSec.classList.add('hidden');
        appContent.classList.remove('hidden');
        updateProfileUI(user);
        listenGlobalChat();
        showToast("Halo, " + (user.displayName || "Sobat Aura") + "!");
    } else {
        authSec.classList.remove('hidden');
        appContent.classList.add('hidden');
        createFloatingCards(); 
    }
    loader.style.display = 'none';
});

window.loginGoogle = () => signInWithPopup(auth, provider).catch(e => alert(e.message));
window.loginEmail = () => {
    const email = document.getElementById('email-log').value;
    const pass = document.getElementById('pass-log').value;
    if(!email || !pass) return;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Ops! " + e.message));
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
    if(!bg) return;
    bg.innerHTML = '';
    for(let i=0; i<15; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card shadow-lg';
        card.style.left = Math.random() * 90 + '%';
        card.style.animationDelay = Math.random() * 8 + 's';
        card.style.animationDuration = (8 + Math.random() * 10) + 's';
        card.innerHTML = `<img src="https://picsum.photos/seed/float-${i}/200/300" class="w-full h-full object-cover">`;
        bg.appendChild(card);
    }
}

const feed = document.getElementById('feed-container');
function populateFeed() {
    feed.innerHTML = '';
    for(let i=0; i<60; i++) {
        const heights = [200, 350, 280, 450, 310];
        const h = heights[i % heights.length];
        const item = document.createElement('div');
        item.className = 'masonry-item group cursor-zoom-in';
        item.innerHTML = `
            <img src="https://picsum.photos/seed/visi-${i}/400/${h}" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-4">
                <div class="flex justify-end">
                    <button class="bg-[#E60023] text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-red-700 active:scale-90 transition-all">Simpan</button>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md"></div>
                    <span class="text-white text-[10px] font-medium">Kreator Aura #${i+1}</span>
                </div>
            </div>
        `;
        feed.appendChild(item);
    }
}

function listenGlobalChat() {
    const q = query(collection(db, "aura_chat"), orderBy("createdAt", "asc"));
    onSnapshot(q, (snap) => {
        const box = document.getElementById('chat-box');
        box.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const isMe = d.uid === auth.currentUser?.uid;
            const msg = document.createElement('div');
            msg.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
            msg.innerHTML = `
                <div class="${isMe ? 'bg-[#E60023] text-white rounded-3xl rounded-tr-none shadow-red-100' : 'bg-white text-gray-800 rounded-3xl rounded-tl-none border border-gray-100'} p-4 max-w-[85%] shadow-sm">
                    <p class="text-[8px] font-black uppercase opacity-60 mb-1">${d.user}</p>
                    <p class="text-sm font-medium leading-relaxed">${d.text}</p>
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
    await addDoc(collection(db, "aura_chat"), {
        text,
        user: auth.currentUser.displayName || auth.currentUser.email,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp()
    });
};

window.startAiProcess = () => {
    const subjek = document.getElementById('aiSubjek').value;
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');

    if(!subjek) return alert("Sebutkan subjek aura kamu!");

    overlay.style.display = 'flex';
    const steps = ["Menganalisis Aura...", "Menghubungkan Google Veo 3...", "Merender Partikel Visual...", "Hampir Selesai..."];
    let i = 0;
    
    const timer = setInterval(() => {
        text.innerText = steps[i];
        i++;
        if(i >= steps.length) {
            clearInterval(timer);
            setTimeout(() => {
                overlay.style.display = 'none';
                showToast("Video Aura berhasil dibuat!");
                showSection('home');
            }, 1000);
        }
    }, 1500);
};

window.showToast = (msg) => {
    const toast = document.getElementById('toast');
    toast.querySelector('p:last-child').innerText = msg;
    toast.classList.remove('toast-hidden');
    setTimeout(() => {
        toast.classList.add('toast-hidden');
    }, 4000);
};

window.onload = () => {
    populateFeed();
    lucide.createIcons();
};
