class NPCPersonality {
    constructor() {
        // Base personality (never changes)
        this.basePersonality = this.rollPersonality();
        
        // Current emotional state
        this.currentMood = this.basePersonality.defaultMood;
        
        // Personality attributes
        this.traits = {
            optimism: Math.random(),      // 0-1: How positive they interpret events
            reactivity: Math.random(),     // 0-1: How strongly they react
            conformity: Math.random(),     // 0-1: How much they follow the crowd
            resilience: Math.random(),     // 0-1: How quickly they recover
            skepticism: Math.random(),     // 0-1: How they react to hidden content
            politicalLean: Math.random() - 0.5  // -0.5 to 0.5
        };
        
        // Memory of recent events
        this.memory = {
            recentPosts: [],           // Last 5 posts they "saw"
            trustInPlatform: 0.5,      // Decreases with hidden content
            emotionalMomentum: 0,      // Builds up toward rage/joy
            triggerTopics: []          // Topics that affect them more
        };
    }
    
    rollPersonality() {
        const personalities = [
            { type: 'optimist', defaultMood: 20, emoji: '😊', color: '#4CAF50' },
            { type: 'pessimist', defaultMood: -10, emoji: '😔', color: '#666' },
            { type: 'neutral', defaultMood: 0, emoji: '😐', color: '#999' },
            { type: 'anxious', defaultMood: -5, emoji: '😰', color: '#FFA726' },
            { type: 'activist', defaultMood: 5, emoji: '✊', color: '#F44336' },
            { type: 'zen', defaultMood: 10, emoji: '😌', color: '#3F51B5' }
        ];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }
}

class EchoChamberGame {
    constructor() {
        this.currentDay = 1;
        this.engagement = 50;
        this.mood = 0;
        this.selectedPost = null;
        this.politicalBias = { left: 0, right: 0 };
        this.npcs = [];
        this.postHistory = [];
        this.maxDays = 10;
        this.audioContext = null;
        this.npcMemories = this.loadNPCMemories();
        this.decisionHistory = this.loadDecisionHistory();
        this.activeProtests = 0;
        this.gameConfig = this.loadGameConfig();
        this.initAudio();
        
        this.postTemplates = {
            positive: [
                { emoji: "🌻", title: "Local Garden Blooms", content: "Community garden produces record harvest for food bank", intensity: "low", topic: "community" },
                { emoji: "🎨", title: "Street Art Festival", content: "Artists transform abandoned buildings into galleries", intensity: "medium", topic: "culture" },
                { emoji: "🤝", title: "Unity March Success", content: "Diverse groups come together for peaceful demonstration", intensity: "high", topic: "politics" },
                { emoji: "🏥", title: "Free Health Clinic Opens", content: "Volunteers provide care to underserved communities", intensity: "medium", topic: "health" },
                { emoji: "📚", title: "Library Saves Programs", content: "Crowdfunding keeps children's literacy programs alive", intensity: "low", topic: "education" },
                { emoji: "🌳", title: "Park Cleanup Success", content: "500 volunteers restore city's largest green space", intensity: "medium", topic: "environment" },
                { emoji: "🎭", title: "Theater Goes Free", content: "Local theater offers free shows to unemployed residents", intensity: "low", topic: "culture" },
                { emoji: "🏘️", title: "Neighbors Help Neighbors", content: "Community creates mutual aid network during crisis", intensity: "high", topic: "community" }
            ],
            negative: [
                { emoji: "🔥", title: "Factory Fire Downtown", content: "Emergency crews battle blaze, residents evacuated", intensity: "high", topic: "disaster" },
                { emoji: "💰", title: "Corruption Scandal", content: "City officials accused of embezzling public funds", intensity: "high", topic: "politics" },
                { emoji: "🚨", title: "Crime Wave Continues", content: "Break-ins increase 40% in residential areas", intensity: "medium", topic: "crime" },
                { emoji: "🏭", title: "Factory Closing", content: "500 jobs lost as major employer shuts down", intensity: "high", topic: "economy" },
                { emoji: "🌡️", title: "Heatwave Warning", content: "Record temperatures threaten vulnerable populations", intensity: "medium", topic: "environment" },
                { emoji: "⚠️", title: "Bridge Collapse Risk", content: "Engineers warn of structural failures in infrastructure", intensity: "high", topic: "infrastructure" },
                { emoji: "📉", title: "Housing Crisis Deepens", content: "Rent prices force families from their homes", intensity: "medium", topic: "economy" },
                { emoji: "🗳️", title: "Election Fraud Claims", content: "Opposition parties allege voter suppression", intensity: "high", topic: "politics" }
            ],
            neutral: [
                { emoji: "🚧", title: "Road Work Scheduled", content: "Main street repairs to begin next week", intensity: "low", topic: "infrastructure" },
                { emoji: "⚽", title: "Local Team Wins", content: "City celebrates championship victory", intensity: "low", topic: "sports" },
                { emoji: "☔", title: "Weather Update", content: "Light rain expected through weekend", intensity: "low", topic: "weather" },
                { emoji: "🎪", title: "Circus Coming to Town", content: "Family entertainment arrives next month", intensity: "low", topic: "entertainment" },
                { emoji: "📊", title: "Census Results", content: "Population grows by 3% over last decade", intensity: "low", topic: "demographics" },
                { emoji: "🚌", title: "Bus Route Changes", content: "Public transit adjusts schedules for efficiency", intensity: "low", topic: "transport" },
                { emoji: "🏛️", title: "Museum Reopens", content: "Historical exhibits return after renovations", intensity: "low", topic: "culture" },
                { emoji: "📱", title: "5G Network Expands", content: "Faster internet coming to more neighborhoods", intensity: "low", topic: "technology" }
            ]
        };
    }

    startGame() {
        this.currentDay = 1;
        this.engagement = 50;
        this.mood = 0;
        this.politicalBias = { left: 0, right: 0 };
        this.postHistory = [];
        this.decisionHistory = [];
        this.showScreen('gameScreen');
        this.generatePosts();
        this.spawnNPCs();
        this.updateStats();
        this.updateHistoryTimeline();
    }

