const categories = ["minimalis", "cyber", "retro", "nature", "abstract", "street"];
const titles = [
    "Aura View", "Modern Space", "Neon City", "Vintage Mood", "Pure Nature", 
    "Dark Aesthetic", "Urban Light", "Dreamy Concept", "Future Tech", "Artistic Soul"
];

const generateAuraData = () => {
    const data = [];
    for (let i = 1; i <= 60; i++) {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        const randomHeight = Math.floor(Math.random() * (500 - 250 + 1)) + 250; // Tinggi antara 250px - 500px
        
        data.push({
            id: i,
            title: `${randomTitle} ${i}`,
            category: randomCat,
            h: randomHeight
        });
    }
    return data;
};

const auraData = generateAuraData();
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
                <p style="color: #94a3b8; font-weight: bold; font-size: 18px;">Aura tidak ditemukan :(</p>
                <p style="font-size: 14px; color: #cbd5e1;">Coba cari: Minimalis, Cyber, atau Nature</p>
            </div>
        `;
        return;
    }

    results.forEach(item => {
        const pin = document.createElement('div');
        pin.className = 'pin';
        
        pin.innerHTML = `
            <div class="pin-image-wrapper">
                <img src="https://picsum.photos/seed/aura-v3-${item.id}/400/${item.h}" alt="${item.title}" loading="lazy">
                <div class="pin-overlay">
                    <button class="btn-save">Simpan</button>
                </div>
            </div>
            <div class="pin-label">
                <span class="dot"></span> ${item.title}
            </div>
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
        "Menghubungkan ke Google Veo 3...",
        "Menganalisis Aura: " + prompt.substring(0, 15) + "...",
        "Merender Visual Sinematik...",
        "Hampir Selesai..."
    ];

    let i = 0;
    const interval = setInterval(() => {
        loadingText.innerText = steps[i];
        i++;
        if (i >= steps.length) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.style.display = 'none';
                alert("Berhasil! Video aura kamu telah masuk ke galeri.");
                showSection('dashboard');
            }, 1000);
        }
    }, 1200);
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
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function handleAuth() {
    alert("Pendaftaran berhasil! Selamat datang di VisiAura.");
    toggleModal('authModal');
}

window.onload = () => {
    renderAura();
};
