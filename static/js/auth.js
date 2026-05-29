// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════
async function doLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    if (!u || !p) {
        document.getElementById('login-error').textContent = 'Please enter both fields';
        return;
    }
    const res = await api('/api/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
    if (res && res.success) {
        localStorage.setItem('bnb_user', JSON.stringify(res.user));
        applySession(res.user);
    } else {
        document.getElementById('login-error').textContent = res?.message || 'Login failed';
    }
}

function applySession(user) {
    currentUser = user;
    window.currentUserRole = user.role;

    document.getElementById('user-info').textContent = user.username;
    const rb = document.getElementById('role-badge');
    rb.textContent = user.role;
    rb.className = `role-badge role-${user.role}`;

    document.getElementById('sidebar-avatar').textContent = user.username.slice(0, 2).toUpperCase();

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Show owner-only elements only for owner
    document.querySelectorAll('.owner-only').forEach(el => {
        el.style.display = user.role === 'owner' ? 'flex' : 'none';
    });

    initApp();
}

function doLogout() {
    localStorage.removeItem('bnb_user');
    currentUser = null;
    window.currentUserRole = null;
    cart = [];
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
}

document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
});

document.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('bnb_user');
    if (saved) {
        try {
            applySession(JSON.parse(saved));
            return;
        } catch {
            localStorage.removeItem('bnb_user');
        }
    }
    document.getElementById('login-screen').style.display = 'flex';
});