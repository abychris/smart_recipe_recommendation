/**
 * SmartRecipe — Health & Wellness Center
 * Complete JS: tab switching, card data, modal rendering, BMI calculator
 */

// ============================================
// Wellness Data
// ============================================

const gymPlans = [
    {
        id: 'beginner',
        icon: '🏋️',
        iconBg: 'teal-bg',
        title: 'Beginner Full-Body Plan',
        subtitle: '3 days/week — Build a foundation with fundamental compound movements.',
        tags: ['beginner', '3x/week'],
        schedule: {
            'Mon': 'Push-ups, Bodyweight Squats, Plank, Lunges, Dumbbell Rows',
            'Tue': 'Rest / Light walk',
            'Wed': 'Dumbbell Press, Goblet Squats, Lat Pulldown, Shoulder Press, Crunches',
            'Thu': 'Rest / Yoga',
            'Fri': 'Deadlifts, Bench Press, Leg Press, Bicep Curls, Tricep Dips',
            'Sat': 'Active Recovery (walk, stretch)',
            'Sun': 'Rest'
        },
        tips: [
            'Start with lighter weights and focus on proper form for the first 2 weeks.',
            'Rest 60-90 seconds between sets. Aim for 3 sets of 10-12 reps.',
            'Increase weight by 2.5kg when you can complete all sets comfortably.',
            'Stay hydrated — drink at least 2-3 liters of water per day.',
            'Sleep 7-8 hours to maximize muscle recovery and growth.'
        ]
    },
    {
        id: 'intermediate',
        icon: '💪',
        iconBg: 'emerald-bg',
        title: 'Intermediate Push/Pull/Legs',
        subtitle: '5 days/week — Classic PPL split for serious muscle building.',
        tags: ['intermediate', '5x/week'],
        schedule: {
            'Mon': 'Push: Bench Press, Incline Dumbbell Press, Shoulder Press, Lateral Raises, Tricep Pushdowns',
            'Tue': 'Pull: Deadlifts, Barbell Rows, Pull-ups, Face Pulls, Barbell Curls',
            'Wed': 'Legs: Squats, Leg Press, Romanian Deadlifts, Leg Curls, Calf Raises',
            'Thu': 'Push: Overhead Press, Dips, Cable Flyes, Arnold Press, Skull Crushers',
            'Fri': 'Pull: Weighted Pull-ups, Cable Rows, Hammer Curls, Rear Delt Flyes, Shrugs',
            'Sat': 'Legs + Abs: Front Squats, Bulgarian Split Squats, Leg Extensions, Planks, Hanging Leg Raises',
            'Sun': 'Rest'
        },
        tips: [
            'Follow progressive overload — increase weight or reps each week.',
            'Keep rest periods 60-120 seconds for hypertrophy, 3-5 min for strength.',
            'Include a deload week every 4-6 weeks (reduce volume by 40%).',
            'Track your workouts in a journal or app to ensure progress.',
            'Consume 1.6-2.2g protein per kg bodyweight daily for optimal muscle growth.'
        ]
    },
    {
        id: 'cardio',
        icon: '🏃',
        iconBg: 'rose-bg',
        title: 'Cardio & Fat Loss Plan',
        subtitle: '4 days/week — HIIT and steady-state cardio for maximum fat burn.',
        tags: ['fat-loss', '4x/week'],
        schedule: {
            'Mon': 'HIIT: 30s sprint / 60s jog × 12 rounds, followed by 10 min cooldown',
            'Tue': 'Strength Circuit: Burpees, Mountain Climbers, Jump Squats, Push-ups (4 rounds × 45s each)',
            'Wed': 'Rest / Light yoga or stretching',
            'Thu': 'Steady-State: 40-minute brisk walk or light jog at 60-70% max heart rate',
            'Fri': 'HIIT: Cycling intervals — 20s max effort / 40s recovery × 15 rounds',
            'Sat': 'Active Recovery: Swimming, hiking, or recreational sport',
            'Sun': 'Rest'
        },
        tips: [
            'Keep your heart rate in the fat-burning zone (60-70% max HR) for steady-state.',
            'HIIT sessions should be intense but short — 20-30 minutes is sufficient.',
            'Combine with a slight caloric deficit (300-500 kcal below maintenance) for best results.',
            'Avoid overtraining — listen to your body and take rest days seriously.',
            'Add resistance training 2x/week to preserve muscle mass during fat loss.'
        ]
    },
    {
        id: 'yoga',
        icon: '🧘',
        iconBg: 'violet-bg',
        title: 'Yoga & Flexibility',
        subtitle: '5 days/week — Improve flexibility, balance, and mental wellness.',
        tags: ['flexibility', '5x/week'],
        schedule: {
            'Mon': 'Sun Salutation Flow (20 min), Warrior I-II-III sequence, Tree Pose, Savasana',
            'Tue': 'Hip Openers: Pigeon Pose, Lizard Pose, Happy Baby, Butterfly Stretch',
            'Wed': 'Core Yoga: Boat Pose, Plank variations, Side Plank, Dolphin Pose',
            'Thu': 'Restorative: Child\'s Pose, Legs Up the Wall, Supported Bridge, Yin stretches',
            'Fri': 'Power Yoga: Chair Pose flow, Crow Pose practice, Standing balances',
            'Sat': 'Full Body Stretch: 30-minute guided stretch focusing on all major muscle groups',
            'Sun': 'Rest / Meditation (15-20 min guided mindfulness)'
        },
        tips: [
            'Never force a stretch — ease into poses gradually and breathe deeply.',
            'Practice on an empty stomach, ideally in the morning for best energy.',
            'Hold each pose for 30-60 seconds; breathe through any discomfort.',
            'Yoga improves digestion, sleep quality, and reduces cortisol (stress hormone).',
            'Consistency matters more than intensity — 20 minutes daily beats 2 hours weekly.'
        ]
    }
];

