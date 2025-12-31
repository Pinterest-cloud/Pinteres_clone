import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

provider.setCustomParameters({ prompt: "select_account" });

let currentUser = null;
let pinsData = [];

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, (user) => {
  console.log("AUTH STATE:", user);
  if (user) {
    showMainApp(user);
  } else {
    currentUser = null;
    document.getElementById("onboarding").style.display = "flex";
    document.getElementById("app-main").style.display = "none";
    document.getElementById("mobile-nav").classList.add("hidden");
  }
});

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  initOnboardingAnimation();
  setupEventListeners();
  generateMockPins(60);
});

/* ================= UI ================= */

function showMainApp(user) {
  currentUser = user;
  document.getElementById("onboarding").style.display = "none";
  document.getElementById("app-main").style.display = "block";
  document.getElementById("mobile-nav").classList.remove("hidden");
  showToast(`Halo, ${user.displayName || "Guest"}!`);
  initChatListener();
}

/* ================= EVENTS ================= */

function setupEventListeners() {
  const googleBtn = document.getElementById("google-login");
  if (googleBtn) {
    googleBtn.onclick = async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        showToast(err.message, "error");
      }
    };
  }

  const loginBtn = document.querySelector("button.bg-black");
  if (loginBtn) {
    loginBtn.onclick = async (e) => {
      e.preventDefault();
      const email = document.querySelector('input[type="email"]').value;
      const pass = document.querySelector('input[type="password"]').value;

      if (!email || pass.length < 6) {
        showToast("Email & sandi min. 6 karakter", "error");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (err) {
        showToast("Login gagal, masuk sebagai Guest");
        await signInAnonymously(auth);
      }
    };
  }

  document.getElementById("logout-btn").onclick = async () => {
    await signOut(auth);
    location.reload();
  };

  document.getElementById("send-btn").onclick = sendChatMessage;
  document.getElementById("chat-input").onkeypress = (e) => {
    if (e.key === "Enter") sendChatMessage();
  };
}

/* ================= CHAT ================= */

function initChatListener() {
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  onSnapshot(q, (snapshot) => {
    const box = document.getElementById("chat-messages");
    if (!box) return;
    box.innerHTML = "";
    snapshot.forEach((doc) => {
      const d = doc.data();
      const me = d.uid === currentUser.uid;
      box.innerHTML += `
        <div class="flex ${me ? "justify-end" : "justify-start"} mb-3">
          <div class="p-4 rounded-[20px] text-xs max-w-[70%] ${
            me ? "bg-[#E60023] text-white" : "bg-white border"
          }">
            <p class="text-[7px] opacity-50">${d.sender}</p>
            ${d.text}
          </div>
        </div>`;
    });
    box.scrollTop = box.scrollHeight;
  });
}

async function sendChatMessage() {
  if (!currentUser) {
    showToast("Login dulu", "error");
    return;
  }

  const input = document.getElementById("chat-input");
  if (!input.value.trim()) return;

  await addDoc(collection(db, "messages"), {
    text: input.value,
    uid: currentUser.uid,
    sender: currentUser.displayName || "Guest",
    timestamp: serverTimestamp()
  });

  input.value = "";
}

/* ================= UTIL ================= */

function showToast(m, t = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.innerHTML = `<div class="p-3 bg-white rounded-xl shadow">
    ${m}
  </div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
