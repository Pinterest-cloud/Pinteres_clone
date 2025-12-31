const MOCK_IMAGES = [
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=500",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500",
    "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=500",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
];

window.handleGoogleLogin = async function() {
    if (!window.fbAuth) return;
    try {
        const result = await window.signInWithPopup(window.fbAuth, window.googleProvider);
        showToast(`Halo, ${result.user.displayName}!`, "success");
    } catch (error) {
        showToast("Gagal Google Login: " + error.message, "error");
    }
};

window.handleManualLogin = async function() {
    if (!window.fbAuth) return;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || password.length < 6) {
        showToast("Email/Sandi tidak valid (min. 6 karakter)", "error");
        return;
    }

    try {
        await window.signInWithEmailAndPassword(window.fbAuth, email, password);
        showToast("Berhasil Masuk!", "success");
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                await window.createUserWithEmailAndPassword(window.fbAuth, email, password);
                showToast("Akun baru terdaftar!", "success");
            } catch (regError) {
                showToast("Daftar Gagal: " + regError.message, "error");
            }
        } else {
            showToast("Error: " + error.message, "error");
        }
    }
};

window.handleLogout = function() {
    if (window.fbAuth) {
        window.signOut(window.fbAuth).then(() => {
            location.reload();
        });
    }
};

window.addEventListener('firebase-ready', () => {
    window.onAuthStateChanged(window.fbAuth, (user) => {
        const authScreen = document.getElementById('auth-screen');
        const appShell = document.getElementById('app-shell');

        if (user) {
            authScreen.classList.add('hidden');
            appShell.classList.remove('hidden');
            setTimeout(() => appShell.classList.remove('opacity-0'), 100);
            
            document.getElementById('profile-name').innerText = user.displayName || "User VisiAura";
            document.getElementById('profile-email').innerText = user.email;
            if (user.photoURL) {
                document.getElementById('user-avatar').src = user.photoURL;
                document.getElementById('profile-img-large').src = user.photoURL;
            }
            renderMasonry(MOCK_IMAGES);
        } else {
            authScreen.classList.remove('hidden');
            appShell.classList.add('hidden');
            appShell.classList.add('opacity-0');
        }
    });
});

window.showSection = function(sectionId) {
    const sections = ['home', 'create', 'profile', 'chat'];
    sections.forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.remove('hidden');
};

function initFloatingBg() {
    const bg = document.getElementById('floating-bg');
    if (!bg) return;
    for (let i = 0; i < 12; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card';
        card.style.left = Math.random() * 100 + '%';
        card.style.animationDelay = (Math.random() * 5) + 's';
        card.style.backgroundImage = `url(${MOCK_IMAGES[i % MOCK_IMAGES.length]})`;
        bg.appendChild(card);
    }
}

function renderMasonry(images) {
    const grid = document.getElementById('masonry-grid');
    if (!grid) return;
    grid.innerHTML = '';
    images.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'pin-card';
        card.innerHTML = `
            <img src="${src}" loading="lazy">
            <div class="pin-overlay">
                <div class="flex justify-end">
                    <button onclick="optimisticSave(this)" class="bg-[#E60023] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">Simpan</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.generateVideo = function() {
    const loader = document.getElementById('loader-overlay');
    loader.classList.remove('hidden');
    setTimeout(() => {
        loader.classList.add('hidden');
        showToast("Video AI berhasil dibuat!", "success");
    }, 3000);
};

window.optimisticSave = function(btn) {
    btn.innerText = btn.innerText === "Simpan" ? "Tersimpan" : "Simpan";
    btn.classList.toggle('bg-black');
    showToast("Berhasil diperbarui", "success");
};

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-pop glass-panel px-6 py-4 rounded-2xl shadow-xl border border-white/50 pointer-events-auto flex items-center gap-3`;
    toast.innerHTML = `<i class="ph ph-info text-2xl"></i><p class="text-sm font-medium">${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', initFloatingBg);