const dietPlans = [
    {
        id: 'balanced',
        icon: '🥗',
        iconBg: 'emerald-bg',
        title: 'Balanced Nutrition Plan',
        subtitle: 'A well-rounded diet with optimal macro ratios for general health.',
        tags: ['balanced', 'all-levels'],
        macros: { carbs: '45%', protein: '30%', fat: '25%' },
        meals: [
            { time: 'Breakfast (7-8 AM)', meal: 'Oatmeal with banana, almonds, and a drizzle of honey. Side of boiled eggs (2).' },
            { time: 'Mid-Morning (10 AM)', meal: 'Greek yogurt with mixed berries and a handful of walnuts.' },
            { time: 'Lunch (12:30 PM)', meal: 'Grilled chicken breast with brown rice, steamed broccoli, and mixed salad with olive oil dressing.' },
            { time: 'Afternoon Snack (3 PM)', meal: 'Apple slices with 2 tbsp peanut butter, or a protein shake.' },
            { time: 'Dinner (7 PM)', meal: 'Baked salmon fillet with quinoa, roasted sweet potatoes, and sautéed spinach.' },
            { time: 'Before Bed (9 PM)', meal: 'Warm turmeric milk (haldi doodh) or chamomile tea with a few almonds.' }
        ],
        tips: [
            'Eat a rainbow — aim for 5+ colors of fruits and vegetables daily.',
            'Drink water 30 minutes before meals to aid digestion.',
            'Avoid processed foods; focus on whole, minimally processed ingredients.',
            'Prepare meals in advance to stay consistent with healthy eating.'
        ]
    },
    {
        id: 'muscle',
        icon: '🥩',
        iconBg: 'rose-bg',
        title: 'Muscle Building Diet',
        subtitle: 'High protein, caloric surplus plan designed for lean mass gains.',
        tags: ['bulking', 'high-protein'],
        macros: { carbs: '40%', protein: '35%', fat: '25%' },
        meals: [
            { time: 'Breakfast (7 AM)', meal: '4-egg omelette with mushrooms, spinach, and cheese. 2 slices whole wheat toast with avocado.' },
            { time: 'Mid-Morning (10 AM)', meal: 'Protein shake (40g whey) with banana and 1 tbsp peanut butter blended with milk.' },
            { time: 'Lunch (1 PM)', meal: '200g grilled chicken thighs, 1.5 cups basmati rice, dal (lentil curry), cucumber raita.' },
            { time: 'Pre-Workout (4 PM)', meal: 'Banana with a handful of dates and black coffee for energy.' },
            { time: 'Post-Workout (6 PM)', meal: 'Protein shake with oats, honey, and creatine (5g).' },
            { time: 'Dinner (8 PM)', meal: '200g paneer tikka or grilled fish, 2 rotis, mixed vegetable sabzi, and a glass of buttermilk.' }
        ],
        tips: [
            'Consume 1.8-2.2g protein per kg bodyweight — spread across 5-6 meals.',
            'Eat in a 300-500 calorie surplus above your TDEE for lean gains.',
            'Time your largest carb meals around your workout window.',
            'Creatine monohydrate (5g/day) is the most effective legal supplement for muscle growth.'
        ]
    },
    {
        id: 'weightloss',
        icon: '⚖️',
        iconBg: 'sky-bg',
        title: 'Weight Loss Diet',
        subtitle: 'Calorie-deficit plan with high satiety foods to lose fat safely.',
        tags: ['cutting', 'fat-loss'],
        macros: { carbs: '35%', protein: '40%', fat: '25%' },
        meals: [
            { time: 'Breakfast (8 AM)', meal: 'Moong dal chilla (2 pieces) with mint chutney, or scrambled egg whites (4) with 1 slice toast.' },
            { time: 'Mid-Morning (10:30 AM)', meal: 'Green tea + a small bowl of sprouts salad with lemon and chaat masala.' },
            { time: 'Lunch (1 PM)', meal: 'Grilled fish or tofu (150g), 1 small bowl brown rice, palak dal, and cucumber-tomato salad.' },
            { time: 'Afternoon (3:30 PM)', meal: 'Buttermilk (chaas) or coconut water + 10 roasted almonds.' },
            { time: 'Dinner (7 PM)', meal: 'Soup (tomato or mixed vegetable), 2 egg-white omelette with vegetables, or 1 roti with lauki sabzi.' },
            { time: 'Before Bed', meal: 'Warm water with lemon, or 1 cup low-fat milk with a pinch of turmeric.' }
        ],
        tips: [
            'Maintain a 400-600 calorie deficit — never go below your BMR.',
            'Drink 3+ liters of water daily — thirst is often confused with hunger.',
            'Eat slowly and chew thoroughly — it takes 20 minutes for fullness signals to reach your brain.',
            'Include fiber-rich foods (oats, vegetables, lentils) to stay full longer.'
        ]
    },
    {
        id: 'vegetarian',
        icon: '🥬',
        iconBg: 'emerald-bg',
        title: 'Vegetarian Protein Plan',
        subtitle: 'Plant-based high-protein diet perfect for vegetarian athletes.',
        tags: ['vegetarian', 'high-protein'],
        macros: { carbs: '45%', protein: '30%', fat: '25%' },
        meals: [
            { time: 'Breakfast (7:30 AM)', meal: 'Paneer bhurji (scrambled paneer) with 2 multigrain rotis and a glass of milk.' },
            { time: 'Mid-Morning (10 AM)', meal: 'Soy milk smoothie with banana, chia seeds, and mixed nuts.' },
            { time: 'Lunch (1 PM)', meal: 'Rajma curry (kidney beans) with brown rice, mixed vegetable raita, and green salad.' },
            { time: 'Afternoon (3:30 PM)', meal: 'Roasted chana (chickpeas) or protein bar + green tea.' },
            { time: 'Dinner (7:30 PM)', meal: 'Palak paneer with 2 rotis, dal tadka, and a bowl of curd.' },
            { time: 'Before Bed', meal: 'A glass of warm milk with turmeric and a tablespoon of flaxseed powder.' }
        ],
        tips: [
            'Combine grains with legumes (rice + dal) for complete amino acid profiles.',
            'Paneer, tofu, tempeh, and soy chunks are excellent high-protein veg options.',
            'Consider B12 and vitamin D supplements if fully vegetarian.',
            'Sprouts and fermented foods improve protein absorption and gut health.'
        ]
    }
];

