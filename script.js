import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjy-TL1OIZcWoXafKpjjGP45tfbe1B5Sc",
    authDomain: "visiauracl-8339a.firebaseapp.com",
    projectId: "visiauracl-8339a",
    storageBucket: "visiauracl-8339a.firebasestorage.app",
    messagingSenderId: "780780435918",
    appId: "1:780780435918:web:a66a8180324903126c139f"
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
        listenChat();
    } else {
        authSec.classList.remove('hidden');
        appContent.classList.add('hidden');
    }
    loader.style.display = 'none';
});

window.loginGoogle = () => signInWithPopup(auth, provider);
window.loginEmail = () => {
    const email = document.getElementById('email-log').value;
    const pass = document.getElementById('pass-log').value;
    if(!email || !pass) return;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Error: " + e.message));
};
window.logout = () => signOut(auth);

function updateProfileUI(user) {
    document.getElementById('nav-username').innerText = user.displayName || user.email.split('@')[0];
    const avatar = document.getElementById('avatar-container');
    avatar.innerHTML = user.photoURL 
        ? `<img src="${user.photoURL}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full bg-red-500 text-white flex items-center justify-center font-bold">${user.email[0].toUpperCase()}</div>`;
}

window.showSection = (sectionId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${sectionId}`).classList.remove('hidden');
    document.querySelectorAll('.mobile-nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${sectionId}`).classList.add('active');

    lucide.createIcons();
};

const feed = document.getElementById('feed-container');
function populateFeed() {
    feed.innerHTML = '';
    for(let i=0; i<20; i++) {
        const h = [200, 320, 260, 400][i % 4];
        const item = document.createElement('div');
        item.className = 'masonry-item group cursor-pointer';
        item.innerHTML = `
            <img src="https://picsum.photos/seed/aura-${i}/400/${h}" class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span class="text-white font-bold text-sm">VisiAura Inspiration #${i+1}</span>
                <span class="text-white/60 text-[10px]">Klik untuk detail</span>
            </div>
        `;
        feed.appendChild(item);
    }
}

function listenChat() {
    const q = query(collection(db, "global_messages"), orderBy("createdAt", "asc"));
    onSnapshot(q, (snapshot) => {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const isMe = data.uid === auth.currentUser?.uid;
            const msg = document.createElement('div');
            msg.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
            msg.innerHTML = `
                <div class="${isMe ? 'bg-[#E60023] text-white rounded-2xl rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none'} p-3 max-w-[85%] text-sm shadow-sm">
                    <p class="text-[9px] font-bold opacity-50 mb-1">${data.user}</p>
                    <p>${data.text}</p>
                </div>
            `;
            chatBox.appendChild(msg);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

window.sendMsg = async () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await addDoc(collection(db, "global_messages"), {
        text,
        user: auth.currentUser.displayName || auth.currentUser.email,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp()
    });
};

window.startAiProcess = () => {
    const prompt = document.getElementById('aiPrompt').value;
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');

    if(!prompt) return alert("Masukkan prompt aura dulu!");

    overlay.style.display = 'flex';
    const steps = ["Menganalisis Prompt...", "Memanggil VisiAura Cloud...", "Merender Partikel...", "Hampir Selesai..."];
    let i = 0;
    
    const timer = setInterval(() => {
        text.innerText = steps[i];
        i++;
        if(i >= steps.length) {
            clearInterval(timer);
            setTimeout(() => {
                overlay.style.display = 'none';
                alert("Visualisasi Aura Berhasil Dibuat!");
                showSection('home');
            }, 1000);
        }
    }, 1500);
};

window.searchAura = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
};

window.onload = () => {
    populateFeed();
    lucide.createIcons();
};
