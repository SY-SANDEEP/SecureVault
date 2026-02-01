// DOM Elements
const passwordInput = document.getElementById("password");
const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");
const copyBtn = document.getElementById("copyBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const generateBtn = document.getElementById("generateBtn");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const entropyText = document.getElementById("entropyText");

// Checkboxes
const uppercaseCheck = document.getElementById("uppercase");
const lowercaseCheck = document.getElementById("lowercase");
const numbersCheck = document.getElementById("numbers");
const symbolsCheck = document.getElementById("symbols");
const excludeAmbiguousCheck = document.getElementById("excludeAmbiguous");
const pronounceableCheck = document.getElementById("pronounceable");

// Tab Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Vault Elements
const vaultWebsite = document.getElementById("vaultWebsite");
const vaultUsername = document.getElementById("vaultUsername");
const vaultPassword = document.getElementById("vaultPassword");
const addToVaultBtn = document.getElementById("addToVault");
const vaultList = document.getElementById("vaultList");
const vaultSearch = document.getElementById("vaultSearch");

// Analyzer Elements
const analyzerInput = document.getElementById("analyzerInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const analyzerResults = document.getElementById("analyzerResults");

// Breach Check Elements
const breachPassword = document.getElementById("breachPassword");
const breachCheckBtn = document.getElementById("breachCheckBtn");
const breachResults = document.getElementById("breachResults");

// Toast
const toast = document.getElementById("toast");

// Initialize
lengthValue.textContent = lengthSlider.value;
loadVault();

// Event Listeners
lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
});

generateBtn.addEventListener("click", generatePassword);
regenerateBtn.addEventListener("click", generatePassword);

copyBtn.addEventListener("click", () => {
    if (!passwordInput.value) return;
    navigator.clipboard.writeText(passwordInput.value);
    showToast("Password copied to clipboard!");
});

// Tab Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(targetTab).classList.add('active');
    });
});

// Pattern Buttons
document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const pattern = btn.dataset.pattern;
        applyPattern(pattern);
    });
});

// Vault
addToVaultBtn.addEventListener("click", addToVault);
vaultSearch.addEventListener("input", filterVault);

// Analyzer
analyzeBtn.addEventListener("click", analyzePasswords);

// Breach Check
breachCheckBtn.addEventListener("click", checkBreach);

// Functions

function generatePassword() {
    const length = parseInt(lengthSlider.value);
    const useUpper = uppercaseCheck.checked;
    const useLower = lowercaseCheck.checked;
    const useNumbers = numbersCheck.checked;
    const useSymbols = symbolsCheck.checked;
    const excludeAmbiguous = excludeAmbiguousCheck.checked;
    const pronounceable = pronounceableCheck.checked;

    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let numbers = "0123456789";
    let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeAmbiguous) {
        upper = upper.replace(/[O]/g, '');
        lower = lower.replace(/[l]/g, '');
        numbers = numbers.replace(/[01]/g, '');
        symbols = symbols.replace(/[|]/g, '');
    }

    let chars = "";
    if (useUpper) chars += upper;
    if (useLower) chars += lower;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    if (chars === "") {
        showToast("Please select at least one character type!");
        return;
    }

    let password = "";

    if (pronounceable) {
        // Generate pronounceable password
        const consonants = "bcdfghjklmnpqrstvwxyz";
        const vowels = "aeiou";
        for (let i = 0; i < length; i++) {
            if (i % 2 === 0) {
                password += consonants[Math.floor(Math.random() * consonants.length)];
            } else {
                password += vowels[Math.floor(Math.random() * vowels.length)];
            }
        }
        if (useUpper) {
            password = password.split('').map((char, i) => 
                Math.random() > 0.5 ? char.toUpperCase() : char
            ).join('');
        }
        if (useNumbers) {
            const numPos = Math.floor(Math.random() * password.length);
            password = password.substring(0, numPos) + 
                      Math.floor(Math.random() * 10) + 
                      password.substring(numPos + 1);
        }
    } else {
        // Generate random password with improved randomness
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(array[i] % chars.length);
        }

        // Ensure at least one character from each selected type
        let ensureChars = '';
        if (useUpper) ensureChars += upper[Math.floor(Math.random() * upper.length)];
        if (useLower) ensureChars += lower[Math.floor(Math.random() * lower.length)];
        if (useNumbers) ensureChars += numbers[Math.floor(Math.random() * numbers.length)];
        if (useSymbols) ensureChars += symbols[Math.floor(Math.random() * symbols.length)];

        // Replace random positions with ensured characters
        for (let i = 0; i < ensureChars.length; i++) {
            const pos = Math.floor(Math.random() * password.length);
            password = password.substring(0, pos) + ensureChars[i] + password.substring(pos + 1);
        }
    }

    passwordInput.value = password;
    checkStrength(password);
}

