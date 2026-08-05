const API_ROOT = "https://whitney.org/api/artworks";
const LOOK_DELAY_MS = 900;
const ANSWER_COUNT = 4;
const API_STARTUP_TIMEOUT_MS = 2400;
const RANDOM_PAGE_LIMIT = 915;
const RANDOM_PAGE_COUNT = 6;
const PROGRESS_MILESTONES = new Set([5, 10, 20, 30, 40, 50, 60, 70, 80, 100]);
const SUPABASE_URL = "https://pubopvzjtfvwceaqmqbf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TGHJIM6p7LTf88d8HyEsbQ_VSla6Rdj";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const fallbackArtworks = [
  {
    id: "37900",
    title: "Ladder to the Moon",
    artist: "Georgia O'Keeffe",
    date: "1958",
    year: 1958,
    decade: "1950s",
    medium: "Oil on canvas",
    classification: "Paintings",
    image: "https://whitneymedia.org/assets/artwork/37900/2024_198a-b_cropped.jpg",
    alt: "A wooden ladder floats upward in a turquoise sky above a distant dark mountain range.",
    observation: "A simple ladder, suspended in open color, turns a familiar object into a line between earth and sky.",
  },
  {
    id: "4",
    title: "Untitled",
    artist: "Edward Avedisian",
    date: "1965",
    year: 1965,
    decade: "1960s",
    medium: "Acrylic on canvas",
    classification: "Paintings",
    image: "https://whitneymedia.org/assets/artwork/4/69_48_cropped.jpg",
    alt: "Two large curved shapes in deep magenta and olive green fill the composition.",
    observation: "Large fields of color make the edge between shapes feel active and deliberate.",
  },
  {
    id: "2659",
    title: "Jigsaw",
    artist: "Miriam Schapiro",
    date: "1969",
    year: 1969,
    decade: "1960s",
    medium: "Acrylic on canvas",
    classification: "Paintings",
    image: "https://whitneymedia.org/assets/artwork/2659/69_46_cropped.jpg",
    alt: "A colorful geometric star with six bold, triangular beams in red, yellow, green, blue, pink, and orange.",
    observation: "The image uses hard geometry and vivid color to make balance feel almost architectural.",
  },
  {
    id: "4663",
    title: "Goldfish Bowl",
    artist: "Roy Lichtenstein",
    date: "1978-1981",
    year: 1978,
    decade: "1970s",
    medium: "Woodcut",
    classification: "Prints",
    image: "https://whitneymedia.org/assets/artwork/4663/82_31_cropped.jpg",
    alt: "A stylized cylindrical jar containing red fish, black diagonal stripes, and a yellow vertical band.",
    observation: "A domestic object becomes graphic and theatrical through line, pattern, and compression.",
  },
  {
    id: "931",
    title: "Untitled (N.Y. World's Fair)",
    artist: "Ad Reinhardt",
    date: "1939",
    year: 1939,
    decade: "1930s",
    medium: "Opaque watercolor and graphite pencil on board",
    classification: "Drawings",
    image: "https://whitneymedia.org/assets/artwork/931/79_56_edited.jpg",
    alt: "Abstract painting with colorful geometric shapes, including rectangles, triangles, and a white circle on a gray background.",
    observation: "The small composition compresses the energy of public spectacle into carefully arranged abstract forms.",
  },
  {
    id: "3217",
    title: "On Blue",
    artist: "John von Wicht",
    date: "1954",
    year: 1954,
    decade: "1950s",
    medium: "Oil on linen",
    classification: "Paintings",
    image: "https://whitneymedia.org/assets/artwork/3217/55_15_cropped.jpg",
    alt: "Abstract painting with bold blue background and clustered red, yellow, and white geometric shapes.",
    observation: "Color carries the atmosphere while the clustered shapes create a concentrated center of attention.",
  },
];