const healthConditions = [
    {
        id: 'diabetes',
        icon: '🩺',
        iconBg: 'sky-bg',
        title: 'Diabetes (Type 2)',
        subtitle: 'Low glycemic foods that help regulate blood sugar levels and improve insulin sensitivity.',
        recommended: ['Bitter gourd (karela)', 'Methi (fenugreek) leaves', 'Whole oats and barley', 'Cinnamon', 'Green leafy vegetables', 'Nuts and seeds (flax, chia)', 'Legumes and lentils', 'Fish (omega-3 rich)', 'Amla (Indian gooseberry)', 'Turmeric'],
        avoid: ['White rice and refined flour (maida)', 'Sugary beverages and juices', 'White bread and pastries', 'Fried and processed snacks', 'Potatoes (in excess)', 'Mangoes and grapes (high sugar)'],
        tips: [
            'Eat small, frequent meals to prevent blood sugar spikes.',
            'Choose complex carbohydrates with a low glycemic index (GI < 55).',
            'Include fiber with every meal — it slows glucose absorption.',
            'Regular moderate exercise (30 min/day) significantly improves insulin sensitivity.',
            'Monitor blood sugar levels regularly and consult your doctor for dietary adjustments.'
        ]
    },
    {
        id: 'hypertension',
        icon: '❤️',
        iconBg: 'rose-bg',
        title: 'Hypertension (High BP)',
        subtitle: 'Heart-healthy DASH diet approach to naturally lower blood pressure.',
        recommended: ['Bananas and oranges (potassium-rich)', 'Garlic and onions', 'Beetroot and beetroot juice', 'Leafy greens (spinach, kale)', 'Low-fat dairy (curd, paneer)', 'Whole grains (oats, brown rice)', 'Fatty fish (salmon, mackerel)', 'Dark chocolate (70%+ cocoa, small amounts)', 'Seeds (pumpkin, sunflower)', 'Hibiscus tea'],
        avoid: ['Table salt and high-sodium foods', 'Pickles and papad', 'Canned soups and processed meats', 'Excessive caffeine', 'Alcohol', 'Fried and fast food'],
        tips: [
            'Limit sodium intake to less than 2,300mg (ideally 1,500mg) per day.',
            'The DASH diet emphasizes fruits, vegetables, whole grains, and lean protein.',
            'Potassium-rich foods counterbalance the effects of sodium on blood pressure.',
            'Reduce stress through meditation, deep breathing, or yoga — stress elevates BP.',
            'Aim for 150 minutes of moderate aerobic exercise per week.'
        ]
    },
    {
        id: 'cholesterol',
        icon: '🫀',
        iconBg: 'amber-bg',
        title: 'High Cholesterol',
        subtitle: 'Foods that help lower LDL (bad cholesterol) and raise HDL (good cholesterol).',
        recommended: ['Oats and oat bran', 'Almonds and walnuts', 'Olive oil and avocado', 'Fatty fish (salmon, sardines)', 'Garlic', 'Green tea', 'Beans and lentils', 'Soy products (tofu, soy milk)', 'Apples and citrus fruits', 'Flaxseeds and chia seeds'],
        avoid: ['Trans fats (vanaspati, margarine)', 'Deep-fried foods (samosas, pakoras)', 'Full-fat dairy and butter', 'Red meat and organ meats', 'Processed snacks (chips, cookies)', 'Coconut oil (in excess)'],
        tips: [
            'Soluble fiber binds cholesterol in the digestive system and removes it — eat oats daily.',
            'Replace saturated fats with unsaturated fats (olive oil instead of butter).',
            'Omega-3 fatty acids lower triglycerides — eat fish 2-3 times per week.',
            'Exercise raises HDL (good cholesterol) — aim for 30 minutes of moderate activity daily.',
            'Quit smoking — it lowers HDL and damages blood vessel walls.'
        ]
    },
    {
        id: 'pcos',
        icon: '🌸',
        iconBg: 'violet-bg',
        title: 'PCOS (Polycystic Ovary Syndrome)',
        subtitle: 'Anti-inflammatory, low-GI foods that help manage hormonal imbalance and insulin resistance.',
        recommended: ['Leafy greens (spinach, kale)', 'Berries (blueberries, strawberries)', 'Fatty fish (salmon, sardines)', 'Turmeric and cinnamon', 'Nuts (almonds, walnuts)', 'Seeds (flax, pumpkin, sunflower)', 'Whole grains (quinoa, brown rice)', 'Lean proteins (chicken, tofu)', 'Green tea and spearmint tea', 'Avocados'],
        avoid: ['Refined carbs (white bread, pasta)', 'Sugary drinks and desserts', 'Processed and fast food', 'Excessive dairy (can worsen acne)', 'Soy products (in excess — may affect hormones)', 'Alcohol and excessive caffeine'],
        tips: [
            'Focus on anti-inflammatory foods to reduce PCOS symptoms.',
            'Low-GI foods help manage insulin resistance, a key driver of PCOS.',
            'Spearmint tea (2 cups/day) has been shown to reduce androgen levels.',
            'Regular exercise (especially strength training) improves insulin sensitivity.',
            'Maintain a healthy weight — even 5-10% weight loss can restore regular periods.'
        ]
    },
    {
        id: 'anemia',
        icon: '🩸',
        iconBg: 'rose-bg',
        title: 'Iron-Deficiency Anemia',
        subtitle: 'Iron-rich and vitamin C-rich foods to boost hemoglobin and red blood cell production.',
        recommended: ['Spinach and other dark leafy greens', 'Beetroot and beetroot juice', 'Pomegranate', 'Dates and raisins', 'Jaggery (gur)', 'Lentils and chickpeas', 'Red meat and liver', 'Fortified cereals', 'Pumpkin seeds', 'Vitamin C fruits (oranges, amla, guava)'],
        avoid: ['Tea and coffee with meals (inhibit iron absorption)', 'Calcium supplements with iron-rich meals', 'Excessive dairy during iron-rich meals', 'Processed and junk food', 'Soda and sugary drinks'],
        tips: [
            'Pair iron-rich foods with vitamin C to increase absorption by up to 6x.',
            'Cook in cast iron cookware — it can add iron to your food.',
            'Avoid tea/coffee within 1 hour of iron-rich meals — tannins block absorption.',
            'Soaking and sprouting legumes increases iron bioavailability.',
            'Get your hemoglobin levels checked every 3 months if you are anemic.'
        ]
    },
    {
        id: 'thyroid',
        icon: '🦋',
        iconBg: 'sky-bg',
        title: 'Hypothyroidism',
        subtitle: 'Thyroid-supporting nutrients and foods that help manage an underactive thyroid.',
        recommended: ['Iodized salt', 'Eggs (rich in iodine and selenium)', 'Brazil nuts (highest selenium source)', 'Fish and seafood', 'Dairy products (milk, yogurt)', 'Coconut oil', 'Zinc-rich foods (pumpkin seeds, chickpeas)', 'Vitamin D (sunlight, fortified foods)', 'Berries and citrus fruits', 'Whole grains (quinoa, brown rice)'],
        avoid: ['Raw cruciferous vegetables in excess (broccoli, cauliflower, cabbage)', 'Soy products (can interfere with thyroid medication)', 'Gluten (if sensitive)', 'Highly processed foods', 'Excessive sugar', 'Alcohol'],
        tips: [
            'Take thyroid medication on an empty stomach, 30-60 min before breakfast.',
            'Selenium and zinc are critical for thyroid hormone conversion.',
            'Cooking cruciferous vegetables reduces their goitrogenic effect — you can eat them cooked.',
            'Get regular thyroid function tests (TSH, T3, T4) every 6-12 months.',
            'Manage stress — cortisol can suppress thyroid function.'
        ]
    }
];