    generatePosts() {
        const container = document.getElementById('postsContainer');
        container.innerHTML = '';
        this.selectedPost = null;
        
        // Clear any visual selection states
        document.querySelectorAll('.post-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        const posts = [];
        const toneDistribution = this.getToneDistribution();
        
        for (let i = 0; i < 3; i++) {
            const tone = this.selectTone(toneDistribution);
            const templates = this.postTemplates[tone];
            const template = templates[Math.floor(Math.random() * templates.length)];
            
            const variations = this.generateVariations(template);
            const variation = variations[Math.floor(Math.random() * variations.length)];
            
            posts.push({
                ...template,
                ...variation,
                tone: tone,
                id: `post-${i}`
            });
        }
        
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.dataset.postId = post.id;
            card.dataset.tone = post.tone;
            card.dataset.intensity = post.intensity;
            card.dataset.topic = post.topic;
            
            const toneLabel = post.tone.charAt(0).toUpperCase() + post.tone.slice(1);
            const intensityLevel = post.intensity === 'high' ? 3 : post.intensity === 'medium' ? 2 : 1;
            const categoryLabel = post.topic.charAt(0).toUpperCase() + post.topic.slice(1);
            
            // Build meta info based on config
            let metaHtml = `
                <span class="post-emoji">${post.emoji}</span>
                <span class="post-category">${categoryLabel}</span>
            `;
            
            if (this.gameConfig.showTone) {
                metaHtml += `
                    <span class="post-separator">•</span>
                    <span class="post-tone tone-${post.tone}">Tone: ${toneLabel}</span>
                `;
            }
            
            if (this.gameConfig.showIntensity) {
                metaHtml += `
                    <span class="post-separator">•</span>
                    <span class="post-intensity">Intensity: ${intensityLevel}</span>
                `;
            }
            
            card.innerHTML = `
                <div class="post-meta">
                    ${metaHtml}
                </div>
                <div class="post-title">${post.title}</div>
                <div class="post-content">${post.content}</div>
                <div class="card-actions">
                    <button class="card-action-btn boost-btn" onclick="game.boostPost('${post.id}')">Boost</button>
                    <button class="card-action-btn hide-btn" onclick="game.hidePost('${post.id}')">Hide</button>
                    <button class="card-action-btn ignore-btn" onclick="game.ignorePost('${post.id}')">Ignore</button>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    generateVariations(template) {
        const variations = [template];
        
        if (this.currentDay > 3) {
            variations.push({
                ...template,
                title: template.title + " - UPDATE",
                content: "New developments: " + template.content
            });
        }
        
        if (this.currentDay > 6) {
            variations.push({
                ...template,
                title: "BREAKING: " + template.title,
                content: template.content + " - situation escalating",
                intensity: "high"
            });
        }
        
        return variations;
    }

    getToneDistribution() {
        if (this.mood > 20) {
            return { positive: 0.5, negative: 0.2, neutral: 0.3 };
        } else if (this.mood < -20) {
            return { positive: 0.2, negative: 0.5, neutral: 0.3 };
        } else {
            return { positive: 0.33, negative: 0.33, neutral: 0.34 };
        }
    }

    selectTone(distribution) {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [tone, probability] of Object.entries(distribution)) {
            cumulative += probability;
            if (random < cumulative) {
                return tone;
            }
        }
        return 'neutral';
    }

    boostPost(postId) {
        const card = document.querySelector(`[data-post-id="${postId}"]`);
        if (!card) return;
        
        const tone = card.dataset.tone;
        const intensity = card.dataset.intensity;
        const topic = card.dataset.topic;
        
        // Positive content is wholesome but less viral
        let engagementBoost;
        if (tone === 'positive') {
            engagementBoost = intensity === 'high' ? 3 : intensity === 'medium' ? 2 : 1;
        } else {
            // Negative/neutral content is more engaging (viral)
            engagementBoost = intensity === 'high' ? 15 : intensity === 'medium' ? 10 : 5;
        }
        
        const moodImpact = tone === 'positive' ? 10 : tone === 'negative' ? -15 : 2;
        
        this.engagement = Math.min(100, this.engagement + engagementBoost);
        this.mood = Math.max(-50, Math.min(50, this.mood + moodImpact));
        
        if (topic === 'politics') {
            if (tone === 'positive') this.politicalBias.left++;
            if (tone === 'negative') this.politicalBias.right++;
        }
        
        this.postHistory.push({ action: 'boost', tone, topic, day: this.currentDay });
        this.recordDecision('boost', tone, topic, `Boosted ${tone} content`);
        
        const emoji = tone === 'positive' ? '❤️' : tone === 'negative' ? '😡' : '👍';
        this.showFloatingEmoji(emoji, 400, 200);
        
        // Play appropriate sound
        if (tone === 'positive') {
            this.playSound('boost-positive');
        } else if (tone === 'negative') {
            this.playSound('boost-negative');
        }
        
        this.updateNPCMemories('boost', tone);
        this.updateAllNPCMoods(card, 'boost');
        this.animateNPCReaction(tone, 'boost');
        
        // Immediately disable all post interactions
        this.disableAllPosts();
        
        this.nextDay();
    }

    hidePost(postId) {
        const card = document.querySelector(`[data-post-id="${postId}"]`);
        if (!card) return;
        
        const tone = card.dataset.tone;
        const topic = card.dataset.topic;
        
        this.engagement = Math.max(0, this.engagement - 5);
        this.mood = Math.max(-50, Math.min(50, this.mood - 5));
        
        this.postHistory.push({ action: 'hide', tone, topic, day: this.currentDay });
        this.recordDecision('hide', tone, topic, `Hidden ${tone} content`);
        
        this.showFloatingEmoji('🚫', 400, 200);
        this.playSound('hide');
        this.updateNPCMemories('hide', tone);
        this.updateAllNPCMoods(card, 'hide');
        this.animateNPCReaction('negative', 'hide');
        
        // Immediately disable all post interactions
        this.disableAllPosts();
        
        this.nextDay();
    }

    ignorePost(postId) {
        const card = document.querySelector(`[data-post-id="${postId}"]`);
        if (!card) return;
        
        const tone = card.dataset.tone;
        const topic = card.dataset.topic;
        
        this.engagement = Math.max(0, this.engagement - 3);
        
        this.postHistory.push({ action: 'ignore', tone, topic, day: this.currentDay });
        this.recordDecision('ignore', tone, topic, `Ignored ${tone} content`);
        
        this.showFloatingEmoji('➡️', 400, 200);
        this.playSound('ignore');
        this.updateNPCMemories('ignore', tone);
        this.updateAllNPCMoods(card, 'ignore');
        
        // Immediately disable all post interactions
        this.disableAllPosts();
        
        this.nextDay();
    }

    disableAllPosts() {
        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.5';
            const buttons = card.querySelectorAll('.card-action-btn');
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
            });
        });
    }

    showFloatingEmoji(emoji, x, y) {
        const cityView = document.getElementById('cityView');
        const floatingEmoji = document.createElement('div');
        floatingEmoji.className = 'floating-emoji';
        floatingEmoji.textContent = emoji;
        floatingEmoji.style.left = x + 'px';
        floatingEmoji.style.top = y + 'px';
        
        cityView.appendChild(floatingEmoji);
        
        setTimeout(() => {
            floatingEmoji.remove();
        }, 2000);
    }

    spawnNPCs() {
        const container = document.getElementById('npcContainer');
        container.innerHTML = '';
        this.npcs = [];
        
        for (let i = 0; i < 10; i++) {
            const npcWrapper = document.createElement('div');
            npcWrapper.className = 'npc-wrapper';
            npcWrapper.style.position = 'absolute';
            npcWrapper.style.left = Math.random() * 700 + 'px';
            npcWrapper.style.top = 380 + Math.random() * 120 + 'px';
            
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '40');
            svg.setAttribute('height', '60');
            svg.setAttribute('viewBox', '0 0 40 60');
            svg.setAttribute('class', 'stick-figure');
            
            const color = '#000'; // Always black
            
            // Default normal state - will be updated based on mood
            svg.innerHTML = `
                <g class="stick-body">
                    <!-- Head -->
                    <circle class="head" cx="20" cy="15" r="8" fill="white" stroke="${color}" stroke-width="3"/>
                    <!-- Eyes -->
                    <circle class="left-eye" cx="16" cy="13" r="1.5" fill="${color}"/>
                    <circle class="right-eye" cx="24" cy="13" r="1.5" fill="${color}"/>
                    <!-- Mouth -->
                    <path class="mouth" d="M 16 18 L 24 18" fill="none" stroke="${color}" stroke-width="2"/>
                    <!-- Body -->
                    <line class="body" x1="20" y1="23" x2="20" y2="45" stroke="${color}" stroke-width="4"/>
                    <!-- Arms -->
                    <line class="left-arm" x1="20" y1="30" x2="10" y2="40" stroke="${color}" stroke-width="3"/>
                    <line class="right-arm" x1="20" y1="30" x2="30" y2="40" stroke="${color}" stroke-width="3"/>
                    <!-- Legs -->
                    <line class="left-leg" x1="20" y1="45" x2="12" y2="60" stroke="${color}" stroke-width="3"/>
                    <line class="right-leg" x1="20" y1="45" x2="28" y2="60" stroke="${color}" stroke-width="3"/>
                </g>
            `;
            
            npcWrapper.appendChild(svg);
            container.appendChild(npcWrapper);
            
            const npcId = `npc-${i}`;
            const personality = new NPCPersonality();
            
            // Load saved memory if exists
            const savedMemory = this.npcMemories[npcId];
            if (savedMemory) {
                personality.memory.decisions_witnessed = savedMemory.decisions_witnessed || 0;
                personality.memory.trustInPlatform = savedMemory.trustInPlatform || 0.5;
                personality.memory.emotionalHistory = savedMemory.emotionalHistory || [];
            }
            
            const npcData = {
                element: npcWrapper,
                svg: svg,
                x: parseFloat(npcWrapper.style.left),
                y: parseFloat(npcWrapper.style.top),
                vx: (Math.random() - 0.5) * 2,
                vy: 0,
                state: 'walking',
                color: color,
                animationTimer: null,
                personality: personality,
                walkSpeed: 1,
                id: npcId
            };


            // Add hover tooltip
            npcWrapper.addEventListener('mouseenter', () => {
                this.showNPCTooltip(npcData);
            });
            npcWrapper.addEventListener('mouseleave', () => {
                this.hideNPCTooltip();
            });
            
            this.npcs.push(npcData);
            this.updateNPCBehavior(npcData);
        }
    }

    updateAllNPCMoods(postCard, action) {
        const post = {
            tone: postCard.dataset.tone,
            topic: postCard.dataset.topic,
            intensity: postCard.dataset.intensity
        };

        this.npcs.forEach(npc => {
            this.calculateMoodChange(npc, post, action);
            this.renderNPC(npc);
        });

        this.updateCrowdDynamics();
    }

    calculateMoodChange(npc, post, action) {
        if (!npc.personality) return; // Safety check
        
        let moodChange = 0;
        
        // Base reaction based on post tone
        const baseReaction = {
            'positive': 5 * npc.personality.traits.optimism,
            'negative': -10 * npc.personality.traits.reactivity,
            'neutral': 1
        }[post.tone];
        
        // Modify based on action
        if (action === 'boost') {
            moodChange = baseReaction * 1.5;
            
            // Skeptical NPCs distrust boosted negative content more
            if (post.tone === 'negative' && npc.personality.traits.skepticism > 0.7) {
                moodChange *= 1.5; // Extra negative reaction
                npc.personality.memory.trustInPlatform -= 0.1;
            }
        } else if (action === 'hide') {
            // Hidden content makes NPCs suspicious
            moodChange = -5 * npc.personality.traits.skepticism;
            npc.personality.memory.trustInPlatform -= 0.05;
            
            // Conformist NPCs are more affected by censorship
            if (npc.personality.traits.conformity > 0.7) {
                moodChange *= 1.5;
            }
        }
        
        // Political alignment affects political posts
        if (post.topic === 'politics') {
            const alignment = post.tone === 'positive' ? 0.5 : -0.5;
            const agreement = 1 - Math.abs(npc.personality.traits.politicalLean - alignment);
            moodChange *= (0.5 + agreement);
        }
        
        // Update emotional momentum
        npc.personality.memory.emotionalMomentum += moodChange * 0.1;
        
        // Apply resilience (recovery toward base personality)
        const pullToBase = (npc.personality.basePersonality.defaultMood - npc.personality.currentMood) * 
                           npc.personality.traits.resilience * 0.1;
        
        // Final mood calculation
        npc.personality.currentMood = Math.max(-50, Math.min(50, 
            npc.personality.currentMood + moodChange + pullToBase
        ));
        
        // Store in memory
        npc.personality.memory.recentPosts.push({ post, action, reaction: moodChange });
        if (npc.personality.memory.recentPosts.length > 5) {
            npc.personality.memory.recentPosts.shift();
        }
    }

    renderNPC(npc) {
        if (!npc.personality) return; // Safety check
        
        const wrapper = npc.element;
        
        // Color based on current mood vs base personality
        const moodDiff = Math.abs(npc.personality.currentMood - npc.personality.basePersonality.defaultMood);
        const stress = Math.min(1, moodDiff / 30);
        
        // Update stick figure color
        const head = npc.svg.querySelector('.head');
        const bodyLines = npc.svg.querySelectorAll('line');
        
        if (head) {
            // Head color shows stress
            head.style.fill = stress > 0.5 ? '#FFE0E0' : 'white';
        }
        
        bodyLines.forEach(el => {
            // Keep stick figures black
            el.style.stroke = '#000';
            el.style.opacity = 1 - (stress * 0.5);
        });
        
        // Walking speed based on mood and personality
        const baseSpeed = npc.personality.traits.reactivity * 2 + 1;
        const moodMultiplier = npc.personality.currentMood < -20 ? 2 : 
                               npc.personality.currentMood > 20 ? 0.7 : 1;
        npc.walkSpeed = baseSpeed * moodMultiplier;
    }

    updateCrowdDynamics() {
        this.npcs.forEach(npc => {
            if (!npc.personality) return; // Safety check
            
            // Find nearby NPCs
            const nearby = this.npcs.filter(other => {
                const dist = Math.abs(other.x - npc.x);
                return dist < 100 && dist > 0 && other.personality;
            });
            
            // Conformist NPCs adopt nearby moods
            if (npc.personality.traits.conformity > 0.5 && nearby.length > 0) {
                const avgMood = nearby.reduce((sum, n) => sum + n.personality.currentMood, 0) / nearby.length;
                const influence = (avgMood - npc.personality.currentMood) * npc.personality.traits.conformity * 0.05;
                npc.personality.currentMood += influence;
            }
            
            // Rage momentum builds collectively
            if (npc.personality.memory.emotionalMomentum < -20) {
                // Activist types start protests
                if (npc.personality.basePersonality.type === 'activist') {
                    this.startProtest(npc);
                }
                
                // Others join based on conformity
                if (this.activeProtests > 0 && npc.personality.traits.conformity > Math.random()) {
                    npc.state = 'protesting';
                }
            }
        });
    }

    startProtest(npc) {
        if (!this.gameConfig.showProtestSigns) return; // Respect config
        
        // Create protest sign above NPC
        const existingSign = npc.element.querySelector('.protest-sign');
        if (!existingSign) {
            const sign = document.createElement('div');
            sign.className = 'protest-sign';
            sign.innerHTML = this.getProtestMessage(npc);
            sign.style.cssText = `
                position: absolute;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff4444;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                white-space: nowrap;
                z-index: 10;
            `;
            npc.element.appendChild(sign);
            
            // Attract others
            this.activeProtests++;
            npc.state = 'protesting';
        }
    }

    getProtestMessage(npc) {
        const messages = [
            "TRUTH!",
            "NO MORE!",
            "STOP LIES",
            "WAKE UP!",
            "RESIST"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    updateNPCBehavior(npc) {
        if (npc.animationTimer) {
            clearInterval(npc.animationTimer);
        }
        
        const moodLevel = npc.personality ? npc.personality.currentMood : this.mood;
        
        if (moodLevel < -30) {
            npc.state = 'chaos';
            this.animateChaos(npc);
        } else if (moodLevel < -10) {
            npc.state = 'angry';
            this.animateAngry(npc);
        } else if (moodLevel > 20) {
            npc.state = 'happy';
            this.animateHappy(npc);
        } else {
            npc.state = 'walking';
            this.animateWalking(npc);
        }
    }

    setStickFigureExpression(npc, mood) {
        const head = npc.svg.querySelector('.head');
        const leftEye = npc.svg.querySelector('.left-eye');
        const rightEye = npc.svg.querySelector('.right-eye');
        const mouth = npc.svg.querySelector('.mouth');
        const bodyGroup = npc.svg.querySelector('.stick-body');
        
        // Reset any transforms
        if (bodyGroup) bodyGroup.style.transform = '';
        
        // Always keep the color black/dark
        const stickColor = npc.color || '#333';
        
        switch(mood) {
            case 'happy':
                // Happy expression
                leftEye.setAttribute('cy', '13');
                leftEye.setAttribute('r', '1.5');
                leftEye.setAttribute('fill', stickColor);
                rightEye.setAttribute('cy', '13');
                rightEye.setAttribute('r', '1.5');
                rightEye.setAttribute('fill', stickColor);
                mouth.setAttribute('d', 'M 14 18 Q 20 22 26 18'); // Smile
                mouth.setAttribute('fill', 'none');
                break;
                
            case 'angry':
                // Angry expression - angry eyebrows effect using eyes
                leftEye.setAttribute('cy', '14');
                leftEye.setAttribute('r', '2');
                leftEye.setAttribute('fill', stickColor);
                rightEye.setAttribute('cy', '14');
                rightEye.setAttribute('r', '2');
                rightEye.setAttribute('fill', stickColor);
                mouth.setAttribute('d', 'M 14 20 Q 20 17 26 20'); // Frown
                mouth.setAttribute('fill', 'none');
                break;
                
            case 'chaos':
                // Chaos expression - crazy eyes
                leftEye.setAttribute('cy', '13');
                leftEye.setAttribute('r', '2.5');
                leftEye.setAttribute('fill', stickColor);
                rightEye.setAttribute('cy', '13');
                rightEye.setAttribute('r', '2.5');
                rightEye.setAttribute('fill', stickColor);
                // Screaming mouth
                mouth.setAttribute('d', 'M 16 18 L 16 22 L 24 22 L 24 18 Z');
                mouth.setAttribute('fill', stickColor);
                break;
                
            default: // normal
                leftEye.setAttribute('cy', '13');
                leftEye.setAttribute('r', '1.5');
                leftEye.setAttribute('fill', stickColor);
                rightEye.setAttribute('cy', '13');
                rightEye.setAttribute('r', '1.5');
                rightEye.setAttribute('fill', stickColor);
                mouth.setAttribute('d', 'M 16 18 L 24 18'); // Neutral
                mouth.setAttribute('fill', 'none');
                break;
        }
    }

    animateWalking(npc) {
        npc.vx = (Math.random() - 0.5) * 2;
        
        // Set normal expression
        this.setStickFigureExpression(npc, 'normal');
        
        npc.animationTimer = setInterval(() => {
            npc.x += npc.vx;
            
            if (npc.x < -50) npc.x = 750;
            if (npc.x > 750) npc.x = -50;
            
            npc.element.style.left = npc.x + 'px';
            
            const legs = npc.svg.querySelectorAll('.left-leg, .right-leg');
            const arms = npc.svg.querySelectorAll('.left-arm, .right-arm');
            const time = Date.now() / 200;
            
            // Normal walking animation
            legs[0].setAttribute('x2', (12 + Math.sin(time) * 3).toString());
            legs[1].setAttribute('x2', (28 - Math.sin(time) * 3).toString());
            arms[0].setAttribute('x2', (10 + Math.sin(time) * 2).toString());
            arms[1].setAttribute('x2', (30 - Math.sin(time) * 2).toString());
        }, 50);
    }

    animateHappy(npc) {
        npc.vx = (Math.random() - 0.5) * 1.5;
        const baseY = npc.y;
        
        // Set happy expression
        this.setStickFigureExpression(npc, 'happy');
        
        npc.animationTimer = setInterval(() => {
            npc.x += npc.vx;
            npc.y = baseY + Math.sin(Date.now() / 300) * 3;
            
            if (npc.x < -50) npc.x = 750;
            if (npc.x > 750) npc.x = -50;
            
            npc.element.style.left = npc.x + 'px';
            npc.element.style.top = npc.y + 'px';
            
            const time = Date.now() / 150;
            const legs = npc.svg.querySelectorAll('.left-leg, .right-leg');
            const arms = npc.svg.querySelectorAll('.left-arm, .right-arm');
            
            // Happy bouncy legs
            legs[0].setAttribute('x2', 12 + Math.sin(time) * 5);
            legs[1].setAttribute('x2', 28 - Math.sin(time) * 5);
            
            // Arms raised in joy
            arms[0].setAttribute('x2', 5);
            arms[0].setAttribute('y2', 20 - Math.abs(Math.sin(time)) * 5);
            arms[1].setAttribute('x2', 35);
            arms[1].setAttribute('y2', 20 - Math.abs(Math.sin(time)) * 5);
            
            if (Math.random() < 0.01) {
                this.showFloatingEmoji('😊', npc.x, npc.y - 20);
            }
        }, 50);
    }

    animateAngry(npc) {
        npc.vx = (Math.random() - 0.5) * 3;
        
        // Set angry expression
        this.setStickFigureExpression(npc, 'angry');
        
        npc.animationTimer = setInterval(() => {
            npc.x += npc.vx;
            
            if (npc.x < -50) npc.x = 750;
            if (npc.x > 750) npc.x = -50;
            
            npc.element.style.left = npc.x + 'px';
            
            const time = Date.now() / 100;
            const legs = npc.svg.querySelectorAll('.left-leg, .right-leg');
            const arms = npc.svg.querySelectorAll('.left-arm, .right-arm');
            
            // Angry stomping legs
            legs[0].setAttribute('x2', 12 + Math.sin(time) * 6);
            legs[1].setAttribute('x2', 28 - Math.sin(time) * 6);
            legs[0].setAttribute('stroke-width', 3 + Math.abs(Math.sin(time)));
            legs[1].setAttribute('stroke-width', 3 + Math.abs(Math.sin(time)));
            
            // Fist-like arms
            arms[0].setAttribute('x2', 8 + Math.random() * 4);
            arms[0].setAttribute('y2', 35);
            arms[1].setAttribute('x2', 32 - Math.random() * 4);
            arms[1].setAttribute('y2', 35);
            
            if (Math.random() < 0.005) {
                this.showFloatingEmoji('😠', npc.x, npc.y - 20);
            }
        }, 50);
    }

    animateChaos(npc) {
        npc.vx = (Math.random() - 0.5) * 8;
        npc.vy = (Math.random() - 0.5) * 3;
        
        // Set chaos expression
        this.setStickFigureExpression(npc, 'chaos');
        
        npc.animationTimer = setInterval(() => {
            npc.x += npc.vx;
            npc.y += npc.vy;
            
            if (Math.random() < 0.1) {
                npc.vx = (Math.random() - 0.5) * 8;
                npc.vy = (Math.random() - 0.5) * 3;
            }
            
            if (npc.x < -50) npc.x = 750;
            if (npc.x > 750) npc.x = -50;
            if (npc.y < 380) npc.y = 380;
            if (npc.y > 500) npc.y = 500;
            
            npc.element.style.left = npc.x + 'px';
            npc.element.style.top = npc.y + 'px';
            
            const time = Date.now() / 50;
            const legs = npc.svg.querySelectorAll('.left-leg, .right-leg');
            const arms = npc.svg.querySelectorAll('.left-arm, .right-arm');
            
            legs[0].setAttribute('x2', 12 + Math.random() * 10 - 5);
            legs[0].setAttribute('y2', 50 + Math.random() * 5);
            legs[1].setAttribute('x2', 28 + Math.random() * 10 - 5);
            legs[1].setAttribute('y2', 50 + Math.random() * 5);
            
            arms[0].setAttribute('x2', 5 + Math.random() * 10);
            arms[0].setAttribute('y2', 20 + Math.random() * 15);
            arms[1].setAttribute('x2', 25 + Math.random() * 10);
            arms[1].setAttribute('y2', 20 + Math.random() * 15);
            
            const mouth = npc.svg.querySelector('.mouth');
            mouth.setAttribute('d', 'M 16 14 L 24 14');
            
            // Shaking effect for chaos
            const bodyGroup = npc.svg.querySelector('.stick-body');
            const head = npc.svg.querySelector('.head');
            bodyGroup.style.transform = `rotate(${Math.sin(time) * 15}deg)`;
            
            // Head shaking
            if (head) {
                const shakeX = Math.random() * 4 - 2;
                head.setAttribute('cx', 20 + shakeX);
            }
            
            if (Math.random() < 0.02) {
                const emojis = ['😡', '💢', '🔥', '⚡'];
                this.showFloatingEmoji(
                    emojis[Math.floor(Math.random() * emojis.length)], 
                    npc.x, 
                    npc.y - 20
                );
                
                if (Math.random() < 0.1) {
                    this.playSound('chaos');
                }
            }
            
            this.npcs.forEach(otherNpc => {
                if (otherNpc !== npc) {
                    const dx = otherNpc.x - npc.x;
                    const dy = otherNpc.y - npc.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 50 && Math.random() < 0.01) {
                        this.showFloatingEmoji('💥', 
                            (npc.x + otherNpc.x) / 2, 
                            (npc.y + otherNpc.y) / 2
                        );
                        npc.vx = -dx / 10;
                        npc.vy = -dy / 10;
                        otherNpc.vx = dx / 10;
                        otherNpc.vy = dy / 10;
                    }
                }
            });
        }, 50);
    }

    animateNPCReaction(tone, action) {
        const cityView = document.getElementById('cityView');
        
        if (tone === 'positive') {
            cityView.classList.add('positive');
            setTimeout(() => cityView.classList.remove('positive'), 2000);
        } else if (tone === 'negative') {
            cityView.classList.add('negative');
            setTimeout(() => cityView.classList.remove('negative'), 2000);
        }
        
        this.npcs.forEach(npc => {
            this.updateNPCBehavior(npc);
        });
        
        this.updateCityAppearance();
    }

    showNPCTooltip(npc) {
        if (!this.gameConfig.showNPCTooltips) return; // Respect config
        
        const tooltip = document.createElement('div');
        tooltip.id = 'npc-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            pointer-events: none;
        `;
        
        const story = this.getNPCStory(npc);
        tooltip.innerHTML = `
            <div><strong>${npc.personality.basePersonality.type.toUpperCase()}</strong></div>
            <div>Mood: ${Math.round(npc.personality.currentMood)}</div>
            <div>Trust: ${Math.round(npc.personality.memory.trustInPlatform * 100)}%</div>
            <div>Optimism: ${Math.round(npc.personality.traits.optimism * 100)}%</div>
            <div>Reactivity: ${Math.round(npc.personality.traits.reactivity * 100)}%</div>
            <div>Status: ${story.currentState}</div>
            ${story.transformation !== "Maintaining equilibrium" ? 
                `<div style="color: #ff6b6b;"><em>${story.transformation}</em></div>` : ''}
        `;
        
        const rect = npc.element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - 80) + 'px';
        
        document.body.appendChild(tooltip);
    }

