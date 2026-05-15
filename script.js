document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Mobile Nav Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Format Rupiah
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num);

    // Game Search
    const gameSearch = document.getElementById('gameSearch');
    const gamesGrid = document.getElementById('gamesGrid');
    if (gameSearch && gamesGrid) {
        const cards = gamesGrid.querySelectorAll('.game-card');
        gameSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            cards.forEach(c => {
                const title = c.querySelector('h3').innerText.toLowerCase();
                c.style.display = title.includes(term) ? 'block' : 'none';
            });
        });
    }

    // Topup Form Logic
    const topupForm = document.getElementById('topupForm');
    if (topupForm) {
        const nominalCards = document.querySelectorAll('.premium-card');
        const paymentCards = document.querySelectorAll('.payment-item-premium');
        const summaryBar = document.getElementById('summaryBar');
        const summaryTotal = document.getElementById('summaryTotal');
        const summaryItem = document.getElementById('summaryItem');
        const stickySubmit = document.getElementById('stickySubmit');

        const selectedItemInput = document.getElementById('selectedItem');
        const selectedPriceInput = document.getElementById('selectedPrice');
        const selectedPaymentInput = document.getElementById('selectedPayment');

        // Modal Elements
        const checkoutModal = document.getElementById('checkoutModal');
        const closeModal = document.getElementById('closeModal');
        const confirmOrder = document.getElementById('confirmOrder');

        // Dynamic Game Data
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('game') || 'ml';
        const gamesData = {
            'ml': { name: 'Mobile Legends', banner: 'emel.jpg', hasZone: true, unit: 'Diamonds' },
            'ff': { name: 'Free Fire', banner: 'efef.jpg', hasZone: false, unit: 'Diamonds' },
            'valo': { name: 'Valorant', banner: 'valo.jpg', hasZone: false, unit: 'Points' },
            'pubg': { name: 'PUBG Mobile', banner: 'pubg.jpeg', hasZone: false, unit: 'UC' },
            'genshin': { name: 'Genshin Impact', banner: 'genshin.jpeg', hasZone: true, unit: 'Genesis' },
            'codm': { name: 'COD Mobile', banner: 'COD.jpg', hasZone: false, unit: 'CP' },
            'roblox': { name: 'Roblox', banner: 'roblox.jpeg', hasZone: false, unit: 'Robux' }
        };

        const data = gamesData[gameId] || gamesData['ml'];
        
        // Update Page Content Based on Game
        if (document.getElementById('gameTitle')) document.getElementById('gameTitle').innerText = data.name;
        if (document.getElementById('gameBanner')) document.getElementById('gameBanner').src = data.banner;
        if (document.getElementById('gameIcon')) document.getElementById('gameIcon').src = data.banner;
        if (document.getElementById('zoneIdContainer')) {
            document.getElementById('zoneIdContainer').style.display = data.hasZone ? 'block' : 'none';
            const zoneInput = document.getElementById('zoneId');
            if (zoneInput) zoneInput.required = data.hasZone;
        }

        // Update nominal units
        nominalCards.forEach(card => {
            const nameEl = card.querySelector('.item-name');
            if (nameEl && !nameEl.dataset.original) {
                nameEl.dataset.original = nameEl.innerText;
                nameEl.innerText = nameEl.innerText.replace('Diamonds', data.unit);
            }
        });

        const updatePricesInPayment = (basePrice) => {
            paymentCards.forEach(card => {
                const method = card.dataset.method;
                const priceEl = card.querySelector('.payment-method-price');
                if (priceEl) {
                    let finalPrice = basePrice;
                    if (method === 'dana' || method === 'gopay') finalPrice += 500;
                    priceEl.innerText = formatRupiah(finalPrice);
                }
            });
        };

        const updateSummary = () => {
            const basePrice = parseInt(selectedPriceInput.value) || 0;
            const item = selectedItemInput.value || '-';
            const method = selectedPaymentInput.value;
            
            let finalPrice = basePrice;
            if (method === 'dana' || method === 'gopay') finalPrice += 500;

            if (basePrice > 0) {
                summaryTotal.innerText = formatRupiah(finalPrice);
                summaryItem.innerText = item;
                summaryBar.classList.add('active');
            }
        };

        nominalCards.forEach(card => {
            card.addEventListener('click', () => {
                nominalCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedItemInput.value = card.dataset.item;
                selectedPriceInput.value = card.dataset.price;
                
                updatePricesInPayment(parseInt(card.dataset.price));
                updateSummary();
            });
        });

        paymentCards.forEach(card => {
            card.addEventListener('click', () => {
                if (!selectedPriceInput.value) {
                    alert('Silakan pilih nominal item terlebih dahulu.');
                    return;
                }
                paymentCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedPaymentInput.value = card.dataset.method;
                updateSummary();
            });
        });

        // Modal Control Functions
        const openTheModal = () => {
            const userId = document.getElementById('userId').value.trim();
            const zoneId = document.getElementById('zoneId') ? document.getElementById('zoneId').value.trim() : '';
            const wa = document.getElementById('whatsapp').value.trim();
            
            // Strict Validation
            if (!userId) { alert('Harap isi User ID kamu.'); return; }
            if (data.hasZone && !zoneId) { alert('Harap isi Zone ID kamu.'); return; }
            if (!selectedItemInput.value) { alert('Harap pilih nominal item.'); return; }
            if (!selectedPaymentInput.value) { alert('Harap pilih metode pembayaran.'); return; }
            if (!wa) { alert('Harap isi nomor WhatsApp kamu.'); return; }

            // Populate Modal
            const modalGame = document.getElementById('modalGame');
            const modalId = document.getElementById('modalId');
            const modalItem = document.getElementById('modalItem');
            const modalPayment = document.getElementById('modalPayment');
            const modalTotal = document.getElementById('modalTotal');

            const fullId = userId + (data.hasZone ? ` (${zoneId})` : '');
            
            if (modalGame) modalGame.innerText = data.name;
            if (modalId) modalId.innerText = fullId;
            if (modalItem) modalItem.innerText = selectedItemInput.value;
            if (modalPayment) modalPayment.innerText = selectedPaymentInput.value.toUpperCase();
            if (modalTotal) modalTotal.innerText = summaryTotal.innerText;

            checkoutModal.classList.add('active');
        };

        const closeTheModal = () => {
            if (checkoutModal) checkoutModal.classList.remove('active');
        };

        // Event Listeners
        if (stickySubmit) stickySubmit.addEventListener('click', openTheModal);
        if (closeModal) closeModal.addEventListener('click', closeTheModal);
        
        if (confirmOrder) {
            confirmOrder.addEventListener('click', () => {
                const userId = document.getElementById('userId').value.trim();
                const zoneId = document.getElementById('zoneId') ? document.getElementById('zoneId').value.trim() : '';
                const wa = document.getElementById('whatsapp').value.trim();
                const fullId = userId + (data.hasZone ? ` (${zoneId})` : '');
                
                const msg = `*ORDER NCUKS STORE*\n\n` +
                            `🎮 Game: ${data.name}\n` +
                            `🆔 ID: ${fullId}\n` +
                            `💎 Item: ${selectedItemInput.value}\n` +
                            `💰 Total: ${summaryTotal.innerText}\n` +
                            `💳 Bayar: ${selectedPaymentInput.value.toUpperCase()}\n` +
                            `📱 WA: ${wa}\n\n` +
                            `_Mohon instruksi pembayarannya ya min!_`;

                window.open(`https://wa.me/6283856120537?text=${encodeURIComponent(msg)}`, '_blank');
                
                // Save History
                const orders = JSON.parse(localStorage.getItem('ncuk_orders') || '[]');
                orders.unshift({
                    id: 'NC-' + Math.floor(Math.random() * 9000 + 1000),
                    game: data.name,
                    item: selectedItemInput.value,
                    price: summaryTotal.innerText,
                    status: 'Pending',
                    date: new Date().toLocaleDateString('id-ID')
                });
                localStorage.setItem('ncuk_orders', JSON.stringify(orders.slice(0, 5)));
                
                closeTheModal();
                setTimeout(() => window.location.href = 'sukses.html', 500);
            });
        }

        // Global Modal Clicks
        window.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeTheModal();
        });

        topupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            openTheModal();
        });
    }

    // Render Order History (Premium Style)
    const renderHistory = () => {
        const historyContainer = document.getElementById('orderHistoryContainer');
        if (!historyContainer) return;

        const orders = JSON.parse(localStorage.getItem('ncuk_orders') || '[]');
        if (orders.length > 0) {
            let html = '<div class="history-list-premium">';
            orders.forEach(o => {
                html += `
                <div class="history-item-premium">
                    <div class="history-left">
                        <div class="history-game-icon">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <div class="history-details">
                            <div class="history-id">${o.id}</div>
                            <div class="history-game">${o.game} - ${o.item}</div>
                            <div class="history-date">${o.date || ''}</div>
                        </div>
                    </div>
                    <div class="history-right">
                        <div class="history-price">${o.price}</div>
                        <div class="history-status status-pending">${o.status}</div>
                    </div>
                </div>`;
            });
            html += '</div>';
            historyContainer.innerHTML = html;
        }
    };
    
    renderHistory();

    // --- REAL TRANSACTION FEED ---
    const liveFeedContainer = document.getElementById('liveTransactionsContainer');
    const updateRealLiveFeed = () => {
        if (!liveFeedContainer) return;
        
        const orders = JSON.parse(localStorage.getItem('ncuk_orders') || '[]');
        if (orders.length === 0) {
            liveFeedContainer.innerHTML = '<p class="loading-shimmer">Belum ada transaksi masuk.</p>';
            return;
        }

        liveFeedContainer.innerHTML = '';
        orders.forEach(o => {
            const itemHtml = `
                <div class="live-item">
                    <div class="live-user">
                        <div class="live-user-avatar"><i class="fas fa-shopping-cart"></i></div>
                        <div class="live-info">
                            <strong>Pelanggan Ncuks</strong> baru saja membeli <strong>${o.item}</strong>
                            <span>Game: ${o.game} | ID: ${o.id}</span>
                        </div>
                    </div>
                    <div class="live-status">
                        <i class="fas fa-check-circle"></i> ${o.status}
                    </div>
                </div>
            `;
            liveFeedContainer.insertAdjacentHTML('beforeend', itemHtml);
        });
    };

    updateRealLiveFeed();
});