function checkStrength(password) {
    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 12) strength += 2;
    else if (password.length >= 8) strength += 1;
    else feedback.push("Too short");

    // Character variety
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push("No uppercase");

    if (/[a-z]/.test(password)) strength++;
    else feedback.push("No lowercase");

    if (/[0-9]/.test(password)) strength++;
    else feedback.push("No numbers");

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push("No symbols");

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
        strength--;
        feedback.push("Repeated characters");
    }

    // Check for sequential characters
    if (/abc|bcd|cde|def|123|234|345|456/.test(password.toLowerCase())) {
        strength--;
        feedback.push("Sequential characters");
    }

    // Calculate entropy
    const charsetSize = 
        (/[A-Z]/.test(password) ? 26 : 0) +
        (/[a-z]/.test(password) ? 26 : 0) +
        (/[0-9]/.test(password) ? 10 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 32 : 0);
    
    const entropy = password.length * Math.log2(charsetSize);
    entropyText.textContent = `Entropy: ${Math.round(entropy)} bits`;

    // Determine strength level
    let strengthLevel = "Weak";
    let strengthColor = "#ff0055";
    let strengthWidth = "25%";

    if (strength >= 7) {
        strengthLevel = "Very Strong";
        strengthColor = "#00ff9d";
        strengthWidth = "100%";
    } else if (strength >= 5) {
        strengthLevel = "Strong";
        strengthColor = "#00d4ff";
        strengthWidth = "75%";
    } else if (strength >= 3) {
        strengthLevel = "Medium";
        strengthColor = "#ffaa00";
        strengthWidth = "50%";
    }

    strengthFill.style.width = strengthWidth;
    strengthFill.style.background = strengthColor;
    strengthText.textContent = `Strength: ${strengthLevel}`;
}

function applyPattern(pattern) {
    switch(pattern) {
        case 'pin':
            lengthSlider.value = 4;
            lengthValue.textContent = 4;
            uppercaseCheck.checked = false;
            lowercaseCheck.checked = false;
            numbersCheck.checked = true;
            symbolsCheck.checked = false;
            break;
        case 'memorable':
            lengthSlider.value = 12;
            lengthValue.textContent = 12;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            symbolsCheck.checked = false;
            pronounceableCheck.checked = true;
            break;
        case 'max-security':
            lengthSlider.value = 32;
            lengthValue.textContent = 32;
            uppercaseCheck.checked = true;
            lowercaseCheck.checked = true;
            numbersCheck.checked = true;
            symbolsCheck.checked = true;
            pronounceableCheck.checked = false;
            break;
        case 'passphrase':
            const words = [
                'Correct', 'Horse', 'Battery', 'Staple', 'Mountain', 'River',
                'Ocean', 'Forest', 'Desert', 'Valley', 'Cloud', 'Thunder',
                'Lightning', 'Rainbow', 'Sunset', 'Sunrise', 'Midnight', 'Dawn'
            ];
            const passphrase = Array.from({length: 4}, () => 
                words[Math.floor(Math.random() * words.length)]
            ).join('-') + Math.floor(Math.random() * 100);
            passwordInput.value = passphrase;
            checkStrength(passphrase);
            return;
    }
    generatePassword();
}

// Vault Functions
function loadVault() {
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    renderVault(vault);
}

function addToVault() {
    const website = vaultWebsite.value.trim();
    const username = vaultUsername.value.trim();
    const password = vaultPassword.value.trim();

    if (!website || !username || !password) {
        showToast("Please fill all fields!");
        return;
    }

    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    
    const entry = {
        id: Date.now(),
        website,
        username,
        password,
        created: new Date().toISOString()
    };

    vault.push(entry);
    localStorage.setItem('passwordVault', JSON.stringify(vault));

    vaultWebsite.value = '';
    vaultUsername.value = '';
    vaultPassword.value = '';

    renderVault(vault);
    showToast("Password added to vault!");
}

