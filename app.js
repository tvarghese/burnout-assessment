// Edit QUESTIONS to change the self-check. Scores stay in this page only.
const QUESTIONS = [
  "I feel run down and drained of physical or emotional energy.",
  "I have negative thoughts about UPSTREAM Jubilee.",
  "I am harder and less sympathetic with my teammates than perhaps they deserve.",
  "I am easily irritated by small problems, or by my team.",
  "I feel misunderstood or unappreciated by my teammates.",
  "I feel that I have no one to talk to.",
  "I feel that I am achieving less than I should.",
  "I feel under an unpleasant level of pressure to succeed.",
  "I feel that I am not getting what I want out of my involvement in UPSTREAM Jubilee.",
  "I feel that I am on the wrong team or in the wrong ministry.",
  "I am frustrated with parts of my responsibilities.",
  "I feel that ‘JY politics’ or bureaucracy frustrate my ability to do a good job.",
  "I feel that there is more work to do than I practically have the ability to do.",
  "I feel that I do not have time to do many of the things that are important to doing a good quality job.",
  "I find that I do not have time to plan as much as I would like to.",
];

const SCALE = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Very Often" },
];

const BANDS = [
  { min: 15, max: 18, tone: "calm", message: "No sign of burnout here." },
  {
    min: 19,
    max: 32,
    tone: "steady",
    message: "Little sign of burnout here, unless some factors are particularly severe.",
  },
  {
    min: 33,
    max: 49,
    tone: "risk",
    message: "Be careful – you may be at risk of burnout, particularly if several scores are high.",
    coordinator: true,
  },
  {
    min: 50,
    max: 59,
    tone: "severe",
    message: "You are at severe risk of burnout – do something about this urgently.",
    coordinator: true,
  },
  {
    min: 60,
    max: 75,
    tone: "critical",
    message: "You are at very severe risk of burnout – do something about this urgently.",
    coordinator: true,
  },
];

const COORDINATOR =
  "Talk with your team coordinator. They will work with you on what is good for you. You are more important than the team or the conference.";

const form = document.getElementById("assessment");
const result = document.getElementById("result");
const resetConfirm = document.getElementById("reset-confirm");
const exportFallback = document.getElementById("export-fallback");
let wasComplete = false;

function bandFor(score) {
  return BANDS.find((band) => score <= band.max);
}

function readState() {
  const answers = QUESTIONS.map((_, index) => {
    const picked = document.querySelector(`input[name="q${index}"]:checked`);
    return picked ? Number(picked.value) : null;
  });
  const answered = answers.filter((value) => value !== null).length;
  const total = answers.reduce((sum, value) => sum + (value || 0), 0);
  return { answers, answered, total, complete: answered === QUESTIONS.length };
}

function whyText(raw, question) {
  const text = raw.trim();
  if (!text || text === question) return "";
  if (text.startsWith(question)) {
    return text.slice(question.length).replace(/^[\s:–—-]+/, "").trim();
  }
  return text;
}

function renderBandKey() {
  const list = document.getElementById("band-list");
  BANDS.forEach((band) => {
    const li = document.createElement("li");
    const range = document.createElement("strong");
    range.textContent = `${band.min}–${band.max}`;
    li.append(range, document.createTextNode(` ${band.message}`));
    list.appendChild(li);
  });
}

