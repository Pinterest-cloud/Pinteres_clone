const auraData = [
    { id: 1, title: "Minimalist Loft", category: "minimalis", h: 300 },
    { id: 2, title: "Neon Cyber Street", category: "cyber", h: 450 },
    { id: 3, title: "Retro Camera Setup", category: "retro", h: 250 },
    { id: 4, title: "Deep Forest Aura", category: "nature", h: 400 },
    { id: 5, title: "Minimalist Desk", category: "minimalis", h: 350 },
    { id: 6, title: "Abstract Light", category: "abstract", h: 500 },
    { id: 7, title: "Vintage Record Player", category: "retro", h: 320 },
    { id: 8, title: "Cyberpunk Interior", category: "cyber", h: 420 },
];

const container = document.getElementById('pinContainer');

function renderAura(filter = "") {
    container.innerHTML = "";
    
    const results = auraData.filter(item => 
        item.title.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase())
    );

    if (results.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 100px 20px;">
                <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" width="80" style="opacity: 0.2; margin-bottom: 20px;">
                <p style="color: #94a3b8; font-weight: bold;">Oops! Aura tidak ditemukan.</p>
                <p style="font-size: 12px; color: #cbd5e1;">Coba kata kunci lain seperti 'Minimalis' atau 'Cyber'</p>
            </div>
        `;
        return;
    }

    results.forEach(item => {
        const pin = document.createElement('div');
        pin.className = 'pin';
        pin.innerHTML = `
            <img src="https://picsum.photos/seed/aura-${item.id}/400/${item.h}" loading="lazy">
            <div class="pin-label">${item.title}</div>
        `;
        container.appendChild(pin);
    });
}

function searchAura() {
    const q = document.getElementById('searchInput').value;
    renderAura(q);
}


function showSection(sectionId) {
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.mobile-nav button').forEach(b => b.classList.remove('active'));
    if(sectionId === 'dashboard') document.getElementById('nav-home').classList.add('active');
}

function startAiProcess() {
    const prompt = document.getElementById('aiPrompt').value;
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    if (!prompt) {
        alert("Harap masukkan prompt aura!");
        return;
    }

    overlay.style.display = 'flex';
    
    const steps = [
        "Menghubungkan ke Google Veo 3 Engine...",
        "Menganalisis Prompt Aura...",
        "Mensintesis Pixel Sinematik...",
        "Finalisasi Render..."
    ];

    let i = 0;
    const interval = setInterval(() => {
        loadingText.innerText = steps[i];
        i++;
        if (i >= steps.length) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.style.display = 'none';
                alert("Berhasil! Video aura kamu telah dibuat dan disimpan ke koleksi.");
                showSection('dashboard');
            }, 1000);
        }
    }, 1500);
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msgBox = document.getElementById('chatMessages');
    
    if (!input.value) return;

    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerText = input.value;
    
    msgBox.appendChild(div);
    input.value = "";
    msgBox.scrollTop = msgBox.scrollHeight;
}

function toggleModal(id) {
    const modal = document.getElementById(id);
    const isShowing = modal.style.display === 'flex';
    modal.style.display = isShowing ? 'none' : 'flex';
}

function handleAuth() {
    alert("Akun Anda sedang diproses. Selamat bergabung!");
    toggleModal('authModal');
}

window.onload = () => {
    renderAura();
};
