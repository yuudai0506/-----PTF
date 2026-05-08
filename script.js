gsap.registerPlugin(ScrollTrigger);

// データベース名を固定して安定させます
const DB_NAME = "NoirPermanentDB"; 
const STORE_CART = "cart";
const STORE_WISH = "wishlist";
let db;

// 商品リスト（20個）
const products = [
    {id:1, name:'SILHOUETTE JACKET', price:'¥52,000', img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'},
    {id:2, name:'ESSENTIAL COAT', price:'¥98,000', img:'https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/55866c5fef33774ef5001775/92b4e697270757899ac5.jpeg/fit=cover,w=800,h=800'},
    {id:3, name:'MODERN KNIT', price:'¥28,000', img:'https://thetoe.store/cdn/shop/files/4EAB7866-7CCF-46E2-ACCF-CCCB9E0F798E.jpg?v=1769620608&width=1946'},
    {id:4, name:'MINIMAL SHIRT', price:'¥24,000', img:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'},
    {id:5, name:'URBAN PANTS', price:'¥31,000', img:'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'},
    {id:6, name:'LEATHER BAG', price:'¥120,000', img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'},
    {id:7, name:'WOOL SCARF', price:'¥18,000', img:'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800'},
    {id:8, name:'SILK DRESS', price:'¥76,000', img:'https://www.wanderlustulum.com/cdn/shop/files/2D4A4099_2000x.jpg?v=1766086088'},
    {id:9, name:'NOIR EYEWEAR', price:'¥32,000', img:'https://lenoir-eyewear.com/wp-content/uploads/2024/08/Le-Noir-Homepage-mobiel-2.png'},
    {id:10, name:'CLASSIC WATCH', price:'¥158,000', img:'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800'},
    {id:11, name:'OVERSIZED HOODIE', price:'¥19,000', img:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'},
    {id:12, name:'VENICE SANDALS', price:'¥28,000', img:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'},
    {id:13, name:'NIGHT PARFUM', price:'¥15,000', img:'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'},
    {id:14, name:'CHELSEA BOOTS', price:'¥64,000', img:'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800'},
    {id:15, name:'MODERN BLAZER', price:'¥48,000', img:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'},
    {id:16, name:'SILVER RING', price:'¥22,000', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'},
    {id:17, name:'LINEN SHORTS', price:'¥16,000', img:'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'},
    {id:18, name:'OPAL NECKLACE', price:'¥45,000', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'},
    {id:19, name:'DENIM JACKET', price:'¥38,000', img:'https://r330.jp/cdn/shop/products/DJ22182-MY_BLU_2.jpg?v=1669684526&width=1280'},
    {id:20, name:'LEATHER BELT', price:'¥12,000', img:'https://row.dentsgloves.com/cdn/shop/files/man-wearing-heritage-lined-leather-belt-brass-buckle-brown.jpg?v=1749827461'}
];

// DB初期化
const req = indexedDB.open(DB_NAME, 1);
req.onupgradeneeded = (e) => {
    let d = e.target.result;
    if(!d.objectStoreNames.contains(STORE_CART)) d.createObjectStore(STORE_CART, {keyPath:"id", autoIncrement:true});
    if(!d.objectStoreNames.contains(STORE_WISH)) d.createObjectStore(STORE_WISH, {keyPath:"id", autoIncrement:true});
};
req.onsuccess = (e) => {
    db = e.target.result;
    renderProducts();
    updateCartUI();
    updateWishUI();
};

// 表示
function renderProducts() {
    const grid = document.getElementById('main-grid');
    grid.innerHTML = products.map(p => `
        <article class="product-card" onclick="openModal(${p.id})">
            <div class="img-wrapper"><img src="${p.img}"></div>
            <div class="info"><h3>${p.name}</h3><p>${p.price}</p></div>
        </article>
    `).join('');
    
    document.querySelectorAll('.product-card').forEach(card => {
        gsap.to(card, { scrollTrigger: { trigger: card, start: "top 90%" }, opacity: 1, y: 0, duration: 1 });
    });
}

let currentItem = {};

function openModal(id) {
    const p = products.find(x => x.id === id);
    currentItem = p;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-price').innerText = p.price;
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-error').innerText = "";
    
    document.getElementById('color-options').innerHTML = ['Black', 'Gray'].map(c => `<button class="opt-btn" onclick="selectOpt(this)">${c}</button>`).join('');
    document.getElementById('size-options').innerHTML = ['S', 'M', 'L'].map(s => `<button class="opt-btn" onclick="selectOpt(this)">${s}</button>`).join('');
    
    document.getElementById('product-modal').classList.add('active');
}

function closeModal() { document.getElementById('product-modal').classList.remove('active'); }

function selectOpt(btn) {
    btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// 保存処理（ここが確実に動くようにしました）
function addToCart() {
    const col = document.querySelector('#color-options .selected')?.innerText;
    const siz = document.querySelector('#size-options .selected')?.innerText;
    if (!col || !siz) { document.getElementById('modal-error').innerText = "SELECT COLOR & SIZE"; return; }

    const item = { 
        name: currentItem.name, 
        price: currentItem.price, 
        img: currentItem.img, 
        color: col, 
        size: siz, 
        numPrice: parseInt(currentItem.price.replace(/[¥,]/g, '')) 
    };

    const tx = db.transaction(STORE_CART, "readwrite");
    tx.objectStore(STORE_CART).add(item);
    tx.oncomplete = () => {
        updateCartUI();
        closeModal();
        toggleCart();
    };
}

function addToWish() {
    const tx = db.transaction(STORE_WISH, "readwrite");
    tx.objectStore(STORE_WISH).add({ name: currentItem.name, price: currentItem.price, img: currentItem.img });
    tx.oncomplete = () => {
        updateWishUI();
        alert("ADDED TO WISHLIST");
    };
}

// UI更新
function updateCartUI() {
    if(!db) return;
    const tx = db.transaction(STORE_CART, "readonly");
    tx.objectStore(STORE_CART).getAll().onsuccess = (e) => {
        const items = e.target.result;
        document.getElementById('cart-count').innerText = items.length;
        document.getElementById('cart-items').innerHTML = items.map(i => `
            <div class="cart-item">
                <img src="${i.img}">
                <div>
                    <p style="font-size:0.7rem">${i.name}</p>
                    <p style="font-size:0.6rem; color:#777">${i.color} / ${i.size}</p>
                    <button class="remove-btn" onclick="removeItem(${i.id})">REMOVE</button>
                </div>
            </div>`).join('');
        const total = items.reduce((s, i) => s + i.numPrice, 0);
        document.getElementById('cart-total').innerText = `¥${total.toLocaleString()}`;
    };
}

function updateWishUI() {
    if(!db) return;
    const tx = db.transaction(STORE_WISH, "readonly");
    tx.objectStore(STORE_WISH).getAll().onsuccess = (e) => {
        const items = e.target.result;
        document.getElementById('wish-count').innerText = items.length;
        document.getElementById('wish-items').innerHTML = items.map(i => `
            <div class="cart-item">
                <img src="${i.img}">
                <div><p style="font-size:0.7rem">${i.name}</p><button class="remove-btn" onclick="removeWish(${i.id})">REMOVE</button></div>
            </div>`).join('');
    };
}

function removeItem(id) {
    const tx = db.transaction(STORE_CART, "readwrite");
    tx.objectStore(STORE_CART).delete(id);
    tx.oncomplete = () => updateCartUI();
}

function removeWish(id) {
    const tx = db.transaction(STORE_WISH, "readwrite");
    tx.objectStore(STORE_WISH).delete(id);
    tx.oncomplete = () => updateWishUI();
}

// 決済（確実に反応するようにしました）
function processCheckout() {
    const count = parseInt(document.getElementById('cart-count').innerText);
    if (count === 0) {
        alert("CART IS EMPTY");
        return;
    }

    // レシート情報の生成
    document.getElementById('r-cust').innerText = "CUST-" + Math.floor(Math.random()*900000+100000);
    document.getElementById('r-order').innerText = "ORD-" + Math.floor(Math.random()*900000+100000);
    document.getElementById('r-item').innerText = "SKU-" + Math.floor(Math.random()*90000+10000);
    document.getElementById('r-barcode').innerText = Array.from({length:3},()=>Math.floor(Math.random()*9000+1000)).join(' ');

    const tx = db.transaction(STORE_CART, "readwrite");
    tx.objectStore(STORE_CART).clear();
    tx.oncomplete = () => {
        updateCartUI();
        document.getElementById('checkout-modal').classList.add('active');
    };
}

// UI操作
function toggleCart() { 
    document.getElementById('cart-drawer').classList.toggle('active'); 
    document.getElementById('wishlist-drawer').classList.remove('active');
}
function toggleWishlist() { 
    document.getElementById('wishlist-drawer').classList.toggle('active'); 
    document.getElementById('cart-drawer').classList.remove('active');
}
function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('cart-drawer').classList.remove('active');
}

function filterProducts() {
    const q = document.getElementById('product-search').value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(c => {
        c.style.display = c.querySelector('h3').innerText.toLowerCase().includes(q) ? "block" : "none";
    });
}

// 共通演出
window.onload = () => {
    gsap.timeline()
        .to(".loader-text", { opacity: 0, duration: 1 })
        .to("#loader", { yPercent: -100, duration: 0.8, ease: "expo.inOut" })
        .to(".hero-title span", { y: 0, duration: 1 });
};
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => { gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 }); });