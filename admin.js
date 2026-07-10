/* ============================================
   GUEST ADMIN PORTAL — Nisila & Yashmi
   Firebase Auth (login gate) + Firestore (guest list)
   + WhatsApp invitation link builder
   ============================================ */

import { firebaseConfig } from './firebase-config.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// WEDDING / INVITATION TEMPLATE — edit as needed
// ============================================
const WEDDING = {
    couple: 'Nisila & Yashmi',
    dateLine: 'Thursday, August 20, 2026 (Poruwa Ceremony at 9:16 AM)',
    venueLine: 'Azelia Hall - Sawingir Hills, Gonapola',
    defaultCountryCode: '94' // Sri Lanka
};

function buildInvitationLink(name) {
    const path = window.location.pathname.replace(/\/?admin(\.html)?\/?$/, '/invitation');
    return `${window.location.origin}${path}?to=${encodeURIComponent(name)}`;
}

function buildWhatsappMessage(name, link) {
    return (
        `*You're Invited!*\n\n` +
        `Dear ${name},\n\n` +
        `We joyfully invite you to celebrate the wedding of *${WEDDING.couple}*.\n\n` +
        `*Date:* ${WEDDING.dateLine}\n` +
        `*Venue:* ${WEDDING.venueLine}\n\n` +
        `View your personal invitation here:\n${link}\n\n` +
        `Your presence means a lot. Kindly RSVP on or before *6th August 2026*.\n\n` +
        `We look forward to celebrating this special day with you.\n\n` +
        `With love,\n${WEDDING.couple}`
    );
}

function normalizePhone(rawPhone) {
    let digits = rawPhone.replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) digits = digits.slice(1);
    if (digits.startsWith('0')) {
        digits = WEDDING.defaultCountryCode + digits.slice(1);
    } else if (!digits.startsWith(WEDDING.defaultCountryCode) && digits.length <= 10) {
        digits = WEDDING.defaultCountryCode + digits;
    }
    return digits;
}

// ============================================
// DOM references
// ============================================
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const signOutBtn = document.getElementById('signOutBtn');

const addGuestForm = document.getElementById('addGuestForm');
const addGuestBtn = document.getElementById('addGuestBtn');
const guestNameInput = document.getElementById('guestNameInput');
const guestPhoneInput = document.getElementById('guestPhoneInput');

const guestsBody = document.getElementById('guestsBody');
const guestCount = document.getElementById('guestCount');
const emptyState = document.getElementById('emptyState');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let unsubscribeGuests = null;

// ============================================
// AUTH
// ============================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.hidden = true;
        dashboardSection.hidden = false;
        loginError.textContent = '';
        loginForm.reset();
        subscribeToGuests();
    } else {
        loginSection.hidden = false;
        dashboardSection.hidden = true;
        if (unsubscribeGuests) {
            unsubscribeGuests();
            unsubscribeGuests = null;
        }
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in…';

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        loginError.textContent = 'Sign-in failed. Please check your email and password.';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
});

signOutBtn.addEventListener('click', () => {
    signOut(auth);
});

// ============================================
// GUEST LIST (Firestore)
// ============================================
function subscribeToGuests() {
    const guestsQuery = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
    unsubscribeGuests = onSnapshot(guestsQuery, (snapshot) => {
        const guests = [];
        snapshot.forEach((docSnap) => {
            guests.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderGuests(guests);
    }, (err) => {
        console.error('Failed to load guests:', err);
        showToast('Could not load guest list. Check console for details.');
    });
}

function renderGuests(guests) {
    guestsBody.innerHTML = '';
    guestCount.textContent = guests.length
        ? `${guests.length} guest${guests.length === 1 ? '' : 's'} total`
        : '';
    emptyState.hidden = guests.length !== 0;

    guests.forEach((guest) => {
        const tr = document.createElement('tr');

        const nameTd = document.createElement('td');
        nameTd.className = 'guest-name-cell';
        nameTd.setAttribute('data-label', 'Name');
        nameTd.textContent = guest.name;
        nameTd.title = guest.name;

        const phoneTd = document.createElement('td');
        phoneTd.className = 'guest-phone-cell';
        phoneTd.setAttribute('data-label', 'Phone');
        phoneTd.title = guest.phone;
        phoneTd.textContent = guest.phone;

        const statusTd = document.createElement('td');
        statusTd.setAttribute('data-label', 'Status');
        const badge = document.createElement('span');
        badge.className = 'badge ' + (guest.invited ? 'badge-sent' : 'badge-pending');
        badge.textContent = guest.invited ? 'Invited' : 'Not sent';
        statusTd.appendChild(badge);

        const actionsTd = document.createElement('td');
        actionsTd.setAttribute('data-label', 'Actions');
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'row-actions';

        const sendBtn = document.createElement('button');
        sendBtn.className = 'btn btn-sm btn-whatsapp';
        sendBtn.type = 'button';
        sendBtn.textContent = 'Send via WhatsApp';
        sendBtn.addEventListener('click', () => sendInvitation(guest));

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-sm btn-outline';
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copy Link';
        copyBtn.addEventListener('click', () => copyInvitationLink(guest));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.type = 'button';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteGuest(guest));

        actionsWrap.append(sendBtn, copyBtn, deleteBtn);
        actionsTd.appendChild(actionsWrap);

        tr.append(nameTd, phoneTd, statusTd, actionsTd);
        guestsBody.appendChild(tr);
    });
}

addGuestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = guestNameInput.value.trim();
    const phone = guestPhoneInput.value.trim();
    if (!name || !phone) return;

    addGuestBtn.disabled = true;
    try {
        await addDoc(collection(db, 'guests'), {
            name,
            phone,
            invited: false,
            createdAt: serverTimestamp()
        });
        addGuestForm.reset();
        guestNameInput.focus();
        showToast(`Added ${name} to the guest list`);
    } catch (err) {
        console.error('Failed to add guest:', err);
        showToast('Could not add guest. Check console for details.');
    } finally {
        addGuestBtn.disabled = false;
    }
});

async function deleteGuest(guest) {
    if (!window.confirm(`Remove ${guest.name} from the guest list?`)) return;
    try {
        await deleteDoc(doc(db, 'guests', guest.id));
        showToast(`Removed ${guest.name}`);
    } catch (err) {
        console.error('Failed to delete guest:', err);
        showToast('Could not delete guest. Check console for details.');
    }
}

function sendInvitation(guest) {
    const link = buildInvitationLink(guest.name);
    const message = buildWhatsappMessage(guest.name, link);
    const phone = normalizePhone(guest.phone);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    updateDoc(doc(db, 'guests', guest.id), {
        invited: true,
        invitedAt: serverTimestamp()
    }).catch((err) => console.error('Failed to mark guest as invited:', err));
}

async function copyInvitationLink(guest) {
    const link = buildInvitationLink(guest.name);
    try {
        await navigator.clipboard.writeText(link);
        showToast('Invitation link copied to clipboard');
    } catch (err) {
        window.prompt('Copy this link:', link);
    }
}

// ============================================
// TOAST
// ============================================
let toastTimer = null;
function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