const artistDistractorNames = [
  "Agnes Martin",
  "Alice Neel",
  "Alma Thomas",
  "Andy Warhol",
  "Anne Truitt",
  "Barbara Kruger",
  "Barkley L. Hendricks",
  "Betye Saar",
  "Brice Marden",
  "Cady Noland",
  "Carmen Herrera",
  "Catherine Opie",
  "Charles Burchfield",
  "Chuck Close",
  "Cindy Sherman",
  "Cy Twombly",
  "Dana Schutz",
  "David Hammons",
  "Donald Judd",
  "Doris Salcedo",
  "Dorothea Tanning",
  "Edward Hopper",
  "Ed Ruscha",
  "Elizabeth Catlett",
  "Ellsworth Kelly",
  "Eva Hesse",
  "Faith Ringgold",
  "Felix Gonzalez-Torres",
  "Frank Stella",
  "Georgia O'Keeffe",
  "Glenn Ligon",
  "Gordon Parks",
  "Helen Frankenthaler",
  "Howardena Pindell",
  "Isamu Noguchi",
  "Jack Whitten",
  "Jacob Lawrence",
  "Jasper Johns",
  "Jean-Michel Basquiat",
  "Jenny Holzer",
  "Joan Mitchell",
  "John Baldessari",
  "Julie Mehretu",
  "Kara Walker",
  "Keith Haring",
  "Kerry James Marshall",
  "Kiki Smith",
  "Lorna Simpson",
  "Louise Bourgeois",
  "Mark Bradford",
  "Mark Rothko",
  "Mary Heilmann",
  "Matthew Barney",
  "Mickalene Thomas",
  "Nancy Spero",
  "Nicole Eisenman",
  "On Kawara",
  "Philip Guston",
  "Rashid Johnson",
  "Richard Diebenkorn",
  "Robert Gober",
  "Robert Rauschenberg",
  "Roy Lichtenstein",
  "Ruth Asawa",
  "Salman Toor",
  "Sherrie Levine",
  "Simone Leigh",
  "Sol LeWitt",
  "Theaster Gates",
  "Vija Celmins",
  "Yayoi Kusama",
];

const questionTypes = {
  title: {
    label: "What is the title of this piece?",
    supports: (art) => art.title && art.artist,
    correctValue: (art) => art.title,
    format: (art) => ({ main: art.title, sub: `by ${art.artist}` }),
    distractors: (art, pool) => uniqueBy(pool.filter((item) => item.id !== art.id && item.title && item.artist), "title"),
  },
  artist: {
    label: "Who created this work?",
    supports: (art) => art.artist,
    correctValue: (art) => art.artist,
    format: (art) => ({ main: art.artist, sub: "Artist" }),
    distractors: (art, pool) => artistDistractors(art, pool),
  },
  date: {
    label: "When was this work created?",
    supports: (art) => Number.isFinite(art.year),
    correctValue: (art) => String(art.year),
    format: (art) => ({ main: String(art.year), sub: "Year" }),
    distractors: (art) => nearbyYears(art.year).map((year) => ({ ...art, id: `${art.id}-${year}`, year })),
  },
  medium: {
    label: "What medium was used to create this work?",
    supports: (art) => art.medium,
    correctValue: (art) => art.medium,
    format: (art) => ({ main: art.medium, sub: art.classification || "Medium" }),
    distractors: (art, pool) => uniqueBy(pool.filter((item) => item.id !== art.id && item.medium), "medium"),
  },
};

const state = {
  pool: shuffle(fallbackArtworks),
  queue: [],
  hydrationPromise: null,
  currentArtwork: null,
  currentQuestion: null,
  sessionId: getSessionId(),
  artworkNumber: 0,
  completedQuestions: 0,
  firstTryCorrect: 0,
  pendingProgressReport: false,
  modalMode: "",
  questionHistory: [],
  recentAnswerValues: {},
  revealTimer: null,
  landingThumbnailTimer: null,
  landingThumbnailCursor: 0,
  landingThumbnailIds: new Set(),
  landingThumbnailLocations: new Set(),
};

