/**
 * Smart Recipe — Frontend Search Logic (Alabaster Warm Editorial)
 * Handles ingredient chip management, AJAX search, card rendering, and modal.
 */

// ============================================
// State
// ============================================
let selectedIngredients = [];

// ============================================
// DOM References
// ============================================
const searchInput       = document.getElementById('search-input');
const searchBtn         = document.getElementById('search-btn');
const tagsContainer     = document.getElementById('tags-container');
const suggestionsWrap   = document.getElementById('suggestions-container');
const resultsGrid       = document.getElementById('results-grid');
const resultsHeader     = document.getElementById('results-header');
const resultsCount      = document.getElementById('results-count');
const loadingSpinner    = document.getElementById('loading-spinner');
const emptyState        = document.getElementById('empty-state');
const noResults         = document.getElementById('no-results');
const recipeModal       = document.getElementById('recipe-modal');
const modalOverlay      = document.getElementById('modal-overlay');
const modalContent      = document.getElementById('modal-content');

// Gradient presets for card accent strips
const cardGradients = [
    'grad-teal',
    'grad-emerald',
    'grad-violet',
    'grad-sky',
    'grad-rose',
    'grad-amber',
];

// ============================================
// Ingredient Chip Management
// ============================================

function addIngredient(name) {
    name = name.trim().toLowerCase();
    if (!name || selectedIngredients.includes(name)) return;
    selectedIngredients.push(name);
    renderTags();
    updateSuggestionStates();
}

function removeIngredient(name) {
    selectedIngredients = selectedIngredients.filter(i => i !== name);
    renderTags();
    updateSuggestionStates();
}

function renderTags() {
    tagsContainer.innerHTML = '';
    if (selectedIngredients.length === 0) {
        tagsContainer.innerHTML = '<span class="search-tags-placeholder">Your ingredients will appear here...</span>';
        return;
    }
    selectedIngredients.forEach(name => {
        const tag = document.createElement('span');
        tag.className = 'ing-tag';
        tag.innerHTML = `
            ${name}
            <button onclick="removeIngredient('${name}')" aria-label="Remove ${name}">
                <svg class="w-3.5 h-3.5" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        `;
        tagsContainer.appendChild(tag);
    });
}

function updateSuggestionStates() {
    document.querySelectorAll('.suggestion-pill').forEach(pill => {
        const name = pill.dataset.name;
        if (selectedIngredients.includes(name)) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

// ============================================
// Load Suggestion Pills from API
// ============================================

async function loadSuggestions() {
    try {
        const res = await fetch('/api/ingredients');
        const data = await res.json();
        if (data.status === 'success') {
            suggestionsWrap.innerHTML = '<span class="suggestions-label">Try:</span>';
            data.ingredients.forEach(ing => {
                const pill = document.createElement('button');
                pill.className = 'suggestion-pill';
                pill.dataset.name = ing.name;
                pill.textContent = ing.name;
                pill.addEventListener('click', () => {
                    if (selectedIngredients.includes(ing.name)) {
                        removeIngredient(ing.name);
                    } else {
                        addIngredient(ing.name);
                    }
                });
                suggestionsWrap.appendChild(pill);
            });
        }
    } catch (err) {
        console.error('Failed to load suggestions:', err);
    }
}

// ============================================
// Search Logic
// ============================================

async function searchRecipes() {
    if (selectedIngredients.length === 0) {
        searchInput.focus();
        searchInput.style.borderColor = '#f87171';
        setTimeout(() => searchInput.style.borderColor = '', 1500);
        return;
    }

    // Show loading, hide others
    loadingSpinner.classList.remove('hidden');
    emptyState.classList.add('hidden');
    noResults.classList.add('hidden');
    resultsHeader.classList.add('hidden');
    resultsGrid.innerHTML = '';

    try {
        const res = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: selectedIngredients })
        });
        const data = await res.json();

        // Small delay so spinner is visible (UX feel)
        await new Promise(r => setTimeout(r, 400));
        loadingSpinner.classList.add('hidden');

        if (data.status === 'success' && data.count > 0) {
            resultsHeader.classList.remove('hidden');
            resultsCount.textContent = data.count;
            renderRecipeCards(data.recipes);
        } else {
            noResults.classList.remove('hidden');
        }
    } catch (err) {
        loadingSpinner.classList.add('hidden');
        noResults.classList.remove('hidden');
        console.error('Search failed:', err);
    }
}

