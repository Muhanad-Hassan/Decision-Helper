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
// Decision Helper - Score Based Engine
// Utility: Set custom validity error and show it
const setError = (input, msg) => {
    input.setCustomValidity(msg);
    input.reportValidity();
    // Clear error when user starts typing
    input.oninput = () => input.setCustomValidity("");
};

// Decision Helper - Score Based Engine
get("decideBtn")?.addEventListener("click", ({ target: btn }) => {
    // 1. Gathering Inputs
    const opt1 = {
        name: get("option1").value.trim() || "Option 1",
        val: parseInt(get("opt1-long").value),
        joy: parseInt(get("opt1-joy").value),
        effort: parseInt(get("opt1-effort").value)
    };

    const opt2 = {
        name: get("option2").value.trim() || "Option 2",
        val: parseInt(get("opt2-long").value),
        joy: parseInt(get("opt2-joy").value),
        effort: parseInt(get("opt2-effort").value)
    };

    const name1 = get("option1").value.trim();
    const name2 = get("option2").value.trim();

    const name1Input = get("option1");
    const name2Input = get("option2");

    // 1. Check for Empty Inputs
    if (!name1) return setError(name1Input, "Please fill out this field.");
    if (!name2) return setError(name2Input, "Please fill out this field.");

    // 2. Check for Numeric-Only Inputs
    if (/^\d+$/.test(name1)) return setError(name1Input, "Please enter text, not just numbers.");
    if (/^\d+$/.test(name2)) return setError(name2Input, "Please enter text, not just numbers.");

    // 3. Check for Duplicates
    if (name1.toLowerCase() === name2.toLowerCase()) {
        return setError(name2Input, "Please enter a different option.");
    }

    // 3. Pre-Calculation & Validation (v2.0 Update)
    const calculateIntegrityScore = (o) => {
        let baseScore = (o.val * 2.0) + (o.joy * 1.0);
        let modifier = 0;
        let rule = "Standard";

        // Integrity Rules
        if (o.val >= 7 && o.effort >= 6) {
            modifier = (o.effort * 1.5);
            rule = "Discipline Bonus";
        } else if (o.val <= 4 && o.effort >= 6) {
            modifier = -(o.effort * 2.0);
            rule = "Fool's Errand";
        } else {
            modifier = -o.effort;
        }

        return {
            total: Math.round(baseScore + modifier),
            rule,
            baseScore,
            modifier
        };
    };

    const result1 = calculateIntegrityScore(opt1);
    const result2 = calculateIntegrityScore(opt2);

    // STRICT TIE BREAKER: Prevent identical scores
    if (result1.total === result2.total) {
        return setError(name2Input, "The scores are identical. To give you a reliable decision, please adjust the points to reflect which option is truly more important, more joyful, or more difficult.");
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    setTimeout(() => {
        // 4. Determine Winner (Already calculated)
        let winner, loser, winRes, loseRes;

        if (result1.total > result2.total) {
            winner = opt1; loser = opt2; winRes = result1; loseRes = result2;
        } else {
            winner = opt2; loser = opt1; winRes = result2; loseRes = result1;
        }

        // 5. Rational Justification v2.0 (Mentor Style)
        let reason = "";

        if (winRes.rule === "Discipline Bonus") {
            reason = `High effort usually turns people away, but because the <strong>Long-term Value</strong> is high, this is a growth choice. It will build your character.`;
        } else if (loseRes.rule === "Fool's Errand") {
            reason = `I rejected the other option because it's a <strong>Fool's Errand</strong>—high effort for very little reward. That's a bad trade.`;
        } else if ((winner.val - loser.val) >= 2) {
            reason = `When in doubt, prioritize the future. This option has significantly higher <strong>Long-term Value</strong>.`;
        } else if ((winner.joy - loser.joy) >= 3) {
            reason = `Life is short. Since the values are similar, go with the one that brings you more <strong>Joy</strong>.`;
        } else {
            reason = `It has the superior <strong>Integrity Score</strong> (${winRes.total} vs ${loseRes.total}). It's the most balanced path forward.`;
        }

        // 6. Update UI
        decisionHistory.push({
            choice: winner.name,
            score: winRes.total,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        get("message").innerHTML = `✅ integrity Score Calculated:`;
        get("finalDecision").innerHTML = `
            <div style="font-size:0.8em; margin-bottom:10px; color:#F41E75;">${winner.name}</div>
            <div style="font-size:2.5rem; font-weight:800; color:#fff;">${winRes.total}</div>
            <div style="font-size:0.7em; color:#94A3B8;">Integrity Score</div>
        `;

        // Append justification
        const resultBox = document.querySelector('.result-box');
        // Remove old reasons
        const oldReason = resultBox.querySelector('.reason-text');
        if (oldReason) oldReason.remove();

        const reasonEl = document.createElement('p');
        reasonEl.style.marginTop = "1.5rem";
        reasonEl.style.lineHeight = "1.6";
        reasonEl.style.color = "#cbd5e1";
        reasonEl.style.fontSize = "0.95rem";
        reasonEl.innerHTML = `💡 <strong>Rational Justification:</strong><br>${reason}`;
        reasonEl.classList.add('reason-text');

        resultBox.appendChild(reasonEl);

        get("result-container").classList.remove('hidden');
        updateHistory();

        btn.disabled = false;
        btn.innerHTML = originalText;
    }, 1000); // 1s delay for "thinking" effect
});

// Contact Form (Requirement: Input Validation)
const contactForm = get("newContactForm");
if (contactForm) {
    const btn = contactForm.querySelector("button");
    btn.addEventListener("click", () => {
        const fname = get("contact-fname");
        const lname = get("contact-lname");
        const email = get("contact-email");
        const msg = contactForm.querySelector("textarea");

        let isValid = true;


        // 1. Validate Names (Not empty, Not numeric-only)
        if (!fname.value.trim()) return setError(fname, "Please enter your first name.");
        if (/^\d+$/.test(fname.value.trim())) return setError(fname, "Name cannot be just numbers.");

        if (!lname.value.trim()) return setError(lname, "Please enter your last name.");
        if (/^\d+$/.test(lname.value.trim())) return setError(lname, "Name cannot be just numbers.");

        // 2. Validate Email (Basic Regex)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) return setError(email, "Please enter your email address.");
        if (!emailPattern.test(email.value.trim())) return setError(email, "Please enter a valid email address.");

        // 3. Validate Message (Not empty)
        if (!msg.value.trim()) return setError(msg, "Please enter a message.");

        if (isValid) {
            btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
            btn.style.background = "#2ecc71";
            setTimeout(() => {
                [fname, lname, email, msg].forEach(i => i.value = "");
                btn.innerHTML = "Send Message";
                btn.style.background = "";
            }, 2000);
        }
    });
}
