/**
 * Simple fuzzy matching utility for string comparisons.
 * Returns a score between 0 and 1, where 1 is an exact match.
 */
export function calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const l1 = s1.toLowerCase();
    const l2 = s2.toLowerCase();

    // Exact match
    if (l1 === l2) return 1.0;

    // Whole word match priority
    const words = longer.toLowerCase().split(/[\s\-\—\_]+/);
    if (words.includes(shorter.toLowerCase())) {
        return 0.9; // High confidence for whole word match
    }

    // Starts with priority
    if (longer.toLowerCase().startsWith(shorter.toLowerCase())) {
        return 0.8;
    }

    // Generic includes match (fallback)
    if (longer.toLowerCase().includes(shorter.toLowerCase())) {
        return 0.4 + (shorter.length / longer.length) * 0.4;
    }

    // Levenshtein-like distance calculation (simplified)
    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1).toLowerCase() !== s2.charAt(j - 1).toLowerCase()) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }

    const distance = costs[s2.length];
    return (longer.length - distance) / longer.length;
}

export function findBestMatch(input: string, options: { label: string; value: string }[]): { option: { label: string; value: string } | null; score: number } {
    let bestMatch = null;
    let highestScore = 0;

    for (const opt of options) {
        // Check both label and value
        const labelScore = calculateSimilarity(input, opt.label);
        const valueScore = calculateSimilarity(input, opt.value);
        const score = Math.max(labelScore, valueScore);

        if (score > highestScore) {
            highestScore = score;
            bestMatch = opt;
        }
    }

    return { option: bestMatch, score: highestScore };
}
