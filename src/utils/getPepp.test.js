const { getPepp } = require('../utils/getPepp');

describe('getPepp utility', () => {
  const milestones = [3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  test('returns encouraging message for all milestone streaks', () => {
    for (const streak of milestones) {
      const msg = getPepp(streak);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  test('returns null for non-milestone streaks', () => {
    // Test a range of non-milestone values
    for (const streak of [0, 1, 2, 4, 6, 8, 9, 11, 14, 16, 21, 49, 51, 100]) {
      expect(getPepp(streak)).toBeNull();
    }
  });

  test('milestone messages contain Swedish or motivational words', () => {
    for (const streak of milestones) {
      const msg = getPepp(streak);
      expect(msg).toMatch(/rad|bra|grym|stark|raka|skill|jobbat|snyggt|imponerande|fokus|flow|framsteg|nivå|tänkt|rätt|exakt|snabbare|stolt|insats|rytm|driv|fullträff|hjärna|överraskar|high five|fett/i);
    }
  });
});