const elements = {
  landing: document.querySelector("#landing"),
  landingThumbnails: document.querySelector("#landingThumbnails"),
  experience: document.querySelector("#experience"),
  startButton: document.querySelector("#startButton"),
  loadingState: document.querySelector("#loadingState"),
  card: document.querySelector("#card"),
  artworkCount: document.querySelector("#artworkCount"),
  artworkZoomButton: document.querySelector("#artworkZoomButton"),
  artworkImage: document.querySelector("#artworkImage"),
  artworkLargeImage: document.querySelector("#artworkLargeImage"),
  questionText: document.querySelector("#questionText"),
  answerList: document.querySelector("#answerList"),
  feedbackDialog: document.querySelector("#feedbackDialog"),
  artworkDialog: document.querySelector("#artworkDialog"),
  artworkCloseButton: document.querySelector("#artworkCloseButton"),
  modalTitle: document.querySelector("#modalTitle"),
  modalDetails: document.querySelector("#modalDetails"),
  progressText: document.querySelector("#progressText"),
  modalButton: document.querySelector("#modalButton"),
  revealTitle: document.querySelector("#revealTitle"),
  revealArtist: document.querySelector("#revealArtist"),
  revealYear: document.querySelector("#revealYear"),
  revealMedium: document.querySelector("#revealMedium"),
  revealObservation: document.querySelector("#revealObservation"),
  whitneyLink: document.querySelector("#whitneyLink"),
};

elements.startButton.addEventListener("click", startExperience);
elements.modalButton.addEventListener("click", handleModalButton);
elements.artworkZoomButton.addEventListener("click", showArtworkModal);
elements.artworkCloseButton.addEventListener("click", closeArtworkModal);
elements.feedbackDialog.addEventListener("close", handleAnyDialogClose);
elements.artworkDialog.addEventListener("close", handleAnyDialogClose);
elements.feedbackDialog.addEventListener("click", handleDialogBackdropClick);
elements.artworkDialog.addEventListener("click", handleDialogBackdropClick);

startLandingThumbnails();
hydratePool({ timeoutMs: 0 }).then((didHydrate) => {
  if (didHydrate && !elements.landing.classList.contains("is-hidden")) {
    spawnLandingThumbnails(12);
  }
});

if (new URLSearchParams(window.location.search).get("start") === "1") {
  startExperience();
}

function landingThumbnailPlacements() {
  return [
    { left: "8%", top: "12%", size: 56, delay: -2, driftX: "8px", driftY: "-10px", opacity: 0.24 },
    { left: "20%", top: "22%", size: 70, delay: -11, driftX: "-10px", driftY: "12px", opacity: 0.2 },
    { left: "72%", top: "14%", size: 68, delay: -6, driftX: "12px", driftY: "8px", opacity: 0.22 },
    { left: "86%", top: "28%", size: 48, delay: -15, driftX: "-8px", driftY: "-12px", opacity: 0.2 },
    { left: "11%", top: "70%", size: 66, delay: -8, driftX: "10px", driftY: "10px", opacity: 0.2 },
    { left: "26%", top: "78%", size: 54, delay: -17, driftX: "-12px", driftY: "-8px", opacity: 0.18 },
    { left: "70%", top: "76%", size: 76, delay: -4, driftX: "8px", driftY: "-12px", opacity: 0.2 },
    { left: "88%", top: "66%", size: 58, delay: -13, driftX: "-10px", driftY: "8px", opacity: 0.18 },
    { left: "4%", top: "42%", size: 46, delay: -19, driftX: "12px", driftY: "4px", opacity: 0.16 },
    { left: "91%", top: "47%", size: 50, delay: -1, driftX: "-10px", driftY: "-6px", opacity: 0.16 },
    { left: "36%", top: "10%", size: 42, delay: -9, driftX: "8px", driftY: "10px", opacity: 0.16 },
    { left: "56%", top: "84%", size: 50, delay: -21, driftX: "-8px", driftY: "-10px", opacity: 0.16 },
    { left: "15%", top: "34%", size: 44, delay: -5, driftX: "-8px", driftY: "9px", opacity: 0.17 },
    { left: "24%", top: "55%", size: 62, delay: -14, driftX: "10px", driftY: "-8px", opacity: 0.18 },
    { left: "39%", top: "88%", size: 46, delay: -7, driftX: "8px", driftY: "-10px", opacity: 0.15 },
    { left: "58%", top: "9%", size: 54, delay: -18, driftX: "-9px", driftY: "8px", opacity: 0.16 },
    { left: "78%", top: "36%", size: 46, delay: -3, driftX: "7px", driftY: "10px", opacity: 0.17 },
    { left: "80%", top: "57%", size: 64, delay: -16, driftX: "-11px", driftY: "-7px", opacity: 0.18 },
    { left: "6%", top: "84%", size: 42, delay: -10, driftX: "8px", driftY: "-9px", opacity: 0.14 },
    { left: "94%", top: "82%", size: 44, delay: -22, driftX: "-8px", driftY: "-8px", opacity: 0.14 },
    { left: "2%", top: "18%", size: 38, delay: -4, driftX: "9px", driftY: "8px", opacity: 0.22 },
    { left: "30%", top: "4%", size: 52, delay: -12, driftX: "-7px", driftY: "11px", opacity: 0.2 },
    { left: "45%", top: "18%", size: 34, delay: -8, driftX: "8px", driftY: "-7px", opacity: 0.16 },
    { left: "65%", top: "25%", size: 40, delay: -15, driftX: "-9px", driftY: "8px", opacity: 0.17 },
    { left: "96%", top: "13%", size: 46, delay: -6, driftX: "-12px", driftY: "9px", opacity: 0.2 },
    { left: "16%", top: "90%", size: 50, delay: -2, driftX: "7px", driftY: "-12px", opacity: 0.2 },
    { left: "32%", top: "66%", size: 38, delay: -9, driftX: "-6px", driftY: "9px", opacity: 0.16 },
    { left: "49%", top: "72%", size: 34, delay: -13, driftX: "8px", driftY: "-8px", opacity: 0.14 },
    { left: "64%", top: "91%", size: 46, delay: -5, driftX: "-8px", driftY: "-10px", opacity: 0.18 },
    { left: "74%", top: "5%", size: 42, delay: -11, driftX: "9px", driftY: "7px", opacity: 0.18 },
    { left: "84%", top: "88%", size: 52, delay: -18, driftX: "-9px", driftY: "-8px", opacity: 0.2 },
    { left: "98%", top: "58%", size: 36, delay: -7, driftX: "-12px", driftY: "7px", opacity: 0.18 },
  ];
}