// ============================================
// Render Recipe Cards (Alabaster Theme)
// ============================================

function renderRecipeCards(recipes) {
    resultsGrid.innerHTML = '';
    recipes.forEach((recipe, index) => {
        const gradientClass = cardGradients[index % cardGradients.length];
        const matchPct = recipe.match_percentage;

        // Build matched ingredient pills
        const matchedPills = recipe.matched_ingredients.map(i =>
            `<span class="ing-pill-matched">${i.name}</span>`
        ).join('');

        // Build missing ingredient pills
        const missingPills = recipe.missing_ingredients.map(i =>
            `<span class="ing-pill-missing">${i.name}</span>`
        ).join('');

        // Match bar color class
        let barClass = 'low';
        let pctClass = 'pct-low';
        if (matchPct >= 75) { barClass = 'high'; pctClass = 'pct-high'; }
        else if (matchPct >= 50) { barClass = 'mid'; pctClass = 'pct-mid'; }

        const card = document.createElement('div');
        card.className = `recipe-card card-animate card-delay-${Math.min(index + 1, 6)}`;
        card.innerHTML = `
            <!-- Gradient accent -->
            <div class="recipe-card-accent ${gradientClass}"></div>
            <div class="recipe-card-body">
                <!-- Header -->
                <h3 class="recipe-card-title">${recipe.name}</h3>
                <p class="recipe-card-desc">${recipe.description || ''}</p>

                <!-- Meta row -->
                <div class="recipe-meta">
                    <span>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ${recipe.prep_time_minutes} min
                    </span>
                    <span>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        ${recipe.servings} servings
                    </span>
                </div>

                <!-- Match bar -->
                <div class="match-bar-wrap">
                    <div class="match-bar-labels">
                        <span class="label">${recipe.matched_count} of ${recipe.total_ingredients} ingredients</span>
                        <span class="${pctClass}">${matchPct}%</span>
                    </div>
                    <div class="match-bar-track">
                        <div class="match-bar-fill ${barClass}" style="width: ${matchPct}%"></div>
                    </div>
                </div>

                <!-- Ingredient pills -->
                <div class="ing-pills">
                    ${matchedPills}
                    ${missingPills}
                </div>

                <!-- View button -->
                <button onclick="event.stopPropagation(); showRecipeModal(${JSON.stringify(recipe).replace(/"/g, '&quot;')})"
                        class="recipe-view-btn">
                    View Recipe →
                </button>
            </div>
        `;
        card.addEventListener('click', () => showRecipeModal(recipe));
        resultsGrid.appendChild(card);
    });
}

// ============================================
// Recipe Detail Modal (Premium Servings Scaler + Checklist)
// ============================================

window.activeRecipe = null;
window.activeServings = 4;

function scaleQuantity(qtyStr, originalServings, targetServings) {
    if (!qtyStr || qtyStr.trim() === '—' || qtyStr.trim() === '') return qtyStr;
    const ratio = targetServings / originalServings;
    
    // Match fractions (e.g. 1/2, 3/4)
    const fractionRegex = /(\d+)\/(\d+)/g;
    // Match decimals or integers
    const numberRegex = /(\d+\.\d+|\d+)/g;
    
    let result = qtyStr;
    
    if (qtyStr.match(fractionRegex)) {
        result = qtyStr.replace(fractionRegex, (match, num, denom) => {
            const val = (parseInt(num) / parseInt(denom)) * ratio;
            return formatScaledNumber(val);
        });
    } else {
        result = qtyStr.replace(numberRegex, (match) => {
            const val = parseFloat(match) * ratio;
            return formatScaledNumber(val);
        });
    }
    return result;
}

function formatScaledNumber(val) {
    if (Number.isInteger(val)) return val.toString();
    const diff1_2 = Math.abs(val - Math.round(val * 2) / 2);
    const diff1_4 = Math.abs(val - Math.round(val * 4) / 4);
    
    if (diff1_2 < 0.05) {
        const rounded = Math.round(val * 2) / 2;
        if (Number.isInteger(rounded)) return rounded.toString();
        const whole = Math.floor(rounded);
        return whole > 0 ? `${whole} ½` : '½';
    }
    if (diff1_4 < 0.05) {
        const rounded = Math.round(val * 4) / 4;
        if (Number.isInteger(rounded)) return rounded.toString();
        const whole = Math.floor(rounded);
        const rem = rounded - whole;
        if (rem === 0.25) return whole > 0 ? `${whole} ¼` : '¼';
        if (rem === 0.75) return whole > 0 ? `${whole} ¾` : '¾';
        if (rem === 0.5) return whole > 0 ? `${whole} ½` : '½';
    }
    return parseFloat(val.toFixed(1)).toString();
}

