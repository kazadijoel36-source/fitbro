const VanguardEngine = {
    xp: parseInt(localStorage.getItem('fb_xp')) || 0,
    level: 1,
    
    // MEDAL DATABASE (Restored)
    medals: [
        { id: 'first_blood', title: 'FIRST BLOOD', desc: 'Complete your first Mission.', icon: '🛡️', unlocked: false },
        { id: 'iron_lung', title: 'IRON LUNG', desc: 'Log 5,000ml of hydration.', icon: '💧', unlocked: false },
        { id: 'strength_init', title: 'STRENGTH INIT', desc: 'Initialize physical baseline.', icon: '⚔️', unlocked: true },
        { id: 'lactose_free', title: 'CLEAN FUEL', desc: 'Sync lactose-free protocol.', icon: '🧪', unlocked: true }
    ],

    init() {
        this.updateUI();
        this.setupCursor();
        console.log("> VANGUARD_OS: NEURAL_LINK_ACTIVE");
    },

    setupCursor() {
        const cursor = document.getElementById('custom-cursor');
        document.addEventListener('mousemove', (e) => {
            if(cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
    },

    addXP(amount) {
        this.xp += amount;
        localStorage.setItem('fb_xp', this.xp);
        this.updateUI();
    },

    updateUI() {
        const xpCount = document.getElementById('xp-count');
        const lvlInd = document.getElementById('lvl-indicator');
        if(xpCount) xpCount.innerText = `${this.xp} XP`;
        if(lvlInd) lvlInd.innerText = `LVL ${Math.floor(this.xp / 1000) + 1}`;
    },

    getBaseline() {
        const data = localStorage.getItem('fb_baseline');
        return data ? JSON.parse(data) : { pushups: 10, pullups: 0, squats: 20 };
    }
};

VanguardEngine.init();