function startLandingThumbnails() {
  if (!elements.landingThumbnails || state.landingThumbnailTimer) return;

  spawnLandingThumbnails(10);
  state.landingThumbnailTimer = window.setInterval(() => {
    if (elements.landing.classList.contains("is-hidden")) {
      stopLandingThumbnails();
      return;
    }
    spawnLandingThumbnails(4);
  }, 2200);
}

function stopLandingThumbnails() {
  if (!state.landingThumbnailTimer) return;

  window.clearInterval(state.landingThumbnailTimer);
  state.landingThumbnailTimer = null;
}

function spawnLandingThumbnails(count) {
  if (!elements.landingThumbnails) return;

  const maxThumbnails = 64;
  const currentCount = elements.landingThumbnails.children.length;
  if (currentCount >= maxThumbnails) return;

  const placements = landingThumbnailPlacements();
  const artworks = shuffle(uniqueBy(state.pool.filter((artwork) => artwork.image), "id"))
    .filter((artwork) => !state.landingThumbnailIds.has(artwork.id))
    .slice(0, Math.min(count, maxThumbnails - currentCount));
  const fragment = document.createDocumentFragment();

  artworks.forEach((artwork, index) => {
    if (index >= artworks.length) return;
    const activePlacement = nextLandingThumbnailPlacement(placements);
    if (!activePlacement) return;
    const frame = document.createElement("span");
    const image = document.createElement("img");

    state.landingThumbnailCursor += 1;
    state.landingThumbnailIds.add(artwork.id);
    frame.className = "landing-thumb";
    frame.style.setProperty("--thumb-left", activePlacement.left);
    frame.style.setProperty("--thumb-top", activePlacement.top);
    frame.style.setProperty("--thumb-size", `${activePlacement.size}px`);
    frame.style.setProperty("--thumb-delay", `${index * 0.14}s`);
    frame.style.setProperty("--thumb-drift-x", activePlacement.driftX);
    frame.style.setProperty("--thumb-drift-y", activePlacement.driftY);
    frame.style.setProperty("--thumb-opacity", 1);
    image.src = artwork.image;
    image.alt = "";
    frame.append(image);
    fragment.append(frame);
  });

  elements.landingThumbnails.append(fragment);
}