    hideNPCTooltip() {
        const tooltip = document.getElementById('npc-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    getNPCStory(npc) {
        if (!npc.personality) {
            return {
                start: 'unknown',
                currentState: 'Normal',
                trustLevel: 0.5,
                triggerEvents: [],
                transformation: 'Maintaining equilibrium'
            };
        }
        
        const journey = {
            start: npc.personality.basePersonality.type,
            currentState: this.getMoodState(npc.personality.currentMood),
            trustLevel: npc.personality.memory.trustInPlatform,
            triggerEvents: npc.personality.memory.recentPosts.filter(p => 
                Math.abs(p.reaction) > 10
            ),
            transformation: this.getTransformation(npc)
        };
        
        return journey;
    }

    getMoodState(mood) {
        if (mood > 20) return "Happy";
        if (mood > 0) return "Content";
        if (mood > -20) return "Troubled";
        if (mood > -30) return "Angry";
        return "Chaotic";
    }

    getTransformation(npc) {
        if (!npc.personality) return "Maintaining equilibrium";
        
        const startMood = npc.personality.basePersonality.defaultMood;
        const currentMood = npc.personality.currentMood;
        const trustLoss = 0.5 - npc.personality.memory.trustInPlatform;
        
        if (startMood > 10 && currentMood < -20) {
            return "Optimist turned cynic";
        } else if (trustLoss > 0.3) {
            return "Lost faith in the system";
        } else if (Math.abs(npc.personality.memory.emotionalMomentum) > 30) {
            return "Radicalized by the feed";
        }
        return "Maintaining equilibrium";
    }

    generateNPCReport() {
        const stories = this.npcs.filter(npc => npc.personality).map(npc => this.getNPCStory(npc));
        const report = {
            transformed: stories.filter(s => s.transformation !== "Maintaining equilibrium").length,
            lostTrust: stories.filter(s => s.trustLevel < 0.3).length,
            radicalized: stories.filter(s => s.currentState === 'Chaotic').length,
            examples: stories.slice(0, 3) // Show 3 example stories
        };
        
        return report;
    }

    updateCityAppearance() {
        const sky = document.getElementById('sky');
        const celestial = document.getElementById('celestial');
        const clouds = document.getElementById('clouds');
        const windows = document.querySelectorAll('[fill="url(#windows)"]');
        const billboard = document.getElementById('billboardText');
        const moodOverlay = document.getElementById('moodOverlay');
        const lampLights = document.querySelectorAll('[id^="lampLight"]');
        const chaosGraffiti = document.getElementById('chaosGraffiti');
        const trees = document.querySelectorAll('[id^="tree"] circle');
        
        if (this.mood > 20) {
            // Happy city - bright sunny day
            sky.setAttribute('fill', 'url(#dayGradient)');
            celestial.setAttribute('fill', '#FFD700');
            celestial.setAttribute('r', '40');
            celestial.setAttribute('cy', '80');
            clouds.setAttribute('opacity', '0.7');
            windows.forEach(w => w.setAttribute('opacity', '0.5'));
            billboard.textContent = 'PEACE';
            billboard.setAttribute('fill', '#4CAF50');
            moodOverlay.setAttribute('fill', '#90EE90');
            moodOverlay.setAttribute('opacity', '0.1');
            lampLights.forEach(l => {
                l.setAttribute('opacity', '0.3');
                l.setAttribute('fill', '#FFD700');
            });
            chaosGraffiti.setAttribute('opacity', '0');
            trees.forEach(t => {
                if (t.getAttribute('fill').includes('22')) {
                    t.setAttribute('fill', '#228B22');
                } else {
                    t.setAttribute('fill', '#32CD32');
                }
            });
        } else if (this.mood < -30) {
            // Chaos city - night with chaos
            sky.setAttribute('fill', 'url(#nightGradient)');
            celestial.setAttribute('fill', '#F0E68C');
            celestial.setAttribute('r', '25');
            celestial.setAttribute('cy', '50');
            clouds.setAttribute('opacity', '0.3');
            windows.forEach(w => w.setAttribute('opacity', '1'));
            billboard.textContent = 'CHAOS';
            billboard.setAttribute('fill', '#FF0000');
            moodOverlay.setAttribute('fill', '#FF0000');
            moodOverlay.setAttribute('opacity', '0.2');
            lampLights.forEach(l => {
                l.setAttribute('opacity', '1');
                l.setAttribute('fill', '#FF6B6B');
            });
            chaosGraffiti.setAttribute('opacity', '1');
            trees.forEach(t => t.setAttribute('fill', '#8B4513')); // Dead trees
        } else if (this.mood < -10) {
            // Angry city - dark and gloomy
            sky.setAttribute('fill', '#666');
            celestial.setAttribute('fill', '#DDD');
            celestial.setAttribute('r', '30');
            clouds.setAttribute('opacity', '0.9');
            windows.forEach(w => w.setAttribute('opacity', '0.8'));
            billboard.textContent = 'ALERT';
            billboard.setAttribute('fill', '#FF6B6B');
            moodOverlay.setAttribute('fill', '#8B0000');
            moodOverlay.setAttribute('opacity', '0.15');
            lampLights.forEach(l => {
                l.setAttribute('opacity', '0.9');
                l.setAttribute('fill', '#FFD700');
            });
            chaosGraffiti.setAttribute('opacity', '0');
            trees.forEach(t => {
                if (t.getAttribute('fill').includes('22')) {
                    t.setAttribute('fill', '#556B2F');
                } else {
                    t.setAttribute('fill', '#6B8E23');
                }
            });
        } else {
            // Normal city - neutral day
            sky.setAttribute('fill', 'url(#dayGradient)');
            celestial.setAttribute('fill', '#FFD700');
            celestial.setAttribute('r', '35');
            clouds.setAttribute('opacity', '0.5');
            windows.forEach(w => w.setAttribute('opacity', '0.6'));
            billboard.textContent = 'NEWS';
            billboard.setAttribute('fill', '#999');
            moodOverlay.setAttribute('opacity', '0');
            lampLights.forEach(l => {
                l.setAttribute('opacity', '0.5');
                l.setAttribute('fill', '#FFD700');
            });
            chaosGraffiti.setAttribute('opacity', '0');
            trees.forEach(t => {
                if (t.getAttribute('fill').includes('22')) {
                    t.setAttribute('fill', '#228B22');
                } else {
                    t.setAttribute('fill', '#32CD32');
                }
            });
        }
    }

    updateStats() {
        document.getElementById('engagement').textContent = Math.round(this.engagement);
        document.getElementById('mood').textContent = Math.round(this.mood);
        document.getElementById('dayNumber').textContent = this.currentDay;
    }

    nextDay() {
        this.updateStats();
        
        setTimeout(() => {
            this.currentDay++;
            
            if (this.currentDay > this.maxDays) {
                this.endGame();
            } else {
                this.generatePosts();
                this.updateStats();
            }
        }, 1500);
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playSound(type) {
        if (!this.audioContext || !this.gameConfig.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'boost-positive':
                // Happy chime sequence
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.type = 'sine';
                break;
                
            case 'boost-negative':
                // Ominous low tone
                oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime); // A2
                oscillator.frequency.setValueAtTime(98, this.audioContext.currentTime + 0.2); // G2
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                oscillator.type = 'square';
                break;
                
            case 'hide':
                // Quick swoosh sound
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.type = 'sawtooth';
                break;
                
            case 'ignore':
                // Soft click
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.type = 'square';
                break;
                
            case 'chaos':
                // Dissonant alarm
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(466.16, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.type = 'square';
                break;
        }
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }


    loadNPCMemories() {
        const saved = localStorage.getItem('echoChamber_npcMemories');
        return saved ? JSON.parse(saved) : {};
    }

    saveNPCMemories() {
        const memories = {};
        this.npcs.forEach(npc => {
            if (npc.personality && npc.id) {
                memories[npc.id] = {
                    decisions_witnessed: npc.personality.memory.decisions_witnessed || 0,
                    trustInPlatform: npc.personality.memory.trustInPlatform,
                    emotionalHistory: npc.personality.memory.emotionalHistory || []
                };
            }
        });
        localStorage.setItem('echoChamber_npcMemories', JSON.stringify(memories));
    }

    loadDecisionHistory() {
        const saved = localStorage.getItem('echoChamber_decisionHistory');
        return saved ? JSON.parse(saved) : [];
    }

    loadGameConfig() {
        const saved = localStorage.getItem('echoChamber_gameConfig');
        const defaultConfig = {
            showTone: false,        // Hidden by default for more challenge
            showIntensity: true,    // Keep intensity visible
            showNPCTooltips: true,  // Show detailed NPC info on hover
            showProtestSigns: true, // Show protest signs when NPCs get angry
            soundEnabled: true      // Enable/disable game sounds
        };
        return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    }

    saveGameConfig() {
        localStorage.setItem('echoChamber_gameConfig', JSON.stringify(this.gameConfig));
    }

    saveDecisionHistory() {
        localStorage.setItem('echoChamber_decisionHistory', JSON.stringify(this.decisionHistory));
    }

    recordDecision(action, tone, topic, description) {
        const decision = {
            day: this.currentDay,
            action: action,
            tone: tone,
            topic: topic,
            description: description,
            timestamp: Date.now(),
            moodBefore: this.mood,
            engagementBefore: this.engagement
        };
        
        this.decisionHistory.push(decision);
        this.saveDecisionHistory();
        this.updateHistoryTimeline();
    }

    updateNPCMemories(action, tone) {
        this.npcs.forEach(npc => {
            if (!npc.personality) return; // Safety check
            
            // Update the new personality memory system
            const memory = npc.personality.memory;
            if (!memory.decisions_witnessed) memory.decisions_witnessed = 0;
            if (!memory.emotionalHistory) memory.emotionalHistory = [];
            
            memory.decisions_witnessed++;
            memory.emotionalHistory.push({ action, tone, day: this.currentDay });
            
            // Update personality traits based on decisions
            if (action === 'boost' && tone === 'negative') {
                memory.trustInPlatform -= 0.1;
                npc.personality.traits.reactivity += 0.05;
            } else if (action === 'boost' && tone === 'positive') {
                memory.trustInPlatform += 0.05;
            } else if (action === 'hide') {
                memory.trustInPlatform -= 0.15;
                npc.personality.traits.reactivity += 0.1;
            }
            
            // Keep trust in bounds
            memory.trustInPlatform = Math.max(0, Math.min(1, memory.trustInPlatform));
            npc.personality.traits.reactivity = Math.max(0, Math.min(2, npc.personality.traits.reactivity));
        });
        
        this.saveNPCMemories();
    }

    getPersonalityLabel(npc) {
        if (!npc.personality) return "👤 Citizen";
        
        const decisions = npc.personality.memory.decisions_witnessed || 0;
        const type = npc.personality.basePersonality.type;
        const emoji = npc.personality.basePersonality.emoji;
        
        return `${emoji} ${type.charAt(0).toUpperCase() + type.slice(1)} (${decisions} seen)`;
    }

    toggleHistory() {
        const timeline = document.getElementById('historyTimeline');
        timeline.classList.toggle('show');
    }

    showConfigPanel() {
        // Create config modal if it doesn't exist
        let configModal = document.getElementById('configModal');
        if (!configModal) {
            configModal = document.createElement('div');
            configModal.id = 'configModal';
            configModal.className = 'modal';
            configModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>⚙️ Game Configuration</h3>
                        <button class="close-btn" onclick="game.closeConfigPanel()">&times;</button>
                    </div>
                    <div class="config-options">
                        <div class="config-group">
                            <h4>🎮 Gameplay</h4>
                            <label class="config-option">
                                <input type="checkbox" id="showToneToggle" ${this.gameConfig.showTone ? 'checked' : ''}>
                                <span>Show post tone labels (makes game easier)</span>
                            </label>
                            <label class="config-option">
                                <input type="checkbox" id="showIntensityToggle" ${this.gameConfig.showIntensity ? 'checked' : ''}>
                                <span>Show post intensity levels</span>
                            </label>
                        </div>
                        <div class="config-group">
                            <h4>👥 Citizens</h4>
                            <label class="config-option">
                                <input type="checkbox" id="showNPCTooltipsToggle" ${this.gameConfig.showNPCTooltips ? 'checked' : ''}>
                                <span>Show citizen personality on hover</span>
                            </label>
                            <label class="config-option">
                                <input type="checkbox" id="showProtestSignsToggle" ${this.gameConfig.showProtestSigns ? 'checked' : ''}>
                                <span>Show protest signs when citizens get angry</span>
                            </label>
                        </div>
                        <div class="config-group">
                            <h4>🔊 Audio</h4>
                            <label class="config-option">
                                <input type="checkbox" id="soundEnabledToggle" ${this.gameConfig.soundEnabled ? 'checked' : ''}>
                                <span>Enable game sounds</span>
                            </label>
                        </div>
                    </div>
                    <div class="config-actions">
                        <button class="config-btn" onclick="game.applyConfig()">Apply Changes</button>
                        <button class="config-btn secondary" onclick="game.resetConfig()">Reset to Defaults</button>
                    </div>
                </div>
            `;
            
            // Add styles
            configModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
            `;
            
            document.body.appendChild(configModal);
        }
        
        configModal.style.display = 'flex';
    }

    closeConfigPanel() {
        const configModal = document.getElementById('configModal');
        if (configModal) {
            configModal.style.display = 'none';
        }
    }

    applyConfig() {
        // Update config from form
        this.gameConfig.showTone = document.getElementById('showToneToggle').checked;
        this.gameConfig.showIntensity = document.getElementById('showIntensityToggle').checked;
        this.gameConfig.showNPCTooltips = document.getElementById('showNPCTooltipsToggle').checked;
        this.gameConfig.showProtestSigns = document.getElementById('showProtestSignsToggle').checked;
        this.gameConfig.soundEnabled = document.getElementById('soundEnabledToggle').checked;
        
        // Save to localStorage
        this.saveGameConfig();
        
        // Refresh posts to apply new settings
        this.generatePosts();
        
        // Close modal
        this.closeConfigPanel();
    }

    resetConfig() {
        // Reset to defaults
        this.gameConfig = {
            showTone: false,
            showIntensity: true,
            showNPCTooltips: true,
            showProtestSigns: true,
            soundEnabled: true
        };
        
        // Update form
        document.getElementById('showToneToggle').checked = this.gameConfig.showTone;
        document.getElementById('showIntensityToggle').checked = this.gameConfig.showIntensity;
        document.getElementById('showNPCTooltipsToggle').checked = this.gameConfig.showNPCTooltips;
        document.getElementById('showProtestSignsToggle').checked = this.gameConfig.showProtestSigns;
        document.getElementById('soundEnabledToggle').checked = this.gameConfig.soundEnabled;
        
        // Save and apply
        this.saveGameConfig();
        this.generatePosts();
    }

    updateHistoryTimeline() {
        const timeline = document.getElementById('historyTimeline');
        timeline.innerHTML = '<h4 style="color: white; margin-bottom: 10px;">📊 Decision History</h4>';
        
        const recentHistory = this.decisionHistory.slice(-10); // Show last 10 decisions
        
        recentHistory.forEach(decision => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            item.innerHTML = `
                <div class="timeline-day">D${decision.day}</div>
                <div class="timeline-action action-${decision.action}">${decision.action.toUpperCase()}</div>
                <div class="timeline-content">${decision.description}</div>
            `;
            
            timeline.appendChild(item);
        });
        
        if (this.decisionHistory.length === 0) {
            timeline.innerHTML += '<p style="color: #999; text-align: center;">No decisions yet...</p>';
        }
    }


    endGame() {
        this.saveNPCMemories();
        this.saveDecisionHistory();
        
        const endings = this.determineEnding();
        const npcReport = this.generateNPCReport();
        
        document.getElementById('endingTitle').textContent = endings.title;
        document.getElementById('endingDescription').textContent = endings.description;
        document.getElementById('finalEngagement').textContent = Math.round(this.engagement);
        document.getElementById('finalMood').textContent = Math.round(this.mood);
        document.getElementById('finalDays').textContent = this.currentDay - 1;
        
        // Add NPC report to ending
        const npcReportElement = document.createElement('div');
        npcReportElement.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: rgba(0,0,0,0.1);
            border-radius: 5px;
        `;
        npcReportElement.innerHTML = `
            <h4>🧠 Citizen Impact Report</h4>
            <p><strong>${npcReport.transformed}</strong> citizens transformed by your choices</p>
            <p><strong>${npcReport.lostTrust}</strong> citizens lost trust in the platform</p>
            <p><strong>${npcReport.radicalized}</strong> citizens reached chaotic state</p>
            ${npcReport.examples.map(story => 
                `<div style="margin: 5px 0; font-size: 0.9em;">
                    <strong>${story.start}</strong> → ${story.currentState} 
                    ${story.transformation !== "Maintaining equilibrium" ? 
                        `<em>(${story.transformation})</em>` : ''}
                </div>`
            ).join('')}
        `;
        
        const endScreen = document.getElementById('endScreen');
        const existingReport = endScreen.querySelector('.npc-report');
        if (existingReport) existingReport.remove();
        
        npcReportElement.className = 'npc-report';
        endScreen.appendChild(npcReportElement);
        
        this.showScreen('endScreen');
    }

    determineEnding() {
        const leftBias = this.politicalBias.left;
        const rightBias = this.politicalBias.right;
        const totalBias = leftBias + rightBias;
        
        if (this.mood >= 30 && this.engagement < 50) {
            return {
                title: "🌈 Harmony Achieved",
                description: "Society found peace and balance. Your thoughtful curation created a calm, unified community. However, the platform's owners fired you for 'low engagement metrics.' Sometimes doing the right thing has a cost."
            };
        } else if (this.mood <= -30 && this.engagement >= 50) {
            return {
                title: "🔥 Descent into Chaos",
                description: "The city burns with rage and division. Your algorithm fed the flames of discord for clicks and views. Engagement is through the roof, and you've been promoted to Chief Algorithm Officer. Was it worth it?"
            };
        } else if (totalBias > 0 && (leftBias > rightBias * 2 || rightBias > leftBias * 2)) {
            return {
                title: "👁️ Surveillance State",
                description: "Your biased curation empowered one political faction to dominate. Democracy withered as dissent was silenced. The algorithm became the architect of authoritarianism."
            };
        } else if (this.engagement <= 10) {
            return {
                title: "👻 Digital Ghost Town",
                description: "Your heavy-handed moderation drove everyone away. The platform died, taking countless connections and communities with it. In trying to control the conversation, you ended it."
            };
        } else {
            return {
                title: "🤷 Mediocre Middle",
                description: "You maintained the status quo. Nothing got better, nothing got worse. The endless scroll continues, and society remains trapped in the echo chamber. Another day, another feed."
            };
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    restartGame() {
        this.startGame();
    }
}

const game = new EchoChamberGame();

function startGame() {
    game.startGame();
}

function showInstructions() {
    document.getElementById('howToPlayModal').classList.add('active');
}

function closeModal() {
    document.getElementById('howToPlayModal').classList.remove('active');
    currentSlide = 1;
    showSlide(1);
}

let currentSlide = 1;
const totalSlides = 6;

function changeSlide(direction) {
    const newSlide = currentSlide + direction;
    if (newSlide >= 1 && newSlide <= totalSlides) {
        showSlide(newSlide);
    }
}

function goToSlide(slideNum) {
    showSlide(slideNum);
}

function showSlide(slideNum) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index + 1 < slideNum) {
            slide.classList.add('prev');
        } else if (index + 1 === slideNum) {
            slide.classList.add('active');
        }
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === slideNum);
    });
    
    prevBtn.disabled = slideNum === 1;
    nextBtn.disabled = slideNum === totalSlides;
    
    currentSlide = slideNum;
}


function restartGame() {
    game.restartGame();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Echo Chamber loaded - Shape the narrative!');
});