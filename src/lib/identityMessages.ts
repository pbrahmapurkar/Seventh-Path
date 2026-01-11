/**
 * Identity-Based Completion Messages
 * 
 * Instead of generic "Completed!" messages, we reinforce the user's identity
 * as the type of person who does these habits. This is based on James Clear's
 * research in "Atomic Habits" about identity-based habit formation.
 */

// Map habit emojis/keywords to identity categories
const habitIdentityMap: Record<string, { identity: string; messages: string[] }> = {
    // Health & Wellness
    '💧': {
        identity: 'healthy person',
        messages: [
            "You're someone who takes care of their body 💧",
            "Hydration complete! You're becoming healthier every day",
            "That's what healthy people do ✓",
        ],
    },
    '🧘': {
        identity: 'mindful person',
        messages: [
            "You showed up for your peace today 🧘",
            "That's 1 more day as someone who values calm",
            "Mindful people take moments like this ✓",
        ],
    },
    '💪': {
        identity: 'fit person',
        messages: [
            "You're becoming someone who moves their body 💪",
            "Athletes show up — you showed up today",
            "Another day proving you're a fit person ✓",
        ],
    },
    '🏃': {
        identity: 'runner',
        messages: [
            "You're a runner now 🏃",
            "Runners run. You ran today ✓",
            "Every step builds the runner in you",
        ],
    },
    '🚶': {
        identity: 'active person',
        messages: [
            "You're someone who moves daily 🚶",
            "Active people take walks. You did ✓",
            "Another day as someone who prioritizes movement",
        ],
    },

    // Learning & Growth
    '📚': {
        identity: 'reader',
        messages: [
            "You're a reader now 📚",
            "Readers read. You read today ✓",
            "Another chapter in your journey as a reader",
        ],
    },
    '📝': {
        identity: 'writer',
        messages: [
            "Writers write. You wrote today 📝",
            "You're becoming someone who reflects",
            "Another entry from someone who journals ✓",
        ],
    },
    '💡': {
        identity: 'learner',
        messages: [
            "You're a lifelong learner 💡",
            "Curious people learn daily. You did ✓",
            "Another day growing as a learner",
        ],
    },

    // Nutrition
    '🥗': {
        identity: 'healthy eater',
        messages: [
            "You're someone who eats well 🥗",
            "Healthy people make healthy choices ✓",
            "Another meal as someone who fuels their body right",
        ],
    },
    '🍎': {
        identity: 'healthy eater',
        messages: [
            "You're building healthy eating habits 🍎",
            "One more fruit closer to being who you want to be",
            "Healthy eaters make choices like this ✓",
        ],
    },

    // Rest & Recovery
    '💤': {
        identity: 'well-rested person',
        messages: [
            "You value your rest 💤",
            "People who thrive prioritize sleep ✓",
            "Another night of taking care of yourself",
        ],
    },
    '🕯️': {
        identity: 'calm person',
        messages: [
            "You're someone who creates calm 🕯️",
            "Peaceful people take moments like this ✓",
            "Another day prioritizing your peace",
        ],
    },

    // Connections
    '📞': {
        identity: 'connected person',
        messages: [
            "You're someone who maintains connections 📞",
            "Loving people reach out. You did ✓",
            "Another day being the caring person you are",
        ],
    },

    // Creativity
    '🎨': {
        identity: 'creative person',
        messages: [
            "You're a creative person 🎨",
            "Artists create. You created today ✓",
            "Another day expressing your creativity",
        ],
    },
    '🎵': {
        identity: 'musical person',
        messages: [
            "You're someone who makes music 🎵",
            "Musicians practice. You practiced ✓",
            "Another day nurturing your musical side",
        ],
    },

    // Focus & Productivity
    '🎯': {
        identity: 'focused person',
        messages: [
            "You're someone who shows up 🎯",
            "Focused people complete what they start ✓",
            "Another win for the determined you",
        ],
    },

    // Gratitude & Mindset
    '🌟': {
        identity: 'grateful person',
        messages: [
            "You practice gratitude 🌟",
            "Grateful people find reasons to be thankful ✓",
            "Another day seeing the good",
        ],
    },
};

// Default messages for habits without specific emoji mappings
const defaultMessages = [
    "You showed up today ✓",
    "That's consistency in action",
    "Another day of being someone who keeps commitments",
    "You're building the person you want to become",
    "Small wins add up. This counts ✓",
];

/**
 * Get an identity-based completion message for a habit
 * @param habitEmoji The emoji associated with the habit
 * @param habitName The name of the habit
 * @param streakDays Current streak count for context
 * @returns A personalized, identity-affirming message
 */
export function getIdentityMessage(
    habitEmoji: string,
    habitName: string,
    streakDays: number = 0
): string {
    const mapping = habitIdentityMap[habitEmoji];

    if (mapping) {
        // Get a random message from the category
        const messages = mapping.messages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Add streak context for longer streaks
        if (streakDays >= 7) {
            return `${randomMessage} (${streakDays} days as a ${mapping.identity})`;
        }
        return randomMessage;
    }

    // Fall back to default messages
    const randomDefault = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
    return randomDefault;
}

/**
 * Get a short toast-style message for quick feedback
 */
export function getQuickIdentityMessage(habitEmoji: string): string {
    const mapping = habitIdentityMap[habitEmoji];
    if (mapping) {
        return `✓ ${mapping.identity.charAt(0).toUpperCase() + mapping.identity.slice(1)} move`;
    }
    return "✓ Done";
}
