// ═══════════════════════════════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════════════════════════════
const API = '';
let currentUser   = null;
let cart          = [];
let paymentMethod = 'cash';
let allProducts   = [];
let allCategories = [];
let activeCategory = 'all';
let selectedTable  = null;
let activeMember   = null;

const TABLES = [
    { id: 'table-1', label: 'Table 1',      seats: 4, icon: '🪑' },
    { id: 'table-2', label: 'Table 2',      seats: 4, icon: '🪑' },
    { id: 'table-3', label: 'Table 3',      seats: 4, icon: '🪑' },
    { id: 'table-4', label: 'Bar Stool',    seats: 4, icon: '🍺' },
    { id: 'table-5', label: 'Couple Table', seats: 2, icon: '💑' },
];

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════
function fmt(n) {
    return '৳' + parseFloat(n||0).toLocaleString('en-IN', {minimumFractionDigits:0, maximumFractionDigits:2});
}
function today() {
    return new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Dhaka'});
}
function thisMonth() {
    return new Date().toISOString().slice(0,7);
}
function fmtTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
        timeZone:'Asia/Dhaka', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
    });
}
function toast(msg, type='success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `show ${type}`;
    setTimeout(() => t.className = '', 3000);
}
async function api(path, opts={}) {
    try {
        const r = await fetch(API + path, { headers:{'Content-Type':'application/json'}, ...opts });
        return await r.json();
    } catch(e) {
        toast('Connection error','error');
        return null;
    }
}
function getEmoji(categoryName) {
    const emojis = {
        'Coffee':'☕','Iced Coffee':'🧊','Tea':'🍵','Food':'🥪','Cold Drinks':'🥤',
        'Desserts':'🍰','Chicken':'🍗','Pasta':'🍝','Sides':'🍟','Add On':'➕',
        'Waffle Menu':'🧇','Shakes':'🥤','Mocktails':'🍹','Affogato':'☕','Milk Tea':'🧋',
    };
    return emojis[categoryName] || '🍽️';
}