function nextLandingThumbnailPlacement(placements) {
  const predefined = placements.find((placement) => !state.landingThumbnailLocations.has(locationKey(placement)));
  if (predefined) {
    state.landingThumbnailLocations.add(locationKey(predefined));
    return predefined;
  }

  for (let attempt = 0; attempt < 140; attempt += 1) {
    const placement = generateLandingThumbnailPlacement(state.landingThumbnailCursor + attempt);
    const key = locationKey(placement);
    if (state.landingThumbnailLocations.has(key)) continue;

    state.landingThumbnailLocations.add(key);
    return placement;
  }

  return null;
}

function generateLandingThumbnailPlacement(seed) {
  const columns = [2, 7, 12, 18, 24, 31, 38, 45, 53, 60, 67, 74, 81, 88, 94];
  const rows = [4, 10, 16, 23, 30, 38, 47, 56, 65, 74, 83, 91];
  const left = columns[(seed * 7) % columns.length];
  const top = rows[(seed * 5 + Math.floor(seed / columns.length)) % rows.length];
  const size = 34 + ((seed * 11) % 34);
  const direction = seed % 2 === 0 ? 1 : -1;

  return {
    left: `${left}%`,
    top: `${top}%`,
    size,
    driftX: `${direction * (6 + (seed % 7))}px`,
    driftY: `${-direction * (5 + (seed % 8))}px`,
    opacity: 0.14 + ((seed % 7) * 0.012),
  };
}

function locationKey(placement) {
  return `${placement.left}:${placement.top}`;
}

async function startExperience() {
  stopLandingThumbnails();
  elements.landing.classList.add("is-hidden");
  elements.experience.classList.remove("is-hidden");
  elements.loadingState.classList.remove("is-hidden");
  elements.card.classList.add("is-hidden");
  await hydratePool({ replaceQueue: true, timeoutMs: API_STARTUP_TIMEOUT_MS });
  await showNextArtwork();
}

async function hydratePool({ replaceQueue = false, timeoutMs = 0 } = {}) {
  if (state.hydrationPromise) {
    return withOptionalTimeout(state.hydrationPromise, timeoutMs);
  }

  state.hydrationPromise = fetchRandomArtworkPool(replaceQueue)
    .catch((error) => {
      console.warn("Whitney API unavailable; using local sample records.", error);
      return false;
    })
    .finally(() => {
      state.hydrationPromise = null;
    });

  return withOptionalTimeout(state.hydrationPromise, timeoutMs);
}

async function fetchRandomArtworkPool(replaceQueue) {
  const pageNumbers = randomPageSet(RANDOM_PAGE_COUNT, RANDOM_PAGE_LIMIT);
  const pages = await Promise.all(pageNumbers.map((page) => fetchArtworks(page)));
  const liveArtworks = shuffle(uniqueBy(pages.flat().map(normalizeArtwork).filter(Boolean), "id"));

  if (liveArtworks.length >= ANSWER_COUNT) {
    state.pool = shuffle(uniqueBy([...liveArtworks, ...state.pool, ...fallbackArtworks], "id"));
    state.queue = replaceQueue ? shuffle(liveArtworks) : [...state.queue, ...shuffle(liveArtworks)];
    return true;
  }

  return false;
}

async function withOptionalTimeout(promise, timeoutMs) {
  if (!timeoutMs) return promise;

  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        window.setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  } catch {
    return false;
  }
}