function renderQuestions() {
  const root = document.getElementById("questions");
  QUESTIONS.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question";
    fieldset.id = `q-${index}`;

    const legend = document.createElement("legend");
    const label = document.createElement("span");
    label.className = "q-label";
    const number = document.createElement("span");
    number.className = "q-num";
    number.textContent = `${index + 1}.`;
    label.append(number, document.createTextNode(` ${question}`));
    legend.appendChild(label);

    const choices = document.createElement("div");
    choices.className = "choices";
    SCALE.forEach((item) => {
      const choice = document.createElement("label");
      choice.className = "choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${index}`;
      input.value = String(item.value);
      input.setAttribute("aria-label", `${item.value}, ${item.label}`);
      const face = document.createElement("span");
      face.className = "face";
      const faceNumber = document.createElement("span");
      faceNumber.className = "face-num";
      faceNumber.textContent = String(item.value);
      const word = document.createElement("small");
      word.textContent = item.label;
      face.append(faceNumber, word);
      choice.append(input, face);
      choices.appendChild(choice);
    });

    const note = document.createElement("div");
    note.className = "note";
    note.id = `note-wrap-${index}`;
    note.hidden = true;

    const noteLabel = document.createElement("label");
    noteLabel.htmlFor = `note-${index}`;
    noteLabel.textContent = "Why are you feeling this way?";

    const hint = document.createElement("p");
    hint.className = "note-hint";
    hint.textContent = "The question is already written here. Add the reason in your own words.";

    const area = document.createElement("textarea");
    area.id = `note-${index}`;
    area.rows = 4;
    area.autocomplete = "off";
    area.dataset.print = `note-print-${index}`;

    const printNote = document.createElement("p");
    printNote.className = "note-print";
    printNote.id = `note-print-${index}`;

    note.append(noteLabel, hint, area, printNote);
    fieldset.append(legend, choices, note);
    root.appendChild(fieldset);
  });
}

function highIndexes(answers) {
  const indexes = [];
  answers.forEach((value, index) => {
    if (value !== null && value >= 4) indexes.push(index);
  });
  return indexes;
}

function renderResult(state) {
  const { answers, total, complete } = state;
  result.hidden = !complete;
  if (!complete) return;

  const band = bandFor(total);
  result.dataset.tone = band.tone;
  document.getElementById("result-total").textContent = String(total);
  document.getElementById("result-message").textContent = band.message;

  const coordinator = document.getElementById("result-coordinator");
  coordinator.hidden = !band.coordinator;
  coordinator.textContent = COORDINATOR;

  const high = document.getElementById("result-high");
  high.replaceChildren();
  const indexes = highIndexes(answers);
  const summary = document.createElement("p");
  if (indexes.length === 0) {
    summary.textContent = "No question is Often or Very Often.";
    high.appendChild(summary);
    return;
  }
  summary.textContent =
    indexes.length === 1
      ? "One question is Often or Very Often. Add why under that question."
      : `${indexes.length} questions are Often or Very Often. Add why under each one.`;
  const list = document.createElement("ul");
  indexes.forEach((index) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#q-${index}`;
    link.textContent = `${index + 1}. ${QUESTIONS[index]}`;
    item.appendChild(link);
    list.appendChild(item);
  });
  high.append(summary, list);
}

function renderBar(state) {
  const { answered, total, complete } = state;
  const bar = document.querySelector(".scorebar");
  const meter = document.getElementById("meter");
  const fill = document.getElementById("meter-fill");
  const coordinator = document.getElementById("bar-coordinator");
  const band = complete ? bandFor(total) : null;

  document.getElementById("bar-label").textContent = complete ? "Score" : "Running total";
  document.getElementById("bar-score").textContent = answered ? String(total) : "–";
  document.getElementById("bar-meta").textContent = `${answered} of ${QUESTIONS.length} answered`;
  document.getElementById("bar-hint").textContent = complete
    ? band.message
    : "Answer all 15 questions to see where you land.";

  coordinator.hidden = !(band && band.coordinator);
  bar.dataset.tone = band ? band.tone : "";
  meter.setAttribute("aria-valuenow", String(answered));
  meter.setAttribute("aria-valuetext", `${answered} of ${QUESTIONS.length} answered`);
  fill.style.width = `${(answered / QUESTIONS.length) * 100}%`;

  const liveParts = [];
  if (!answered) {
    liveParts.push("No answers yet.");
  } else if (complete) {
    liveParts.push(`Score ${total}.`, band.message);
    if (band.coordinator) liveParts.push(COORDINATOR);
  } else {
    liveParts.push(
      `Running total ${total}.`,
      `${answered} of ${QUESTIONS.length} answered.`,
      "Answer all 15 questions to see where you land.",
    );
  }
  document.getElementById("live").textContent = liveParts.join(" ");
}

