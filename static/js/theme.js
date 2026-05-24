/**
 * SmartRecipe Theme Switcher
 * Dynamically toggles between Midnight Teal Dark Mode and Crisp Alabaster Light Mode.
 * Persists theme choice in localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load theme immediately from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Create the theme toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle light/dark theme');
    toggleBtn.innerHTML = savedTheme === 'light' ? '🌙' : '☀️';
    
    // Sleek premium inline styles for the toggle button
    toggleBtn.style.cssText = `
        font-size: 1.15rem;
        background: var(--bg-muted);
        border: 1px solid var(--border-light);
        width: 38px;
        height: 38px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--transition-fast);
        color: var(--text-primary);
        margin-left: 12px;
        order: 5;
    `;

    // Soft hover scaling and border highlights
    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.transform = 'scale(1.08)';
        toggleBtn.style.borderColor = 'var(--accent-primary)';
        toggleBtn.style.background = 'var(--bg-card)';
    });
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.transform = 'scale(1)';
        toggleBtn.style.borderColor = 'var(--border-light)';
        toggleBtn.style.background = 'var(--bg-muted)';
    });

    // 3. Inject it into the navbar container
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        // Place it right before the mobile toggle dropdown, or append it
        const mobileToggle = document.querySelector('.nav-mobile-toggle');
        if (mobileToggle) {
            navContainer.insertBefore(toggleBtn, mobileToggle);
        } else {
            navContainer.appendChild(toggleBtn);
        }
    }

    // 4. Bind action listener to toggle
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
    });

    // 5. Mobile Toggle Menu click handler
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('show');
            }
        });
    }
});