async function fetchArtworks(page = 1) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("q[s]", "random");
  params.set("_artcard", `${Date.now()}-${randomInt(1_000_000)}`);
  const response = await fetch(`${API_ROOT}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Whitney API returned ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

async function showNextArtwork() {
  clearTimeout(state.revealTimer);
  closeDialog();

  const artwork = nextArtwork();
  state.currentArtwork = artwork;
  state.artworkNumber += 1;

  elements.artworkCount.textContent = `Artwork ${state.artworkNumber} of ∞`;
  elements.artworkImage.src = artwork.image;
  elements.artworkImage.alt = artwork.alt || `Artwork by ${artwork.artist}`;
  elements.artworkLargeImage.src = artwork.image;
  elements.artworkLargeImage.alt = artwork.alt || `Artwork by ${artwork.artist}`;
  populateReveal(artwork);
  await decodeImage(elements.artworkImage);

  elements.loadingState.classList.add("is-hidden");
  elements.card.classList.remove("is-hidden");
  buildQuestion(artwork, false, state.artworkNumber === 1);
}

async function decodeImage(image) {
  if (!image?.decode) return;

  try {
    await image.decode();
  } catch {
    // The browser can still render the image if decode() rejects for a cached cross-origin asset.
  }
}

function nextArtwork() {
  if (state.queue.length < 3) {
    state.queue = shuffle(state.pool.filter((art) => art.image));
    hydratePool();
  }
  return state.queue.shift() || fallbackArtworks[0];
}

function buildQuestion(artwork, forceDifferent, delayReveal = true) {
  clearTimeout(state.revealTimer);
  closeDialog();
  elements.questionText.classList.add("is-waiting");
  elements.answerList.classList.add("is-waiting");
  elements.answerList.innerHTML = "";

  const typeName = chooseQuestionType(artwork, forceDifferent);
  const type = questionTypes[typeName];
  const correctAnswer = {
    id: `${artwork.id}-correct`,
    isCorrect: true,
    value: type.correctValue(artwork),
    ...type.format(artwork),
  };
  const distractors = selectDistractors(
    type
    .distractors(artwork, state.pool)
      .filter((item) => type.correctValue(item) !== correctAnswer.value),
    type,
    typeName,
  )
    .map((item) => ({
      id: `${item.id}-${typeName}`,
      isCorrect: false,
      value: type.correctValue(item),
      ...type.format(item),
    }));

  const answers = shuffle([correctAnswer, ...distractors]).slice(0, ANSWER_COUNT);
  rememberAnswerValues(typeName, answers.map((answer) => answer.value));
  state.currentQuestion = { typeName, answers, correctAnswer, hadWrongAttempt: false, completed: false };
  elements.questionText.textContent = preventLastWordWidow(type.label);
  renderAnswers(answers);

  if (!delayReveal) {
    elements.questionText.classList.remove("is-waiting");
    elements.answerList.classList.remove("is-waiting");
    return;
  }

  state.revealTimer = window.setTimeout(() => {
    elements.questionText.classList.remove("is-waiting");
    elements.answerList.classList.remove("is-waiting");
  }, LOOK_DELAY_MS);
}

function chooseQuestionType(artwork, forceDifferent) {
  const supported = Object.entries(questionTypes)
    .filter(([, type]) => type.supports(artwork))
    .map(([name]) => name);
  const last = state.questionHistory.at(-1);
  const repeatedTwice = state.questionHistory.at(-1) && state.questionHistory.at(-1) === state.questionHistory.at(-2);
  let candidates = supported;

  if (forceDifferent && supported.length > 1) {
    candidates = supported.filter((name) => name !== last);
  }

  if (repeatedTwice && supported.length > 1) {
    candidates = candidates.filter((name) => name !== last);
  }

  const choice = candidates[Math.floor(Math.random() * candidates.length)] || supported[0] || "title";
  state.questionHistory.push(choice);
  state.questionHistory = state.questionHistory.slice(-4);
  return choice;
}

function preventLastWordWidow(text) {
  return String(text).replace(/\s+(\S+)$/, "\u00a0$1");
}

function artistDistractors(artwork, pool) {
  const liveArtists = pool
    .filter((item) => item.id !== artwork.id && item.artist)
    .map((item) => ({ ...item, id: `${item.id}-artist-${slugify(item.artist)}` }));
  const curatedArtists = artistDistractorNames.map((artist, index) => ({
    id: `artist-bank-${index}`,
    artist,
  }));

  return uniqueBy(shuffle([...liveArtists, ...curatedArtists]), "artist");
}

function selectDistractors(candidates, type, typeName) {
  const recentValues = new Set(state.recentAnswerValues[typeName] || []);
  const freshCandidates = candidates.filter((item) => !recentValues.has(type.correctValue(item)));
  const preferred = freshCandidates.length >= ANSWER_COUNT - 1 ? freshCandidates : candidates;

  return shuffle(preferred).slice(0, ANSWER_COUNT - 1);
}

function rememberAnswerValues(typeName, values) {
  const previousValues = state.recentAnswerValues[typeName] || [];
  state.recentAnswerValues[typeName] = [...values, ...previousValues].slice(0, ANSWER_COUNT * 4);
}

function renderAnswers(answers) {
  const fragment = document.createDocumentFragment();
  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.dataset.answerId = answer.id;

    const copy = document.createElement("span");
    const main = document.createElement("span");
    const status = document.createElement("span");
    main.className = "answer__main";
    status.className = "answer__status";
    status.setAttribute("aria-hidden", "true");
    main.textContent = answer.main;
    copy.append(main);
    button.append(copy, status);

    button.addEventListener("click", () => selectAnswer(answer.id));
    fragment.append(button);
  });
  elements.answerList.append(fragment);
}

function selectAnswer(answerId) {
  if (elements.answerList.classList.contains("is-waiting")) return;
  const selected = state.currentQuestion.answers.find((answer) => answer.id === answerId);
  const button = elements.answerList.querySelector(`[data-answer-id="${CSS.escape(answerId)}"]`);

  if (!button || button.classList.contains("is-eliminated")) return;

  button.classList.add("is-selected");

  if (selected.isCorrect) {
    recordQuestionCompletion();
    showCorrectModal();
  } else {
    state.currentQuestion.hadWrongAttempt = true;
    button.classList.add("is-eliminated");
    button.disabled = true;
    button.querySelector(".answer__status").textContent = "nope";
  }
}

function populateReveal(artwork) {
  elements.revealTitle.textContent = artwork.title;
  elements.revealArtist.textContent = artwork.artist;
  elements.revealYear.textContent = artwork.date || "Date unknown";
  elements.revealMedium.textContent = artwork.medium || artwork.classification || "Medium not listed";
  elements.revealObservation.textContent = artwork.observation;
  elements.whitneyLink.href = `https://whitney.org/collection/works/${artwork.id}`;
}

