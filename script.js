const get = (id) => document.getElementById(id); // Utility

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active-link', btn.getAttribute('onclick').includes(pageId)));
    get('nav-links').classList.remove('show');
    window.scrollTo(0, 0);
}
const toggleMenu = () => get('nav-links').classList.toggle('show');

// Data Handling (Requirement: Arrays & Objects)
const decisionHistory = [];

const updateHistory = () => {
    const list = get('historyList');
    if (!list) return;

    // Show/Hide container based on history length
    get('history-section').classList.toggle('hidden', decisionHistory.length === 0);

    // Render list (Map & Join)
    list.innerHTML = decisionHistory.slice(-3).reverse()
        .map(item => `<li><span>${item.choice}</span> <span class="time">${item.time}</span></li>`)
        .join('');
};

// Decision Helper
get("decideBtn")?.addEventListener("click", ({ target: btn }) => {
    const val1 = get("option1").value.trim(), val2 = get("option2").value.trim();
    if (!val1 || !val2) return alert("⚠️ Fadlan buuxi labada meel!");

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';

    setTimeout(() => {
        const choice = Math.random() < 0.5 ? val1 : val2;
        // Requirement: Objects pushed to Array
        decisionHistory.push({ choice, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });

        get("message").textContent = "✅ Natiijada:";
        get("finalDecision").innerHTML = `<i class="fas fa-check-circle"></i> ${choice}`;
        get("result-container").classList.remove('hidden');
        updateHistory();

        btn.disabled = false;
        btn.innerHTML = originalText;
    }, 800);
});

// Contact Form (Requirement: Input Validation)
const contactForm = get("newContactForm");
if (contactForm) {
    const btn = contactForm.querySelector("button");
    btn.addEventListener("click", () => {
        const inputs = Array.from(contactForm.querySelectorAll("input, textarea"));
        // Check all inputs
        const isValid = inputs.every(input => {
            const filled = input.value.trim();
            input.style.borderColor = filled ? "" : "#e74c3c";
            return filled;
        });

        if (isValid) {
            btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
            btn.style.background = "#2ecc71";
            setTimeout(() => {
                inputs.forEach(i => i.value = "");
                btn.innerHTML = "Send Message";
                btn.style.background = "";
            }, 2000);
        }
    });
}
