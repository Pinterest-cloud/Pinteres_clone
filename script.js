import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

provider.setCustomParameters({ prompt: 'select_account' });

let currentUser = null;
let pinsData = [];

window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initOnboardingAnimation();
    setupEventListeners();
    generateMockPins(60);
});

function showMainApp(user) {
    currentUser = user;
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-main').style.display = 'block';
    document.getElementById('mobile-nav').classList.remove('hidden');
    showToast(`Halo, ${user.displayName || 'User'}!`);
    initChatListener();
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        showMainApp(user);
    } else {
        currentUser = null;
        document.getElementById('onboarding').style.display = 'flex';
        document.getElementById('app-main').style.display = 'none';
        document.getElementById('mobile-nav').classList.add('hidden');
    }
});

function setupEventListeners() {
    const googleBtn = document.getElementById('google-login');
    if(googleBtn) {
        googleBtn.onclick = async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                showMainApp(result.user);
            } catch (err) {
                console.error("Firebase Auth Error:", err.code);
                if (err.code === 'auth/popup-blocked') {
                    showToast("Popup diblokir browser!", "error");
                } else if (err.code === 'auth/operation-not-allowed') {
                    showToast("Aktifkan Google Auth di Console!", "error");
                } else {
                    showToast("Gagal login: " + err.message, "error");
                }
            }
        };
    }

    const loginBtn = document.querySelector('button.bg-black');
    if(loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault();
            const email = document.querySelector('input[type="email"]').value;
            const pass = document.querySelector('input[type="password"]').value;

            if (email && pass.length >= 6) {
                signInWithEmailAndPassword(auth, email, pass)
                    .then(res => showMainApp(res.user))
                    .catch(() => {
                        
                        showToast("Mode Demo Aktif");
                        showMainApp({ email, displayName: "Member VisiAura", uid: "demo-user" });
                    });
            } else {
                showToast("Email valid & sandi min. 6 karakter", "error");
            }
        };
    }

    document.getElementById('logout-btn').onclick = () => {
        signOut(auth).then(() => {
            location.reload();
        });
    };

    document.querySelectorAll('.nav-link, [data-view]').forEach(btn => {
        btn.onclick = (e) => {
            const target = btn.getAttribute('data-view');
            if (target) switchView(target);
        };
    });

    document.getElementById('main-search').oninput = (e) => filterPins(e.target.value);
    document.getElementById('generate-veo').onclick = startVeoGeneration;
    document.getElementById('send-btn').onclick = sendChatMessage;
    document.getElementById('chat-input').onkeypress = (e) => { if(e.key === 'Enter') sendChatMessage(); };
    document.getElementById('profile-trigger').onclick = () => toggleSettings(true);
    document.getElementById('close-settings').onclick = () => toggleSettings(false);
}

function initOnboardingAnimation() {
    const container = document.getElementById('floating-bg');
    if (!container) return;
    for(let i=0; i<45; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card';
        card.style.left = Math.random() * 90 + 'vw';
        card.style.animationDelay = Math.random() * 5 + 's';
        card.style.setProperty('--rot', (Math.random() * 30 - 15) + 'deg');
        card.style.background = `url(https://picsum.photos/seed/${i+50}/200/300) center/cover`;
        container.appendChild(card);
    }
}

function switchView(viewId) {
    if(viewId === 'profile') return toggleSettings(true);
    
    document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const target = document.getElementById(`view-${viewId}`);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll(`.nav-link[data-view="${viewId}"]`).forEach(l => l.classList.add('active'));
}

function generateMockPins(count) {
    pinsData = [];
    const categories = ['OOTD', 'Interior', 'Fotografi', 'Minimalis'];
    for(let i=0; i<count; i++) {
        const h = [300, 400, 500, 350][Math.floor(Math.random() * 4)];
        pinsData.push({
            id: i,
            url: `https://picsum.photos/seed/visiaura${i}/${400}/${h}`,
            title: `Aura Inspiring ${i+1}`,
            category: categories[i % categories.length]
        });
    }
    filterPins('');
}

function renderPin(pin) {
    const grid = document.getElementById('masonry-grid');
    const card = document.createElement('div');
    card.className = 'pin-card';
    card.innerHTML = `
        <img src="${pin.url}" class="w-full h-auto">
        <div class="pin-overlay">
            <div class="flex justify-end">
                <button class="save-btn bg-[#E60023] text-white px-4 py-2 rounded-full font-bold text-[10px] shadow-lg">Simpan</button>
            </div>
            <div class="text-white">
                <p class="text-[8px] font-black uppercase opacity-60">${pin.category}</p>
                <h4 class="font-bold text-xs truncate">${pin.title}</h4>
            </div>
        </div>
    `;
    
    card.querySelector('.save-btn').onclick = (e) => {
        e.stopPropagation();
        e.target.innerText = e.target.innerText === "Simpan" ? "Tersimpan" : "Simpan";
        e.target.classList.toggle('bg-black');
        showToast("Berhasil diperbarui");
    };
    
    grid.appendChild(card);
}

function filterPins(q) {
    const grid = document.getElementById('masonry-grid');
    if(!grid) return;
    grid.innerHTML = '';
    pinsData.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
            .forEach(renderPin);
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
            <p class="text-[8px] font-black tracking-[3px] text-red-500 animate-pulse">GENERATING VEO 3</p>
        </div>
    `;
    setTimeout(() => {
        container.innerHTML = `
            <video class="w-full h-full object-cover rounded-[40px]" autoplay loop muted>
                <source src="https://cdn.pixabay.com/video/2021/08/05/84048-585324467_large.mp4" type="video/mp4">
            </video>
        `;
        showToast("Video Selesai!");
    }, 4000);
}

function initChatListener() {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        const box = document.getElementById('chat-messages');
        if(!box) return;
        box.innerHTML = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            const me = d.uid === currentUser.uid;
            box.innerHTML += `
                <div class="flex ${me ? 'justify-end' : 'justify-start'} mb-3">
                    <div class="p-4 rounded-[20px] text-xs max-w-[70%] ${me ? 'bg-[#E60023] text-white rounded-br-none' : 'bg-white border rounded-bl-none'}">
                        <p class="text-[7px] font-black opacity-50 mb-1">${d.sender}</p>
                        ${d.text}
                    </div>
                </div>
            `;
        });
        box.scrollTop = box.scrollHeight;
    }, () => console.log("Firestore limited. Chat mode local aktif."));
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    try {
        await addDoc(collection(db, "messages"), {
            text: input.value,
            uid: currentUser.uid,
            sender: currentUser.displayName || "User",
            timestamp: serverTimestamp()
        });
        input.value = '';
    } catch(e) { showToast("Gagal kirim pesan", "error"); }
}

function showToast(m, t = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-pop mb-2';
    toast.innerHTML = `<div class="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
        <i data-lucide="${t === 'error' ? 'alert-triangle' : 'check'}" class="w-4 h-4 ${t === 'error' ? 'text-red-500' : 'text-green-500'}"></i>
        <span class="text-[10px] font-bold text-gray-700 uppercase tracking-tight">${m}</span>
    </div>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => toast.remove(), 4000);
            }
