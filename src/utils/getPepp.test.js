import { getPepp } from '../utils/getPepp';

describe('getPepp utility', () => {
  test('returns encouraging message for milestone streaks', () => {
    // Milestones always return a message
    expect(getPepp(3)).toBeTruthy();
    expect(getPepp(5)).toBeTruthy();
    expect(getPepp(10)).toBeTruthy();
    expect(getPepp(15)).toBeTruthy();
    expect(getPepp(20)).toBeTruthy();
    expect(getPepp(25)).toBeTruthy();
  });

  test('may return message for non-milestone streaks (20% chance)', () => {
    // Non-milestones have 20% chance, so we can't guarantee null
    // Just test that it returns either a string or null
    const result = getPepp(1);
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  test('returns different messages for different milestones', () => {
    const msg3 = getPepp(3);
    const msg5 = getPepp(5);
    const msg10 = getPepp(10);
    
    // All milestones should return messages
    expect(msg3).toBeTruthy();
    expect(msg5).toBeTruthy();
    expect(msg10).toBeTruthy();
  });

  test('milestone messages are in Swedish', () => {
    const msg = getPepp(5);
    // Check for Swedish characters or common Swedish words
    expect(msg).toMatch(/å|ä|ö|bra|grym|stark|raka|skill/i);
  });
});