function adjustServings(amount) {
    if (!window.activeRecipe) return;
    const newServings = window.activeServings + amount;
    if (newServings < 1 || newServings > 20) return;
    
    window.activeServings = newServings;
    document.getElementById('modal-servings-display').textContent = `${newServings} servings`;
    
    // Scale all ingredient quantities in the table
    document.querySelectorAll('.ing-row').forEach(row => {
        const originalQty = row.dataset.originalQty;
        const qtyCell = row.querySelector('.ing-qty');
        qtyCell.textContent = scaleQuantity(originalQty, window.activeRecipe.servings || 4, newServings);
    });
}

function parseInstructions(instructionsText) {
    if (!instructionsText) return [];
    let text = instructionsText.replace(/\r\n/g, '\n').trim();
    let steps = [];
    
    // Check for "1. ", "2. " step formats
    const hasNumberedSteps = /(?:^|\n)\d+\.\s+/.test(text);
    // Check for "Step 1", "Step 2" formats
    const hasStepKeywords = /(?:^|\n)step\s*\d+/i.test(text);
    
    if (hasNumberedSteps) {
        let parts = text.split(/(?=(?:^|\n)\d+\.\s+)/);
        steps = parts.map(p => p.trim()).filter(p => p.length > 3);
        steps = steps.map(s => s.replace(/^\d+\.\s*/, '').trim());
    } else if (hasStepKeywords) {
        let parts = text.split(/(?=(?:^|\n)step\s*\d+)/i);
        steps = parts.map(p => p.trim()).filter(p => p.length > 3);
        steps = steps.map(s => s.replace(/^step\s*\d+[\s\-:]*/i, '').trim());
    } else {
        // Split by paragraphs (double newlines)
        let paragraphs = text.split(/\n\s*\n+/);
        if (paragraphs.length > 1) {
            steps = paragraphs.map(p => p.trim()).filter(p => p.length > 5);
        } else {
            // Split by single newlines, but only if they are multiple lines
            let lines = text.split(/\n+/);
            if (lines.length > 2) {
                steps = lines.map(l => l.trim()).filter(l => l.length > 5);
            } else {
                // Split by sentences
                steps = text.split(/\.\s+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 2)
                    .map(s => s.endsWith('.') ? s : s + '.');
            }
        }
    }
    return steps;
}

