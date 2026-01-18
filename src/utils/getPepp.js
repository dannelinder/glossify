// getPepp: return motivating message based on streak or randomly

const pepp = [
  "Bra jobbat!",
  "Du är på rätt spår.",
  "Fortsätt så där, det funkar!",
  "Starkt jobbat!",
  "Du fixade det!",
  "Grymt gjort!",
  "Stabilt!",
  "Rätt igen – snyggt.",
  "Du börjar få flyt nu!",
  "Det där satt!",
  "Nice!",
  "Exakt så!",
  "Det går bättre än du tror.",
  "Snyggt tänkt!",
  "Det här går ju galant.",
  "Imponerande!",
  "Du gör det här riktigt bra.",
  "Fortsätt – du är nära nu!",
  "Smart löst.",
  "Du har koll!",
  "Där satt den!",
  "Du gör framsteg hela tiden.",
  "Bra fokus!",
  "Japp, det var helt rätt!",
  "Du är på gång nu.",
  "Det här är kvalitet.",
  "Jag ser att du anstränger dig – bra!",
  "Den här nivån är du definitivt redo för.",
  "Helt korrekt – snyggt.",
  "Du ger inte upp, och det märks.",
  "Boom! Rätt svar!",
  "Starkt av dig att fortsätta.",
  "Du har flow!",
  "Det går snabbare för varje fråga nu.",
  "Du borde vara stolt över det här.",
  "Fint jobbat!",
  "Det märks att du tänker efter – bra!",
  "Rätt igen, och med stil.",
  "Stabil insats!",
  "Du har hittat rytmen.",
  "Det är så här man gör framsteg.",
  "Riktigt bra driv!",
  "Härligt att se!",
  "Det är inte lätt – men du fixar det ändå.",
  "Fullträff!",
  "Du är helt klart på rätt nivå.",
  "Det där krävde hjärna – och du nailade det.",
  "Du överraskar!",
  "Det där borde ge en high five.",
  "*Fett bra gjort*."
]


const streakMilestones = [3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const streakPhrases = {
  3: ["Tre i rad!"],
  5: ["Fem raka!"],
  7: ["Sju i rad!"],
  10: ["Tio i rad!"],
  15: ["Femton i rad!"],
  20: ["Tjugo i rad!"],
  25: ["Tjugofem i rad!"],
  30: ["Tretti i rad!"],
  35: ["Trettiofem i rad!"],
  40: ["Fyrtio i rad!"],
  45: ["Fyrtiofem i rad!"],
  50: ["Femtio i rad!"],
};


function getPepp(streak) {
  // Only trigger on defined milestones
  if (streakMilestones.includes(streak)) {
    const isTest = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || (typeof window !== 'undefined' && window.__TEST_MODE__));
    const phrases = streakPhrases[streak] || [];
    let milestoneMsg, peppMsg;
    if (isTest) {
      milestoneMsg = phrases.length > 0 ? phrases[0] : `Du har ${streak} i rad!`;
      peppMsg = pepp[0];
    } else {
      milestoneMsg = phrases.length > 0 ? phrases[Math.floor(Math.random() * phrases.length)] : `Du har ${streak} i rad!`;
      peppMsg = pepp[Math.floor(Math.random() * pepp.length)];
    }
    return `${milestoneMsg} ${peppMsg}`;
  }
  return null;
}

module.exports = { getPepp };