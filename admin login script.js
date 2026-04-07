import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAqyyGJt_t0ztknMudFVLmo6relkEa284g",
    authDomain: "meadi-aqua-tech.firebaseapp.com",
    databaseURL: "https://meadi-aqua-tech-default-rtdb.firebaseio.com",
    projectId: "meadi-aqua-tech",
    storageBucket: "meadi-aqua-tech.firebasestorage.app",
    messagingSenderId: "531151217708",
    appId: "1:531151217708:web:b30b6e1a0bf7fa60f29d89"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Loader Function
function setBtnLoading(btnId, ldrId, txtId, isLoading, defaultText) {
    const btn = document.getElementById(btnId);
    const ldr = document.getElementById(ldrId);
    const txt = document.getElementById(txtId);
    if (isLoading) {
        btn.disabled = true;
        ldr.style.display = "block";
        txt.innerText = "Processing...";
    } else {
        btn.disabled = false;
        ldr.style.display = "none";
        txt.innerText = defaultText;
    }
}

// Login Process
document.getElementById("loginBtn").onclick = async () => {
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value.trim();
    if(!u || !p) return alert("Please enter both Username and Password!");

    setBtnLoading("loginBtn", "loginLdr", "loginTxt", true);
    try {
        const snapshot = await get(ref(db, 'admin'));
        if (snapshot.exists()) {
            const adminData = snapshot.val();

            // டேட்டாபேஸில் உள்ள தரவுகளுடன் ஒப்பிடுதல்
            if (u === adminData.user && p === adminData.pass) {

                // ✅ முக்கியமான மாற்றம்: 
                // லாகின் செய்த அட்மின் பெயரை 'aquaUser' என சேமிக்கிறோம். 
                // இதுதான் மற்ற பக்கங்களில் 'Mathavan' என்ற நோடைத் திறக்க உதவும்.
                localStorage.setItem("aquaUser", adminData.user); 

                sessionStorage.setItem("isAdminAuthenticated", "true"); 

                window.location.href = "admin.html"; 
            } else {
                alert("Invalid Username or Password!");
            }
        } else {
            alert("Admin node not found in database!");
        }
    } catch (e) { 
        console.error(e);
        alert("Database Error! Check connection."); 
    }
    setBtnLoading("loginBtn", "loginLdr", "loginTxt", false, "Login");
};

// Security Code Reset Process
document.getElementById("updateBtn").onclick = async () => {
    const code = document.getElementById("securityPhone").value.trim();
    const newUser = document.getElementById("newUser").value.trim();
    const newPass = document.getElementById("newPass").value.trim();

    if (code === "93441658797868850126m") {
        if(!newUser || !newPass) return alert("Please enter new details!");

        setBtnLoading("updateBtn", "updateLdr", "updateTxt", true);
        try {
            await update(ref(db, 'admin'), { user: newUser, pass: newPass });
            alert("Credentials updated! Please login with new username.");
            location.reload();
        } catch (e) { 
            alert("Update failed!"); 
        }
        setBtnLoading("updateBtn", "updateLdr", "updateTxt", false, "Update Credentials");
    } else {
        alert("Incorrect Security Code!");
    }
};

// Page Toggles
document.getElementById("btnShowSettings").onclick = () => {
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("settingsPage").style.display = "flex";
};

document.getElementById("btnHideSettings").onclick = () => {
    document.getElementById("settingsPage").style.display = "none";
    document.getElementById("loginOverlay").style.display = "flex";
};
// --- Fingerprint Login logic ---
const bioLoginBtn = document.getElementById("bioLoginBtn");

// இந்த போனில் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளதா என செக் செய்தல்
if (window.PublicKeyCredential && localStorage.getItem("bioEnabledId")) {
    bioLoginBtn.style.display = "flex";
}

bioLoginBtn.onclick = async () => {
    try {
        const storedId = localStorage.getItem("bioEnabledId");
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: challenge,
                allowCredentials: [{
                    id: Uint8Array.from(atob(storedId), c => c.charCodeAt(0)),
                    type: 'public-key'
                }],
                userVerification: "required",
                timeout: 60000
            }
        });

        if (assertion) {
            // கைரேகை சரியாக இருந்தால் லாகின் செய்ததாக உறுதிப்படுத்துதல்
            sessionStorage.setItem("isAdminAuthenticated", "true");
            window.location.href = "admin.html";
        }
    } catch (err) {
        console.error("Biometric Login Failed", err);
        alert("கைரேகை பொருந்தவில்லை அல்லது ரத்து செய்யப்பட்டது.");
    }
};