// ============================================
// Render Cards
// ============================================

function renderGymCards() {
    const grid = document.getElementById('gym-grid');
    grid.innerHTML = gymPlans.map(plan => `
        <div class="wellness-card" onclick="showWellnessModal('gym', '${plan.id}')">
            <div class="wellness-card-header">
                <div class="wellness-card-icon ${plan.iconBg}">${plan.icon}</div>
                <div>
                    <h3 class="wellness-card-title">${plan.title}</h3>
                    <p class="wellness-card-subtitle">${plan.subtitle}</p>
                </div>
            </div>
            <div class="wellness-card-body">
                <div style="display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
                    ${plan.tags.map(t => `<span class="wellness-tag wellness-tag-info">${t}</span>`).join('')}
                </div>
                <button class="wellness-expand-btn">View Full Plan →</button>
            </div>
        </div>
    `).join('');
}

function renderDietCards() {
    const grid = document.getElementById('diet-grid');
    grid.innerHTML = dietPlans.map(plan => `
        <div class="wellness-card" onclick="showWellnessModal('diet', '${plan.id}')">
            <div class="wellness-card-header">
                <div class="wellness-card-icon ${plan.iconBg}">${plan.icon}</div>
                <div>
                    <h3 class="wellness-card-title">${plan.title}</h3>
                    <p class="wellness-card-subtitle">${plan.subtitle}</p>
                </div>
            </div>
            <div class="wellness-card-body">
                <div class="macro-circles">
                    <div class="macro-circle">
                        <div class="macro-ring carb-ring"><span class="value">${plan.macros.carbs}</span></div>
                        <span class="macro-label">Carbs</span>
                    </div>
                    <div class="macro-circle">
                        <div class="macro-ring prot-ring"><span class="value">${plan.macros.protein}</span></div>
                        <span class="macro-label">Protein</span>
                    </div>
                    <div class="macro-circle">
                        <div class="macro-ring fat-ring"><span class="value">${plan.macros.fat}</span></div>
                        <span class="macro-label">Fat</span>
                    </div>
                </div>
                <div style="display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
                    ${plan.tags.map(t => `<span class="wellness-tag wellness-tag-good">${t}</span>`).join('')}
                </div>
                <button class="wellness-expand-btn">View Full Plan →</button>
            </div>
        </div>
    `).join('');
}

