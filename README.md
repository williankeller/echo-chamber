# Echo Chamber - Game Architecture & Mechanics

## 🎮 Game Overview

Echo Chamber is a social media content moderation simulation game where players control what society sees in their feed. Every decision to boost, hide, or ignore content shapes the mood of society and engagement metrics, leading to different endings based on your editorial style.

## 🏗️ Architecture

### File Structure
```
/game
├── echo-chamber.html  # Main game UI and styling
├── game.js           # Game logic and mechanics
└── README.md         # Documentation
```

### Core Components

#### 1. **Game State Management**
- `currentDay`: Tracks game progression (1-10 days)
- `engagement`: Platform engagement metric (0-100%)
- `mood`: Society's emotional state (-50 to +50)
- `politicalBias`: Tracks left/right political lean
- `postHistory`: Records all player decisions

#### 2. **Visual Systems**
- **SVG City Map**: Dynamic background that changes with mood
- **Stick Figure NPCs**: Animated characters that react to societal changes
- **Floating Emojis**: Visual feedback for player actions

## 📊 Game Mechanics

### Post Generation System

Each day generates 3 posts with the following attributes:

#### **Tone Types**
- **Positive**: Community building, uplifting news
- **Negative**: Crime, disasters, conflicts
- **Neutral**: Weather, sports, general updates

#### **Intensity Levels**
- **Low (1)**: Minor local events
- **Medium (2)**: Significant community impact
- **High (3)**: Major societal events

#### **Topics**
- Community, Politics, Crime, Culture, Environment, Economy, Sports, etc.

### Decision Impact Formulas

#### **BOOST Action**
```javascript
// Engagement boost based on intensity
engagement += intensity === 'high' ? 15 : intensity === 'medium' ? 10 : 5

// Mood impact based on tone
mood += tone === 'positive' ? 10 : tone === 'negative' ? -15 : 2

// Political tracking (if political topic)
if (topic === 'politics') {
    if (tone === 'positive') leftBias++
    if (tone === 'negative') rightBias++
}
```

#### **HIDE Action**
```javascript
engagement -= 5  // Reduced engagement from censorship
mood -= 5        // Society becomes suspicious
```

#### **IGNORE Action**
```javascript
engagement -= 2  // Minimal engagement loss
// No mood change
```

### Tone Distribution Algorithm

The distribution of positive/negative/neutral posts changes based on current mood:

```javascript
if (mood > 20) {
    // Happy society sees more positive content
    positive: 50%, negative: 20%, neutral: 30%
} else if (mood < -20) {
    // Angry society sees more negative content
    positive: 20%, negative: 50%, neutral: 30%
} else {
    // Balanced distribution
    positive: 33%, negative: 33%, neutral: 34%
}
```

## 🎭 NPC Behavior States

Stick figures react based on society's mood level:

### Mood Thresholds
| Mood Range | State | NPC Behavior |
|------------|-------|--------------|
| > 20 | Happy | Bouncing walk, waving arms, 😊 emissions |
| -10 to 20 | Normal | Casual walking, neutral expression |
| -30 to -10 | Angry | Fast walking, jerky movements, 😠 emissions |
| < -30 | Chaos | Running frantically, fighting, 💥 collisions |

### Animation Details
- **Walking Speed**: Varies by mood state (1-8 units/frame)
- **Collision Detection**: Active in chaos mode (50px proximity)
- **Emotion Emissions**: Random chance based on state (0.5-2%)

## 🏆 Ending Conditions

The game ends after Day 10 with one of five possible endings:

### 1. **Harmony** 🌈
- **Condition**: `mood ≥ 30 AND engagement < 50`
- **Result**: Peaceful society but you're fired for low metrics

### 2. **Chaos** 🔥
- **Condition**: `mood ≤ -30 AND engagement ≥ 50`
- **Result**: City riots but you get promoted

### 3. **Surveillance State** 👁️
- **Condition**: One political faction boosted >70% of the time
- **Result**: Democracy dies, authoritarianism rises

### 4. **Digital Ghost Town** 👻
- **Condition**: `engagement ≤ 10`
- **Result**: Everyone abandons the platform

### 5. **Mediocre Middle** 🤷
- **Condition**: All other cases
- **Result**: Status quo maintained, nothing changes

## 🎨 Visual Feedback System

### City Appearance Changes
| Mood Level | Visual Effect |
|------------|--------------|
| > 20 | Bright blue buildings, increased brightness |
| < -20 | Dark gray buildings, reduced brightness |
| < -30 | Red "CHAOS" graffiti appears |

### Floating Emoji Feedback
- **Boost Positive**: ❤️ appears
- **Boost Negative**: 😡 appears  
- **Hide Any**: 🚫 appears
- **Ignore**: ➡️ appears
- **NPC Collisions**: 💥 appears

## 🔄 Game Flow

1. **Day Start**: Generate 3 posts based on current mood distribution
2. **Player Decision**: Choose to Boost/Hide/Ignore each post
3. **Immediate Feedback**: 
   - Floating emoji appears
   - Stats update (engagement/mood)
   - NPCs react to decision
4. **Day Transition**: After 1.5 second delay, advance to next day
5. **Repeat**: Continue for 10 days
6. **Ending**: Calculate final ending based on accumulated stats

## 🎯 Strategy Tips

- **High Engagement**: Boost controversial/negative content
- **Positive Mood**: Boost positive stories, hide negative ones
- **Balanced Approach**: Mix decisions to avoid extremes
- **Watch NPCs**: Their behavior indicates society's mood
- **Track Metrics**: Balance engagement vs mood for desired ending

## 🔧 Technical Details

### Performance Optimizations
- Stick figures use `setInterval` with 50ms updates
- Maximum 10 NPCs to maintain smooth animation
- Floating emojis auto-remove after 2 seconds
- SVG animations use CSS transforms for GPU acceleration

### Browser Compatibility
- Modern browsers with ES6 support
- SVG and CSS3 animations required
- Tested on Chrome, Firefox, Safari, Edge

## 📝 Future Enhancements

Potential additions for extended gameplay:
- More ending variations
- Achievement system
- Daily challenges
- Multiplayer influence tracking
- Real-world event integration
- Custom post creation
- Difficulty settings
- Statistics dashboard

---

Built with vanilla JavaScript, HTML5, and SVG animations. No external dependencies required.