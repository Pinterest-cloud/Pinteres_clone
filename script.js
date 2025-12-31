import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentUser = null;
let pinsData = [];

window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initOnboardingAnimation();
    setupEventListeners();
    generateMockPins(60);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('onboarding').style.display = 'none';
        document.getElementById('app-main').style.display = 'block';
        document.getElementById('mobile-nav').classList.remove('hidden');
        showToast("Selamat Datang, " + (user.displayName || "Aura Member"));
        initChatListener();
    } else {
        currentUser = null;
        document.getElementById('onboarding').style.display = 'flex';
        document.getElementById('app-main').style.display = 'none';
        document.getElementById('mobile-nav').classList.add('hidden');
    }
});

function setupEventListeners() {
    document.getElementById('google-login').onclick = () => {
        signInWithPopup(auth, provider).catch(err => showToast("Gagal terhubung ke Google", "error"));
    };

    document.getElementById('logout-btn').onclick = () => {
        signOut(auth).then(() => toggleSettings(false));
    };

    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.onclick = () => {
            const target = btn.getAttribute('data-view');
            switchView(target);
        };
    });

    document.getElementById('main-search').oninput = (e) => {
        filterPins(e.target.value);
    };

    document.getElementById('generate-veo').onclick = startVeoGeneration;

    document.getElementById('send-btn').onclick = sendChatMessage;
    document.getElementById('chat-input').onkeypress = (e) => {
        if(e.key === 'Enter') sendChatMessage();
    };

    document.getElementById('profile-trigger').onclick = () => toggleSettings(true);
    document.getElementById('close-settings').onclick = () => toggleSettings(false);
}

function initOnboardingAnimation() {
    const container = document.getElementById('floating-bg');
    for(let i=0; i<30; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card';
        card.style.left = Math.random() * 90 + 'vw';
        card.style.animationDelay = Math.random() * 8 + 's';
        card.style.animationDuration = (Math.random() * 5 + 8) + 's';
        card.style.setProperty('--rot', (Math.random() * 40 - 20) + 'deg');
        card.style.background = `url(https://picsum.photos/seed/${i+100}/200/300) center/cover`;
        container.appendChild(card);
    }
}

function switchView(viewId) {
    if(viewId === 'profile') {
        toggleSettings(true);
        return;
    }
    
    document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const target = document.getElementById(`view-${viewId}`);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll(`.nav-link[data-view="${viewId}"]`).forEach(l => l.classList.add('active'));
}

function generateMockPins(count) {
    const grid = document.getElementById('masonry-grid');
    const categories = ['OOTD', 'Interior', 'Fotografi', 'Streetwear', 'Minimalis'];
    
    for(let i=0; i<count; i++) {
        const cat = categories[i % categories.length];
        const height = [280, 350, 420, 500][Math.floor(Math.random() * 4)];
        const pin = {
            id: i,
            url: `https://picsum.photos/seed/aura${i}/${400}/${height}`,
            title: `Aura Style ${i+1}`,
            category: cat,
            likes: Math.floor(Math.random() * 900)
        };
        pinsData.push(pin);
        renderPin(pin);
    }
}

function renderPin(pin) {
    const grid = document.getElementById('masonry-grid');
    const card = document.createElement('div');
    card.className = 'pin-card';
    card.innerHTML = `
        <img src="${pin.url}" class="w-full h-auto" loading="lazy">
        <div class="pin-overlay">
            <div class="flex justify-end">
                <button class="save-btn bg-[#E60023] text-white px-5 py-2.5 rounded-full font-extrabold text-xs shadow-lg active:scale-90 transition-transform">Simpan</button>
            </div>
            <div class="text-white">
                <p class="text-[10px] font-black tracking-widest uppercase opacity-70">${pin.category}</p>
                <h4 class="font-extrabold text-sm truncate">${pin.title}</h4>
            </div>
        </div>
    `;

    const saveBtn = card.querySelector('.save-btn');
    saveBtn.onclick = (e) => {
        e.stopPropagation();
        const isSaved = saveBtn.innerText === "Simpan";
        saveBtn.innerText = isSaved ? "Tersimpan" : "Simpan";
        saveBtn.style.backgroundColor = isSaved ? "#000" : "#E60023";
        showToast(isSaved ? "Tersimpan ke Papan" : "Dihapus dari Papan");
    };

    grid.appendChild(card);
}

function filterPins(query) {
    const grid = document.getElementById('masonry-grid');
    grid.innerHTML = '';
    const filtered = pinsData.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
    );
    filtered.forEach(p => renderPin(p));
}

function toggleSettings(show) {
    const panel = document.getElementById('settings-panel');
    const content = document.getElementById('settings-content');
    if(show) {
        panel.classList.remove('hidden');
        setTimeout(() => content.style.transform = 'translateY(0)', 10);
    } else {
        content.style.transform = 'translateY(100%)';
        setTimeout(() => panel.classList.add('hidden'), 500);
    }
}

function startVeoGeneration() {
    const container = document.getElementById('video-preview-container');
    container.innerHTML = `
        <div class="flex flex-col items-center">
            <div class="infinity-loop mb-4"></div>
            <p class="text-[10px] font-black tracking-[4px] text-red-500 animate-pulse">VEO GENERATING</p>
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = `
            <video class="w-full h-full object-cover scale-95 opacity-0 transition-all duration-700" id="veo-video" autoplay loop muted>
                <source src="https://cdn.pixabay.com/video/2021/08/05/84048-585324467_large.mp4" type="video/mp4">
            </video>
        `;
        const v = document.getElementById('veo-video');
        setTimeout(() => {
            v.classList.remove('scale-95', 'opacity-0');
            v.classList.add('scale-100', 'opacity-100');
        }, 50);
        showToast("Video Berhasil Dibuat!");
    }, 4500);
}

function initChatListener() {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        const chatBox = document.getElementById('chat-messages');
        chatBox.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const isMe = data.uid === currentUser.uid;
            const msgDiv = document.createElement('div');
            msgDiv.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
            msgDiv.innerHTML = `
                <div class="max-w-[80%] p-4 rounded-[25px] text-sm shadow-sm ${isMe ? 'bg-[#E60023] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}">
                    <p class="text-[8px] font-black opacity-50 mb-1 uppercase tracking-tighter">${data.sender}</p>
                    ${data.text}
                </div>
            `;
            chatBox.appendChild(msgDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text || !currentUser) return;
    
    input.value = '';
    try {
        await addDoc(collection(db, "messages"), {
            text: text,
            uid: currentUser.uid,
            sender: currentUser.displayName || currentUser.email,
            timestamp: serverTimestamp()
        });
    } catch(e) {
        showToast("Pesan gagal terkirim", "error");
    }
}

function showToast(msg, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-pop mb-4';
    toast.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center ${type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
            <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}" class="w-4 h-4"></i>
        </div>
        <p class="text-xs font-black text-gray-800 uppercase tracking-wide">${msg}</p>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => toast.remove(), 4000);
          }