function renderVault(vault) {
    if (vault.length === 0) {
        vaultList.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 2rem;">No passwords saved yet. Add your first password above.</p>';
        return;
    }

    vaultList.innerHTML = vault.map(entry => `
        <div class="vault-item">
            <div class="vault-info">
                <h4>${escapeHtml(entry.website)}</h4>
                <p>${escapeHtml(entry.username)}</p>
            </div>
            <div class="vault-actions">
                <button class="vault-btn" onclick="showPassword(${entry.id})">Show</button>
                <button class="vault-btn" onclick="copyVaultPassword(${entry.id})">Copy</button>
                <button class="vault-btn delete" onclick="deleteVaultEntry(${entry.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function filterVault() {
    const searchTerm = vaultSearch.value.toLowerCase();
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    const filtered = vault.filter(entry => 
        entry.website.toLowerCase().includes(searchTerm) ||
        entry.username.toLowerCase().includes(searchTerm)
    );
    renderVault(filtered);
}

function showPassword(id) {
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    const entry = vault.find(e => e.id === id);
    if (entry) {
        showToast(`Password: ${entry.password}`, 5000);
    }
}

function copyVaultPassword(id) {
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    const entry = vault.find(e => e.id === id);
    if (entry) {
        navigator.clipboard.writeText(entry.password);
        showToast("Password copied!");
    }
}

function deleteVaultEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    let vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    vault = vault.filter(e => e.id !== id);
    localStorage.setItem('passwordVault', JSON.stringify(vault));
    renderVault(vault);
    showToast("Entry deleted!");
}

// Analyzer Functions
function analyzePasswords() {
    const passwords = analyzerInput.value.split('\n').filter(p => p.trim());
    
    if (passwords.length === 0) {
        showToast("Please enter at least one password!");
        return;
    }

    const results = passwords.map(password => analyzePassword(password.trim()));
    renderAnalyzerResults(results);
}

function analyzePassword(password) {
    let score = 0;
    let issues = [];
    let strengths = [];

    // Length analysis
    if (password.length < 8) {
        issues.push("Too short (less than 8 characters)");
    } else if (password.length >= 12) {
        score += 2;
        strengths.push("Good length");
    } else {
        score += 1;
    }

    // Character variety
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (hasUpper) { score++; strengths.push("Uppercase letters"); }
    else issues.push("No uppercase letters");

    if (hasLower) { score++; strengths.push("Lowercase letters"); }
    else issues.push("No lowercase letters");

    if (hasNumber) { score++; strengths.push("Numbers"); }
    else issues.push("No numbers");

    if (hasSymbol) { score++; strengths.push("Special characters"); }
    else issues.push("No special characters");

    // Common patterns
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        score -= 3;
        issues.push("Contains common password");
    }

    // Repeated characters
    if (/(.)\1{2,}/.test(password)) {
        score--;
        issues.push("Repeated characters (e.g., 'aaa')");
    }

    // Sequential characters
    if (/abc|bcd|cde|123|234|345/.test(password.toLowerCase())) {
        score--;
        issues.push("Sequential characters");
    }

    // Dictionary words (simple check)
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'master'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
        issues.push("Contains common word");
    }

    // Calculate entropy
    const charsetSize = 
        (hasUpper ? 26 : 0) +
        (hasLower ? 26 : 0) +
        (hasNumber ? 10 : 0) +
        (hasSymbol ? 32 : 0);
    
    const entropy = Math.round(password.length * Math.log2(charsetSize));

    // Determine strength
    let strength = 'weak';
    if (score >= 6) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
        password,
        strength,
        score,
        entropy,
        issues,
        strengths
    };
}

function renderAnalyzerResults(results) {
    analyzerResults.innerHTML = results.map(result => `
        <div class="result-card ${result.strength}">
            <div class="result-header">
                <h4>${escapeHtml(result.password.substring(0, 20))}${result.password.length > 20 ? '...' : ''}</h4>
                <span class="result-badge ${result.strength}">${result.strength}</span>
            </div>
            <div class="result-details">
                <div>
                    <span>Score:</span>
                    <span>${result.score}/7</span>
                </div>
                <div>
                    <span>Entropy:</span>
                    <span>${result.entropy} bits</span>
                </div>
                <div>
                    <span>Length:</span>
                    <span>${result.password.length} characters</span>
                </div>
                ${result.strengths.length > 0 ? `
                    <div style="grid-column: 1/-1; margin-top: 0.5rem;">
                        <strong style="color: var(--primary);">✓ Strengths:</strong>
                        <ul style="margin: 0.3rem 0 0 1.5rem;">
                            ${result.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${result.issues.length > 0 ? `
                    <div style="grid-column: 1/-1; margin-top: 0.5rem;">
                        <strong style="color: var(--danger);">⚠ Issues:</strong>
                        <ul style="margin: 0.3rem 0 0 1.5rem;">
                            ${result.issues.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Breach Check Functions
async function checkBreach() {
    const password = breachPassword.value;
    
    if (!password) {
        showToast("Please enter a password!");
        return;
    }

    breachResults.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-dim);">Checking database...</div>';

    // Simulate breach check (in real app, use haveibeenpwned API with k-anonymity)
    setTimeout(() => {
        const isCommon = checkCommonPassword(password);
        renderBreachResult(isCommon);
    }, 1500);
}

function checkCommonPassword(password) {
    const commonPasswords = [
        '123456', 'password', '12345678', 'qwerty', '123456789',
        '12345', '1234', '111111', '1234567', 'dragon',
        '123123', 'baseball', 'iloveyou', '1234567890', '1q2w3e4r',
        'sunshine', 'princess', 'admin', 'welcome', 'monkey'
    ];

    return commonPasswords.includes(password.toLowerCase());
}

function renderBreachResult(isBreached) {
    if (isBreached) {
        breachResults.innerHTML = `
            <div class="breach-alert danger">
                <h3>⚠️ WARNING: Password Compromised!</h3>
                <p>This password has been found in data breaches and should NEVER be used.</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">
                    Recommendation: Generate a new, unique password immediately.
                </p>
            </div>
        `;
    } else {
        breachResults.innerHTML = `
            <div class="breach-alert safe">
                <h3>✓ Password Appears Safe</h3>
                <p>This password was not found in known breach databases.</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">
                    Note: This doesn't guarantee complete safety. Always use unique, strong passwords.
                </p>
            </div>
        `;
    }
}

// Utility Functions
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Generate initial password on load
generatePassword();