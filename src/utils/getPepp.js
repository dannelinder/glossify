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

const rare_pepp = {
  3: [
    "Nu händer det grejer!",
    "Tre i rad? Du är varm nu!"
  ],
  5: [
    "Fem raka! Det här är inte tur längre.",
    "Du har precis gått från 'okej' till 'riktigt bra'."
  ],
  10: [
    "TIO i rad?! Okej, nu snackar vi skill.",
    "Du spelar på hard mode och ser ändå lugn ut."
  ],
  15: [
    "15 raka – det här borde ge achievements.",
    "Respekt. Det här är överkurs-nivå."
  ],
  20: [
    "20 i rad? Det är ju nästan löjligt bra.",
    "Du gör det här som om det vore ingenting."
  ],
  25: [
    "25 raka!? Det här är 'legendary tier'.",
    "Okej… nu är det officiellt: du är OP."
  ]
}

export function getPepp(streak) {
  // Check for streak milestone first
  if (rare_pepp[streak]) {
    const arr = rare_pepp[streak]
    return arr[Math.floor(Math.random() * arr.length)]
  }
  // 20% chance to return a random pepp
  if (Math.random() < 0.2) {
    return pepp[Math.floor(Math.random() * pepp.length)]
  }
  return null
}