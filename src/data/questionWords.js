// Cloze sentences / Fyll i luckan (fill-in-the-blank)
// sv: German sentence with a ___ blank (field name kept for schema compatibility)
// ty: the missing German word (the expected answer)
// context: hint sentence shown after the user answers (gives away the answer, so revealed only on feedback)
const questionWords = [
  { sv: "___ liegt Hamburg?", ty: "Wo", context: "Hamburg liegt in Deutschland." },
  { sv: "___ heißt du?", ty: "Wie", context: "Ich heiße Andrea." },
  { sv: "___ alt bist du?", ty: "Wie", context: "Ich bin zwölf Jahre alt." },
  { sv: "___ kommst du?", ty: "Woher", context: "Ich komme aus Schweden." },
  { sv: "___ wohnst du?", ty: "Wo", context: "Ich wohne in Stockholm." },
  { sv: "___ ist das?", ty: "Was", context: "Das ist ein Buch." },
  { sv: "___ ist dein Lehrer?", ty: "Wer", context: "Mein Lehrer ist Herr Müller." },
  { sv: "___ Uhr ist es?", ty: "Wie viel", context: "Es ist drei Uhr." },
  { sv: "Frau Meier, ___ wir heute nach der Pause nach Hause gehen? (dürfen)", ty: "dürfen", context: "Frau Meier, dürfen wir heute nach der Pause nach Hause gehen?" },
  { sv: "Entschuldigung, ___ ich Sie etwas fragen? (dürfen)", ty: "darf", context: "Entschuldigung, darf ich Sie etwas fragen?" }
]

export default questionWords