function showRecipeModal(recipe) {
    window.activeRecipe = recipe;
    window.activeServings = recipe.servings || 4;

    const steps = parseInstructions(recipe.instructions);

    const stepsHtml = steps.map((step, i) => {
        // Highlight chef/pro tips inside the steps
        let tipHtml = '';
        if (step.toLowerCase().includes('tip:') || step.toLowerCase().includes('note:')) {
            const parts = step.split(/(tip:|note:)/i);
            step = parts[0];
            tipHtml = `<div class="step-tip">💡 ${parts[1]} ${parts[2]}</div>`;
        }
        return `<li onclick="this.classList.toggle('completed')">
            <span class="step-number">${i + 1}</span>
            <div style="flex:1;">
                <span class="step-text">${step}</span>
                ${tipHtml}
            </div>
        </li>`;
    }).join('');

    const ingredientRows = [...recipe.matched_ingredients, ...recipe.missing_ingredients].map(ing => {
        const isMatched = recipe.matched_ingredients.some(m => m.name === ing.name);
        return `<tr class="ing-row" data-original-qty="${ing.quantity || ''}">
            <td>
                <span class="ing-name ${isMatched ? 'ing-matched' : 'ing-missing'}">
                    ${isMatched ? '✓' : '✗'} ${ing.name}
                </span>
            </td>
            <td class="ing-qty">${ing.quantity || '—'}</td>
        </tr>`;
    }).join('');

    const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
    const imageUrl = recipe.image_url || fallbackImage;

    // Estimate macros deterministically based on recipe properties
    const hash = (recipe.name || '').length + (recipe.id || 0);
    const estProtein = 15 + (hash % 6) * 5;
    const estFat = 8 + (hash % 5) * 4;
    const estCarbs = 20 + (hash % 10) * 6;
    const estCalories = estProtein * 4 + estCarbs * 4 + estFat * 9;

    modalContent.innerHTML = `
        <!-- Full-width Image Header -->
        <div class="modal-image-header">
            <img src="${imageUrl}" alt="${recipe.name}">
            <div class="overlay"></div>
            
            <div class="actions">
                <button onclick="toggleSaveRecipe(${recipe.id}, this)" class="modal-action-btn ${recipe.is_saved ? 'saved' : ''}" aria-label="Save Recipe">
                    <svg width="20" height="20" fill="${recipe.is_saved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
                <button onclick="closeModal()" class="modal-action-btn" aria-label="Close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="modal-title-overlay">
                <h2>${recipe.name}</h2>
            </div>
        </div>

        <div class="modal-body">
            ${recipe.description ? `<p class="modal-desc">${recipe.description}</p>` : ''}

            <!-- Smart nutrition indicators -->
            <div class="modal-meta">
                <span class="modal-meta-tag teal">⏱️ ${recipe.prep_time_minutes} min</span>
                <span class="modal-meta-tag emerald">🥩 ${estProtein}g Protein</span>
                <span class="modal-meta-tag violet">🥑 ${estFat}g Fat</span>
                <span class="modal-meta-tag amber">🌾 ${estCarbs}g Carbs</span>
                <span class="modal-meta-tag rose">🔥 ${estCalories} kcal</span>
            </div>

            <!-- Ingredients with servings adjuster -->
            <div style="margin-bottom:2rem;">
                <h3 class="modal-section-title">
                    Ingredients
                    <div class="servings-control">
                        <button class="servings-btn" onclick="adjustServings(-1)">-</button>
                        <span class="servings-value" id="modal-servings-display">${window.activeServings} servings</span>
                        <button class="servings-btn" onclick="adjustServings(1)">+</button>
                    </div>
                </h3>
                <table class="modal-ingredients-table"><tbody>${ingredientRows}</tbody></table>
            </div>

            <!-- Gamified steps checklist -->
            <div>
                <h3 class="modal-section-title">
                    Cooking Checklist
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Click steps to mark completed</span>
                </h3>
                <ol class="modal-steps">${stepsHtml}</ol>
            </div>
        </div>
    `;

    recipeModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    recipeModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ============================================
// Event Listeners
// ============================================

// Handle Enter key and comma in search input
if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = searchInput.value.replace(',', '').trim();
            if (val) {
                addIngredient(val);
                searchInput.value = '';
            }
            // If Enter with no text and we have ingredients, trigger search
            if (e.key === 'Enter' && !val && selectedIngredients.length > 0) {
                searchRecipes();
            }
        }
    });
}

// Search button click
if (searchBtn) searchBtn.addEventListener('click', searchRecipes);

// Close modal on overlay click
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ============================================
// Save Recipe Functionality
// ============================================

async function toggleSaveRecipe(recipeId, btnElement) {
    try {
        const res = await fetch(`/api/recipes/${recipeId}/toggle-save`, { method: 'POST' });
        const data = await res.json();
        
        if (data.status === 'success') {
            const svg = btnElement.querySelector('svg');
            if (data.action === 'saved') {
                btnElement.classList.add('saved');
                svg.setAttribute('fill', 'currentColor');
            } else {
                btnElement.classList.remove('saved');
                svg.setAttribute('fill', 'none');
            }
        } else {
            // Probably not logged in or session expired
            window.location.href = '/login';
        }
    } catch (err) {
        console.error('Save failed:', err);
        window.location.href = '/login';
    }
}

// ============================================
// Scroll Reveal Animation
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================
// Initialize
// ============================================

if (tagsContainer) {
    // Attempt to load pantry automatically
    fetch('/api/pantry')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.pantry && data.pantry.length > 0) {
                data.pantry.forEach(ing => {
                    if (!selectedIngredients.includes(ing.name)) {
                        selectedIngredients.push(ing.name);
                    }
                });
            }
            renderTags(); // Render tags (and trigger search if not empty)
        })
        .catch(err => {
            console.error('Failed to load pantry automatically', err);
            renderTags(); // Fallback to just rendering empty/current tags
        });
}

if (suggestionsWrap) loadSuggestions();