function renderHealthCards() {
    const grid = document.getElementById('health-grid');
    grid.innerHTML = healthConditions.map(cond => `
        <div class="wellness-card" onclick="showWellnessModal('health', '${cond.id}')">
            <div class="wellness-card-header">
                <div class="wellness-card-icon ${cond.iconBg}">${cond.icon}</div>
                <div>
                    <h3 class="wellness-card-title">${cond.title}</h3>
                    <p class="wellness-card-subtitle">${cond.subtitle}</p>
                </div>
            </div>
            <div class="wellness-card-body">
                <div style="display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
                    <span class="wellness-tag wellness-tag-good">✅ ${cond.recommended.length} Recommended Foods</span>
                    <span class="wellness-tag" style="background:rgba(239,68,68,0.06); color:var(--accent-rose); border-color:rgba(239,68,68,0.15);">❌ ${cond.avoid.length} Foods to Avoid</span>
                </div>
                <button class="wellness-expand-btn">View Details →</button>
            </div>
        </div>
    `).join('');
}


// ============================================
// Modal System
// ============================================

function showWellnessModal(type, id) {
    const modal = document.getElementById('wellness-modal');
    const content = document.getElementById('wellness-modal-content');
    let html = '';

    if (type === 'gym') {
        const plan = gymPlans.find(p => p.id === id);
        if (!plan) return;
        const scheduleHtml = Object.entries(plan.schedule).map(([day, activity]) => `
            <div class="schedule-day">
                <div class="schedule-day-name">${day}</div>
                <div class="schedule-day-activity">${activity}</div>
            </div>
        `).join('');
        const tipsHtml = plan.tips.map((tip, i) => `
            <li style="display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--border-light);">
                <span style="background:linear-gradient(135deg, var(--accent-primary), var(--accent-teal)); color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:800; flex-shrink:0;">${i+1}</span>
                <span style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${tip}</span>
            </li>
        `).join('');

        html = `
            <div style="padding:28px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div class="wellness-card-icon ${plan.iconBg}" style="font-size:1.8rem; width:52px; height:52px;">${plan.icon}</div>
                        <div>
                            <h2 style="font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:900; color:var(--text-primary);">${plan.title}</h2>
                            <p style="font-size:0.88rem; color:var(--text-secondary);">${plan.subtitle}</p>
                        </div>
                    </div>
                    <button onclick="closeWellnessModal()" class="modal-action-btn" style="background:var(--bg-muted); border:1px solid var(--border-light); color:var(--text-primary);">✕</button>
                </div>
                <h3 class="modal-section-title">Weekly Schedule</h3>
                <div class="schedule-grid" style="margin-bottom:24px;">${scheduleHtml}</div>
                <h3 class="modal-section-title">💡 Pro Tips</h3>
                <ul style="list-style:none; margin-bottom:8px;">${tipsHtml}</ul>
            </div>
        `;
    }

    else if (type === 'diet') {
        const plan = dietPlans.find(p => p.id === id);
        if (!plan) return;
        const mealsHtml = plan.meals.map(m => `
            <tr>
                <td style="font-weight:700; color:var(--accent-primary); white-space:nowrap; font-size:0.84rem;">${m.time}</td>
                <td style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${m.meal}</td>
            </tr>
        `).join('');
        const tipsHtml = plan.tips.map((tip, i) => `
            <li style="display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--border-light);">
                <span style="background:linear-gradient(135deg, var(--accent-emerald), var(--accent-teal)); color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:800; flex-shrink:0;">${i+1}</span>
                <span style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${tip}</span>
            </li>
        `).join('');

        html = `
            <div style="padding:28px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div class="wellness-card-icon ${plan.iconBg}" style="font-size:1.8rem; width:52px; height:52px;">${plan.icon}</div>
                        <div>
                            <h2 style="font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:900; color:var(--text-primary);">${plan.title}</h2>
                            <p style="font-size:0.88rem; color:var(--text-secondary);">${plan.subtitle}</p>
                        </div>
                    </div>
                    <button onclick="closeWellnessModal()" class="modal-action-btn" style="background:var(--bg-muted); border:1px solid var(--border-light); color:var(--text-primary);">✕</button>
                </div>
                <div style="display:flex; gap:24px; margin-bottom:24px; justify-content:center;">
                    <div class="macro-circle"><div class="macro-ring carb-ring" style="width:56px; height:56px;"><span class="value" style="font-size:0.85rem;">${plan.macros.carbs}</span></div><span class="macro-label">Carbs</span></div>
                    <div class="macro-circle"><div class="macro-ring prot-ring" style="width:56px; height:56px;"><span class="value" style="font-size:0.85rem;">${plan.macros.protein}</span></div><span class="macro-label">Protein</span></div>
                    <div class="macro-circle"><div class="macro-ring fat-ring" style="width:56px; height:56px;"><span class="value" style="font-size:0.85rem;">${plan.macros.fat}</span></div><span class="macro-label">Fat</span></div>
                </div>
                <h3 class="modal-section-title">🍽️ Daily Meal Plan</h3>
                <table class="meal-table" style="margin-bottom:24px;">
                    <thead><tr><th>Time</th><th>Meal</th></tr></thead>
                    <tbody>${mealsHtml}</tbody>
                </table>
                <h3 class="modal-section-title">💡 Nutrition Tips</h3>
                <ul style="list-style:none; margin-bottom:8px;">${tipsHtml}</ul>
            </div>
        `;
    }

    else if (type === 'health') {
        const cond = healthConditions.find(c => c.id === id);
        if (!cond) return;
        const recHtml = cond.recommended.map(f => `<li><span class="check">✅</span> ${f}</li>`).join('');
        const avoidHtml = cond.avoid.map(f => `<li><span class="cross">❌</span> ${f}</li>`).join('');
        const tipsHtml = cond.tips.map((tip, i) => `
            <li style="display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--border-light);">
                <span style="background:linear-gradient(135deg, var(--accent-sky), var(--accent-primary)); color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:800; flex-shrink:0;">${i+1}</span>
                <span style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${tip}</span>
            </li>
        `).join('');

        html = `
            <div style="padding:28px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div class="wellness-card-icon ${cond.iconBg}" style="font-size:1.8rem; width:52px; height:52px;">${cond.icon}</div>
                        <div>
                            <h2 style="font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:900; color:var(--text-primary);">${cond.title}</h2>
                            <p style="font-size:0.88rem; color:var(--text-secondary);">${cond.subtitle}</p>
                        </div>
                    </div>
                    <button onclick="closeWellnessModal()" class="modal-action-btn" style="background:var(--bg-muted); border:1px solid var(--border-light); color:var(--text-primary);">✕</button>
                </div>
                <h3 class="modal-section-title" style="border-left-color:var(--accent-emerald);">✅ Recommended Foods</h3>
                <ul class="foods-list" style="margin-bottom:24px;">${recHtml}</ul>
                <h3 class="modal-section-title" style="border-left-color:var(--accent-rose);">❌ Foods to Avoid</h3>
                <ul class="foods-list" style="margin-bottom:24px;">${avoidHtml}</ul>
                <h3 class="modal-section-title">💡 Expert Advice</h3>
                <ul style="list-style:none; margin-bottom:8px;">${tipsHtml}</ul>
            </div>
        `;
    }

    content.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeWellnessModal() {
    document.getElementById('wellness-modal').classList.add('hidden');
    document.body.style.overflow = '';
}


// ============================================
// Tab Switching
// ============================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.wellness-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Show/hide panels
    document.querySelectorAll('.wellness-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== 'panel-' + tabName);
    });
}