function showCorrectModal() {
  state.modalMode = "correct";
  elements.modalTitle.textContent = "correct!";
  elements.modalDetails.classList.remove("is-hidden");
  elements.progressText.classList.add("is-hidden");
  elements.modalButton.textContent = "NEXT PIECE";
  openDialog();
}

function handleModalButton() {
  const mode = state.modalMode;
  closeDialog();
  if (mode === "correct" && state.pendingProgressReport) {
    showProgressReportModal();
    return;
  }

  if (mode === "correct" || mode === "progress") {
    showNextArtwork();
  }
}

function recordQuestionCompletion() {
  if (state.currentQuestion.completed) return;

  state.currentQuestion.completed = true;
  state.completedQuestions += 1;
  if (!state.currentQuestion.hadWrongAttempt) {
    state.firstTryCorrect += 1;
  }
  state.pendingProgressReport = PROGRESS_MILESTONES.has(state.completedQuestions);
}

async function showProgressReportModal() {
  const total = state.completedQuestions;
  const correct = state.firstTryCorrect;
  const topPercent = await getProgressPercentile(correct, total);

  state.pendingProgressReport = false;
  state.modalMode = "progress";
  elements.modalTitle.textContent = "progress report";
  elements.modalDetails.classList.add("is-hidden");
  elements.progressText.classList.remove("is-hidden");
  elements.progressText.textContent = `well done. you've gotten ${correct}/${total} questions correct. you are in the top ${topPercent}% of all users.`;
  elements.modalButton.textContent = "CONTINUE";
  openDialog();
}

