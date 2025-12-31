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

let currentUser = null;
let pinsData = [];

function showMainApp(user) {
    currentUser = user;
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-main').style.display = 'block';
    document.getElementById('mobile-nav').classList.remove('hidden');
    showToast(`Selamat Datang, ${user.displayName || user.email}`);
    initChatListener();
    generateMockPins(60);
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
    document.getElementById('google-login').onclick = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            
        } catch (error) {
            console.error("Error Google:", error.code);
            if(error.code === 'auth/popup-blocked') {
                showToast("Popup diblokir browser!", "error");
            } else if(error.code === 'auth/operation-not-allowed') {
                showToast("Aktifkan Google Login di Firebase!", "error");
            } else {
                showToast("Gagal Login Google", "error");
            }
        }
    };

    const loginBtn = document.querySelector('button.bg-black');
    loginBtn.onclick = async (e) => {
        e.preventDefault();
        const email = document.querySelector('input[type="email"]').value;
        const pass = document.querySelector('input[type="password"]').value;

        if (email && pass.length >= 6) {
            try {
                await signInWithEmailAndPassword(auth, email, pass);
            } catch (error) {
                console.error("Error Login:", error.code);
                if(error.code === 'auth/user-not-found') {
                    showToast("Email belum terdaftar!", "error");
                } else if(error.code === 'auth/wrong-password') {
                    showToast("Sandi salah!", "error");
                } else if(error.code === 'auth/invalid-credential') {
                    showToast("Email/Sandi tidak valid!", "error");
                } else {
                    showToast("Gagal masuk. Cek akun Anda.", "error");
                }
            }
        } else {
            showToast("Masukkan Email & Sandi (min. 6 karakter)", "error");
        }
    };
    
    document.getElementById('logout-btn').onclick = () => {
        signOut(auth).then(() => {
            showToast("Berhasil Keluar");
        });
    };

    document.querySelectorAll('.nav-link, [data-view]').forEach(btn => {
        btn.onclick = () => {
            const viewId = btn.getAttribute('data-view');
            if(viewId) switchView(viewId);
        };
    });
    
    document.getElementById('main-search').oninput = (e) => filterPins(e.target.value);
    document.getElementById('generate-veo').onclick = startVeoGeneration;
    document.getElementById('send-btn').onclick = sendChatMessage;
    document.getElementById('chat-input').onkeypress = (e) => { if(e.key === 'Enter') sendChatMessage(); };
    document.getElementById('profile-trigger').onclick = () => toggleSettings(true);
    document.getElementById('close-settings').onclick = () => toggleSettings(false);
}

function generateMockPins(count) {
    const grid = document.getElementById('masonry-grid');
    if(!grid) return;
    grid.innerHTML = '';
    pinsData = [];
    const cats = ['OOTD', 'Art', 'Interior', 'Tech'];
    for(let i=0; i<count; i++) {
        const pin = {
            id: i,
            url: `https://picsum.photos/seed/aura${i}/${400}/${[300, 450, 550, 400][i%4]}`,
            title: `Inspirasi Aura ${i+1}`,
            category: cats[i%4]
        };
        pinsData.push(pin);
        renderPin(pin);
    }
}

function renderPin(pin) {
    const grid = document.getElementById('masonry-grid');
    const div = document.createElement('div');
    div.className = 'pin-card';
    div.innerHTML = `
        <img src="${pin.url}" class="w-full h-auto">
        <div class="pin-overlay">
            <button class="ml-auto bg-[#E60023] text-white px-4 py-2 rounded-full font-bold text-[10px]">Simpan</button>
            <div class="text-white"><p class="text-[8px] opacity-60 uppercase font-black">${pin.category}</p><h4 class="text-xs font-bold truncate">${pin.title}</h4></div>
        </div>
    `;
    grid.appendChild(div);
}

function filterPins(q) {
    const grid = document.getElementById('masonry-grid');
    if(!grid) return;
    grid.innerHTML = '';
    pinsData.filter(p => p.title.toLowerCase().includes(q.toLowerCase())).forEach(renderPin);
}

function switchView(id) {
    if(id === 'profile') return toggleSettings(true);
    document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`view-${id}`).classList.remove('hidden');
    document.querySelectorAll(`[data-view="${id}"]`).forEach(l => l.classList.add('active'));
}

function toggleSettings(s) {
    const p = document.getElementById('settings-panel');
    const c = document.getElementById('settings-content');
    if(s) { p.classList.remove('hidden'); setTimeout(()=>c.style.transform='translateY(0)',10); }
    else { c.style.transform='translateY(100%)'; setTimeout(()=>p.classList.add('hidden'),500); }
}

function startVeoGeneration() {
    const box = document.getElementById('video-preview-container');
    box.innerHTML = `<div class="text-center"><div class="infinity-loop mx-auto mb-4"></div><p class="text-red-500 font-black text-[10px] animate-pulse">GENERATING VEO 3 VIDEO...</p></div>`;
    setTimeout(() => {
        box.innerHTML = `<video class="w-full h-full object-cover rounded-[30px]" autoplay loop muted><source src="https://cdn.pixabay.com/video/2021/08/05/84048-585324467_large.mp4"></video>`;
        showToast("Video Estetik Selesai!");
    }, 4000);
}

function initChatListener() {
    if(!currentUser) return;
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(q, (s) => {
        const b = document.getElementById('chat-messages');
        if(!b) return; b.innerHTML = '';
        s.forEach(d => {
            const m = d.data();
            const me = m.uid === currentUser.uid;
            b.innerHTML += `<div class="flex ${me ? 'justify-end' : 'justify-start'} mb-3"><div class="p-3 px-4 rounded-[20px] text-xs ${me?'bg-[#E60023] text-white rounded-br-none':'bg-white border rounded-bl-none'}">${m.text}</div></div>`;
        });
        box.scrollTop = box.scrollHeight;
    }, (e) => console.log("Izin Firestore Ditolak."));
}

async function sendChatMessage() {
    const i = document.getElementById('chat-input');
    if(!i.value.trim() || !currentUser) return;
    try { await addDoc(collection(db, "messages"), { text: i.value, uid: currentUser.uid, sender: currentUser.displayName || currentUser.email, timestamp: serverTimestamp() }); i.value = ''; }
    catch(e) { showToast("Gagal kirim. Cek Firebase Rules.", "error"); }
}

function showToast(m, t="success") {
    const c = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = 'toast-pop mb-2 p-3 bg-white shadow-xl rounded-2xl flex items-center gap-3 border text-[10px] font-bold uppercase';
    div.innerHTML = `<i data-lucide="${t==='error'?'alert-circle':'check'}"></i> ${m}`;
    c.appendChild(div); lucide.createIcons(); setTimeout(()=>div.remove(), 3000);
}

window.addEventListener('DOMContentLoaded', () => { lucide.createIcons(); initOnboardingAnimation(); setupEventListeners(); });

function initOnboardingAnimation() {
    const b = document.getElementById('floating-bg');
    if(!b) return;
    for(let i=0; i<30; i++) {
        const d = document.createElement('div');
        d.className = 'floating-card';
        d.style.left = (Math.random()*90)+'vw';
        d.style.animationDelay = (i*0.5)+'s';
        d.style.background = `url(https://picsum.photos/seed/bg${i}/200/300) center/cover`;
        b.appendChild(d);
    }
}