document.querySelectorAll('.wellness-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});


// ============================================
// BMI Calculator
// ============================================

const heightSlider = document.getElementById('height-slider');
const weightSlider = document.getElementById('weight-slider');
const ageSlider = document.getElementById('age-slider');
const heightDisplay = document.getElementById('height-display');
const weightDisplay = document.getElementById('weight-display');
const ageDisplay = document.getElementById('age-display');
let currentGender = 'male';

function updateDisplays() {
    if (heightDisplay) heightDisplay.textContent = heightSlider.value + ' cm';
    if (weightDisplay) weightDisplay.textContent = weightSlider.value + ' kg';
    if (ageDisplay) ageDisplay.textContent = ageSlider.value + ' years';
    calculateBMI();
}

function calculateBMI() {
    const height = parseFloat(heightSlider.value) / 100;
    const weight = parseFloat(weightSlider.value);
    const age = parseInt(ageSlider.value);
    const activity = parseFloat(document.getElementById('activity-select').value);

    // BMI
    const bmi = weight / (height * height);
    const bmiRounded = bmi.toFixed(1);

    // Category
    let category = '';
    let categoryColor = '';
    if (bmi < 18.5) { category = 'Underweight'; categoryColor = 'var(--accent-sky)'; }
    else if (bmi < 25) { category = 'Normal Weight'; categoryColor = 'var(--accent-emerald)'; }
    else if (bmi < 30) { category = 'Overweight'; categoryColor = 'var(--accent-amber)'; }
    else { category = 'Obese'; categoryColor = 'var(--accent-rose)'; }

    // BMR (Mifflin-St Jeor)
    let bmr;
    if (currentGender === 'male') {
        bmr = 10 * weight + 6.25 * (height * 100) - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * (height * 100) - 5 * age - 161;
    }

    const tdee = bmr * activity;
    const cut = tdee - 500;
    const bulk = tdee + 500;

    // Update DOM
    const bmiEl = document.getElementById('bmi-value');
    const catEl = document.getElementById('bmi-category');
    if (bmiEl) bmiEl.textContent = bmiRounded;
    if (catEl) { catEl.textContent = category; catEl.style.color = categoryColor; }

    const bmrEl = document.getElementById('bmr-val');
    const tdeeEl = document.getElementById('tdee-val');
    const cutEl = document.getElementById('cut-val');
    const bulkEl = document.getElementById('bulk-val');
    if (bmrEl) bmrEl.textContent = Math.round(bmr).toLocaleString();
    if (tdeeEl) tdeeEl.textContent = Math.round(tdee).toLocaleString();
    if (cutEl) cutEl.textContent = Math.round(cut).toLocaleString();
    if (bulkEl) bulkEl.textContent = Math.round(bulk).toLocaleString();

    // Gauge needle (BMI range 15-40 mapped to -90deg to 90deg)
    const needle = document.getElementById('gauge-needle');
    const gaugeFill = document.getElementById('gauge-fill');
    if (needle) {
        const clampedBmi = Math.min(40, Math.max(15, bmi));
        const angle = ((clampedBmi - 15) / 25) * 180 - 90;
        needle.style.transform = `rotate(${angle}deg)`;
    }
    if (gaugeFill) {
        gaugeFill.style.borderColor = categoryColor;
    }

    // Recommendation text
    const recEl = document.getElementById('bmi-recommendation');
    if (recEl) {
        if (bmi < 18.5) {
            recEl.innerHTML = 'Your BMI suggests you are <strong>underweight</strong>. Check our <a href="#" onclick="switchTab(\'diet\')">muscle building diet</a> to gain healthy weight!';
        } else if (bmi < 25) {
            recEl.innerHTML = 'Your BMI is in the <strong>healthy range</strong>. Check our <a href="#" onclick="switchTab(\'diet\')">balanced diet plans</a> to maintain your ideal weight!';
        } else if (bmi < 30) {
            recEl.innerHTML = 'Your BMI indicates you are <strong>overweight</strong>. Explore our <a href="#" onclick="switchTab(\'diet\')">weight loss diet</a> and <a href="#" onclick="switchTab(\'gym\')">cardio plans</a> to get back on track!';
        } else {
            recEl.innerHTML = 'Your BMI indicates <strong>obesity</strong>. We strongly recommend consulting a healthcare professional. Meanwhile, check our <a href="#" onclick="switchTab(\'diet\')">weight loss diet</a> for guidance.';
        }
    }
}

// Slider listeners
if (heightSlider) heightSlider.addEventListener('input', updateDisplays);
if (weightSlider) weightSlider.addEventListener('input', updateDisplays);
if (ageSlider) ageSlider.addEventListener('input', updateDisplays);

// Gender toggle
document.querySelectorAll('[data-gender]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-gender]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentGender = btn.dataset.gender;
        calculateBMI();
    });
});

// Activity select
const activitySelect = document.getElementById('activity-select');
if (activitySelect) activitySelect.addEventListener('change', calculateBMI);

// Modal overlay close
const wellnessOverlay = document.getElementById('wellness-modal-overlay');
if (wellnessOverlay) wellnessOverlay.addEventListener('click', closeWellnessModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWellnessModal();
});


// ============================================
// Initialize
// ============================================

renderGymCards();
renderDietCards();
renderHealthCards();
updateDisplays();