async function getProgressPercentile(correct, total) {
  const fallbackPercent = estimateTopPercent(correct, total);
  if (!supabaseClient) return fallbackPercent;

  try {
    await supabaseClient.from("artcard_progress").insert({
      session_id: state.sessionId,
      milestone: total,
      questions_answered: total,
      first_try_correct: correct,
    });

    const { data, error } = await supabaseClient.rpc("artcard_percentile", {
      p_milestone: total,
      p_first_try_correct: correct,
    });

    if (error || typeof data !== "number") {
      console.warn("Supabase percentile unavailable; using estimated benchmark.", error);
      return fallbackPercent;
    }

    return data;
  } catch (error) {
    console.warn("Supabase progress unavailable; using estimated benchmark.", error);
    return fallbackPercent;
  }
}

function getSessionId() {
  const storageKey = "artcard_session_id";
  const existingId = window.sessionStorage.getItem(storageKey);
  if (existingId) return existingId;

  const newId = window.crypto?.randomUUID?.() || `${Date.now()}-${randomInt(1_000_000_000)}`;
  window.sessionStorage.setItem(storageKey, newId);
  return newId;
}

function estimateTopPercent(correct, total) {
  const accuracy = total ? correct / total : 0;
  if (accuracy >= 0.95) return 1;
  if (accuracy >= 0.85) return 5;
  if (accuracy >= 0.75) return 12;
  if (accuracy >= 0.65) return 25;
  if (accuracy >= 0.5) return 40;
  if (accuracy >= 0.35) return 60;
  return 80;
}

function openDialog() {
  if (elements.feedbackDialog.open) return;
  document.body.classList.add("modal-open");
  elements.feedbackDialog.showModal();
}

function closeDialog() {
  if (elements.feedbackDialog.open) {
    elements.feedbackDialog.close();
  }
  handleAnyDialogClose();
}

function showArtworkModal() {
  if (!state.currentArtwork || elements.artworkDialog.open) return;
  document.body.classList.add("modal-open");
  elements.artworkDialog.showModal();
}

function closeArtworkModal() {
  if (elements.artworkDialog.open) {
    elements.artworkDialog.close();
  }
  handleAnyDialogClose();
}

function handleDialogBackdropClick(event) {
  if (event.target !== event.currentTarget) return;

  if (event.currentTarget === elements.artworkDialog) {
    closeArtworkModal();
  } else {
    closeDialog();
  }
}

function handleAnyDialogClose() {
  if (!elements.feedbackDialog.open && !elements.artworkDialog.open) {
    document.body.classList.remove("modal-open");
  }
}

function normalizeArtwork(record) {
  const attributes = record?.attributes;
  const image = attributes?.images?.find((item) => item.url)?.url;
  const year = extractYear(attributes?.display_date);

  if (!attributes || !image || !attributes.title || !attributes.display_artist_text) {
    return null;
  }

  return {
    id: String(attributes.id || record.id),
    title: cleanText(attributes.title),
    artist: cleanText(attributes.display_artist_text),
    date: cleanText(attributes.display_date),
    year,
    decade: Number.isFinite(year) ? `${Math.floor(year / 10) * 10}s` : "",
    medium: cleanText(attributes.medium),
    classification: cleanText(attributes.classification),
    image,
    alt: cleanText(attributes.alt_text || attributes.visual_description || attributes.ai_alt_text),
    observation: makeObservation(attributes),
  };
}

function makeObservation(attributes) {
  const text = cleanText(attributes.visual_description || attributes.alt_text || attributes.ai_alt_text);
  if (text) return text.endsWith(".") ? text : `${text}.`;
  const parts = [attributes.medium, attributes.classification].filter(Boolean).map(cleanText);
  if (parts.length) return `Notice how the work's ${parts.join(" and ").toLowerCase()} shapes what you look at first.`;
  return "Spend a moment with the image before naming it; the details often arrive slowly.";
}

function extractYear(dateText) {
  const match = String(dateText || "").match(/\b(18|19|20)\d{2}\b/);
  return match ? Number(match[0]) : NaN;
}

function nearbyYears(year) {
  const offsets = shuffle([-12, -9, -6, -4, 4, 6, 9, 12, 15, -15]);
  return offsets.map((offset) => year + offset).filter((candidate) => candidate > 1800 && candidate < 2035);
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function randomPageSet(count, maxPage) {
  const pages = new Set();
  while (pages.size < count) {
    pages.add(randomInt(maxPage) + 1);
  }
  return [...pages];
}

function randomInt(maxExclusive) {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