function render() {
  const state = readState();
  state.answers.forEach((value, index) => {
    const note = document.getElementById(`note-wrap-${index}`);
    const area = document.getElementById(`note-${index}`);
    const printNote = document.getElementById(`note-print-${index}`);
    const show = value !== null && value >= 4;
    if (show && area.dataset.started !== "1") {
      area.value = QUESTIONS[index];
      area.dataset.started = "1";
    }
    note.hidden = !show;
    printNote.textContent = area.value;
  });

  renderBar(state);
  renderResult(state);

  if (state.complete && !wasComplete) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    result.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  wasComplete = state.complete;
}

function buildExport() {
  const { answers, answered, total, complete } = readState();
  const lines = ["UPSTREAM Jubilee burnout self-check", ""];
  if (!answered) {
    lines.push("No answers yet.");
    return lines.join("\n");
  }
  if (complete) {
    const band = bandFor(total);
    lines.push(`Score: ${total}`);
    lines.push(band.message);
    if (band.coordinator) {
      lines.push("");
      lines.push(COORDINATOR);
    }
  } else {
    lines.push(`Running total: ${total}`);
    lines.push(`Answered ${answered} of ${QUESTIONS.length}. Finish every question to see your result.`);
  }

  const indexes = highIndexes(answers);
  if (indexes.length) {
    lines.push("", "Questions scored Often or Very Often:");
    indexes.forEach((index) => {
      const value = answers[index];
      const why = whyText(document.getElementById(`note-${index}`).value, QUESTIONS[index]);
      lines.push("");
      lines.push(`${index + 1}. ${QUESTIONS[index]}`);
      lines.push(`Score: ${SCALE[value - 1].label}`);
      lines.push(why ? `Why: ${why}` : "Why: (add this in your own words)");
    });
  } else if (complete) {
    lines.push("", "No question was scored Often or Very Often.");
  }
  return lines.join("\n");
}

function setStatus(message) {
  document.getElementById("status").textContent = message;
}

async function copyNotes() {
  const text = buildExport();
  try {
    await navigator.clipboard.writeText(text);
    exportFallback.hidden = true;
    setStatus("Copied. You can paste it into a note you keep.");
  } catch {
    const box = document.getElementById("export-box");
    exportFallback.hidden = false;
    box.value = text;
    box.focus();
    box.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    setStatus(
      copied
        ? "Copied. You can paste it into a note you keep."
        : "Copy is blocked in this browser. The text below is selected so you can copy it yourself.",
    );
  }
}

function clearAssessment() {
  form.reset();
  document.querySelectorAll("textarea").forEach((area) => {
    if (area.id === "export-box") return;
    area.value = "";
    delete area.dataset.started;
    const printNote = document.getElementById(area.dataset.print);
    if (printNote) printNote.textContent = "";
  });
  wasComplete = false;
  resetConfirm.hidden = true;
  exportFallback.hidden = true;
  render();
  document.querySelector("#questions input")?.focus();
  setStatus("Cleared. Your answers were only on this page.");
}

renderBandKey();
renderQuestions();
render();

form.addEventListener("change", (event) => {
  if (event.target.matches('input[type="radio"]')) render();
});

form.addEventListener("input", (event) => {
  if (!event.target.matches("textarea")) return;
  const printNote = document.getElementById(event.target.dataset.print);
  if (printNote) printNote.textContent = event.target.value;
});

form.addEventListener("submit", (event) => event.preventDefault());

document.getElementById("copy").addEventListener("click", copyNotes);
document.getElementById("print").addEventListener("click", () => window.print());

document.getElementById("reset").addEventListener("click", () => {
  const { answered } = readState();
  if (!answered) {
    setStatus("Nothing to clear yet.");
    return;
  }
  resetConfirm.hidden = false;
  document.getElementById("reset-no").focus();
});

document.getElementById("reset-no").addEventListener("click", () => {
  resetConfirm.hidden = true;
  document.getElementById("reset").focus();
});

document.getElementById("reset-yes").addEventListener("click", clearAssessment);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !resetConfirm.hidden) {
    resetConfirm.hidden = true;
    document.getElementById("reset").focus();
  }
});
