const images = [
    { title: "Aura Minimalis", height: 300 },
    { title: "Cyberpunk Vibes", height: 450 },
    { title: "Interior Dream", height: 250 },
    { title: "Nature Escape", height: 400 },
    { title: "Abstract Art", height: 350 },
    { title: "Street Style", height: 500 },
    { title: "Retro Future", height: 280 },
    { title: "Golden Hour", height: 420 },
];

const container = document.getElementById('pin-container');

function createPins() {
  
    for (let i = 0; i < 50; i++) {
        const item = images[i % images.length];
        const pin = document.createElement('div');
        pin.className = 'pin';
        
        const imgUrl = `https://picsum.photos/seed/${i + 123}/400/${item.height}`;
        
        pin.innerHTML = `
            <img src="${imgUrl}" alt="${item.title}" loading="lazy">
            <div class="pin-info">
                <h3>${item.title} #${i+1}</h3>
            </div>
        `;
        
        container.appendChild(pin);
    }
}

document.addEventListener('DOMContentLoaded', createPins);

document.querySelector('.search-bar input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        alert('Mencari aura: ' + e.target.value);
    }
});
