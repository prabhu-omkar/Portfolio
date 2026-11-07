// All site content lives here. Edit text, links and photos in this one file.

// Optional: path to a downloaded chess model (.glb). Leave null to use the
// built-in procedural ghost pieces. See README for how to add the Ghost set.
export const MODEL_URL = null;

// Accent colour for the whole site (UI, glows, your piece's rim).
// Try: 'steel', 'crimson', 'emerald', 'ice', 'violet'
export const THEME = 'steel';
export const THEMES = {
  steel: '#c9d4e8', // moonlit silver: monochrome, like a black-and-white chess set
  violet: '#8f7dff',
  crimson: '#ff4f6e',
  emerald: '#3fe0a5',
  ice: '#6fc3ff',
  mono: '#e4e8f3',
};

export const PROFILE = {
  name: 'Omkar Prabhu',
  role: 'AI/ML engineer',
  links: {
    github: 'https://github.com/prabhu-omkar',
    linkedin: 'https://www.linkedin.com/in/omkar-prabhu-2b8979301/',
    photos: 'https://in.pinterest.com/time_froze/',
  },
  email: null, // add an email address to show it in About
};

const gh = (repo) => `https://github.com/prabhu-omkar/${repo}`;

/* ------------------------------------------------------------------
   The white pieces on the board, in the order you meet them.
   viz types: bars | squares | grid
------------------------------------------------------------------- */
export const TIMELINE = [
  {
    id: 'puc', piece: 'pawn', date: '2021 – 2023',
    title: 'Pre-University',
    sub: 'Physics, Chemistry, Maths and Computer Science',
    stats: [['96%', '1st PUC'], ['93%', '2nd PUC'], ['4,203', 'KCET, top 5 in my college', 'rank'], ['90.07', 'JEE Main, top 3 in my college', 'percentile']],
    story: [
      'Maths has always been my favourite subject: the kind of problem I will happily sit with long after I need to. Pre-University put it next to Physics, Chemistry and Computer Science, and that pairing of maths and computing is still what I do today.',
      'It showed in the entrance exams. I finished in the top 5 of my college in KCET with a rank of 4,203, and in the top 3 in JEE Main with a 90.07 percentile. That took me to Mathematics & Computing at RUAS.',
    ],
    tiles: [
      ['KCET 2023', 'Rank 4,203, top 5 in my college'],
      ['JEE Main', '90.07 percentile, top 3 in my college'],
      ['PUC boards', '96% in 1st PUC, 93% in 2nd PUC'],
    ],
  },
  {
    id: 'college', piece: 'bishop', date: '2023 – 2027',
    title: 'Ramaiah University of Applied Sciences',
    sub: 'B.Tech in Mathematics & Computing, Bengaluru',
    stats: [['9.0', 'CGPA'], ['M&C', 'Mathematics & Computing'], ['2027', 'Graduating']],
    story: [
      'Mathematics & Computing gives me the half of machine learning most people skip: linear algebra, probability and optimisation, taught as maths rather than as library calls.',
      'Outside class I sat on the committee of Cynergy, the university coding club, and joined the photography club. Now I am on my final-year project: matching neurons across two fruit-fly connectomes with graph neural networks.',
    ],
    tiles: [
      ['Cynergy Coding Club', 'Student committee member, Mar 2025 – Feb 2026'],
      ['Photography club', 'Member, May 2025 – present'],
      ['Final-year project', 'Cross-Connectome Neuron Matching, ongoing', gh('Cross-Connectome-Neuron-Matching')],
    ],
  },
  {
    id: 'scholarship', piece: 'knight', date: 'Aug 2023',
    title: 'Ramaiah Memorial Scholarship',
    sub: 'Awarded by RUAS for outstanding performance in the entrance exams or the PUC boards',
    stats: [['1st', 'Batch to receive it'], ['30', 'Students university-wide'], ['4,203', 'KCET 2023 rank']],
    story: [
      'The Ramaiah Memorial Scholarship is awarded by the university for outstanding performance in the entrance exams or the PUC boards.',
      'My batch was the first ever to receive it, and only 30 students across the whole university were selected. Mine was awarded for my KCET rank of 4,203.',
    ],
    tiles: [
      ['First batch', 'My batch was the first in the university to receive the Ramaiah Memorial Scholarship.'],
      ['Only 30 students', 'Just 30 students across the entire university were selected.'],
      ['KCET rank 4,203', 'Mine was awarded for my KCET 2023 rank of 4,203, top 5 in my PU college.'],
    ],
  },
  {
    id: 'sih25', piece: 'rook', date: 'Oct 2025',
    title: 'Smart India Hackathon 2025',
    sub: 'Won the internal hackathon, then top 8 of 500 submissions nationally',
    stats: [['Top 8', 'Of 500 submissions nationally'], ['86.16%', 'Classification accuracy'], ['ICMLDE', '2026 conference paper']],
    sections: [
      ['The project', [
        'Kolams are geometric patterns drawn around a grid of dots, traditionally outside homes across South India. Problem statement 25107 asked teams to recognise Kolam designs and recreate them digitally.',
        'Our team, AparnaBindu, won the university\'s internal hackathon and went on to the top 8 of 500 submissions nationally, waitlisted for the grand finale. I built both the classifier and the website, including an interactive hex-grid designer for drawing Kolams in the browser.',
      ]],
      ['The research', [
        'We turned the model into a paper. It pairs ConvNeXt, which reads local detail such as dots, curves and motifs, with a Vision Transformer, which reads the symmetry of the whole pattern. Trained on more than 12,000 augmented images across 12 classes, it reaches 86.16% accuracy, ahead of KolamNet (about 81%) and KolamNetV2.',
        'Shrinking each image to a 12 × 12 feature grid before the transformer cuts the attention sequence from about 564 tokens to 144, so one prediction takes 0.038 s. The paper was accepted at ICMLDE 2026, the 5th International Conference on Machine Learning and Data Engineering, and is under review for the proceedings. I am a co-first author with Vishal SN and Amruth U.',
      ]],
    ],
    tiles: [
      ['Research paper', 'Download the ICMLDE 2026 paper as a PDF', 'papers/aparnabindu-icmlde-2026.pdf'],
      ['Live website', 'Classify a Kolam, or draw one on the hex-grid designer', 'https://prabhu-omkar.github.io/AparnaBindu-v2/'],
      ['GitHub', 'Website code and the model benchmark', gh('AparnaBindu-v2')],
    ],
  },
  {
    id: 'hackathons', piece: 'queen', date: '2025 – 2026',
    title: 'Hackathons',
    sub: 'Winner at The Stupid Hack 2026, 3rd at HackNova 26',
    stats: [['8', 'Hackathons'], ['4', 'Finals'], ['2', 'Podium finishes']],
    story: [
      'I have taken part in eight hackathons so far, reached the final in four and finished on the podium twice. Each one is a problem, a deadline and a team that has to ship something working by the end.',
      'The win came at The Stupid Hack 2026 with Mouse Marathon, a browser extension that measures cursor travel in light years and hides your cursor whenever the webcam sees you looking at the screen. I built its whole backend. At HackNova 26 I built WeatherGPT, a conversational assistant that explains forecasts and answers location-specific weather questions, and we finished third.',
    ],
    tiles: [
      ['Winner, The Stupid Hack', '1st of 80 teams with Mouse Marathon', gh('Mouse-marathon')],
      ['3rd, HackNova 26', 'Out of 60 participants with WeatherGPT'],
      ['Top 8, SIH 2025', 'Of 500 submissions with AparnaBindu'],
    ],
  },
];

// Promotion choices at the last rank.
export const PROMOTIONS = [
  { key: 'projects', piece: 'queen', label: 'Projects' },
  { key: 'about', piece: 'rook', label: 'About me' },
  { key: 'achievements', piece: 'knight', label: 'Achievements' },
  { key: 'photography', piece: 'bishop', label: 'Photography' },
];

const CATS = { ml: 'Machine learning', sec: 'Security', prod: 'Products' };

// The ten projects shown in Projects: 4 machine learning, 4 products, 2 security.
export const PROJECTS = [
  { cat: 'ml', title: 'Cross-Connectome Neuron Matching', kind: 'Final-year project, ongoing', text: 'Graph neural networks that find the same neuron in a female and a male fruit-fly brain.', tags: ['PyTorch', 'GNN'], links: [['Code', gh('Cross-Connectome-Neuron-Matching')]] },
  { cat: 'ml', title: 'Amazon ML Challenge 2026', kind: 'Top 1,000 of 32,000 teams', text: 'Multilingual business entity resolution. I built the full pipeline.', tags: ['LightGBM', 'Cross-encoder'], links: [['Code', gh('AmazonML-2026')]] },
  { cat: 'ml', title: 'AparnaBindu', kind: 'SIH 2025 top 8, ICMLDE 2026 paper', text: 'ConvNeXt and Vision Transformer hybrid that classifies Kolam patterns.', tags: ['ViT', 'React'], links: [['Paper', 'papers/aparnabindu-icmlde-2026.pdf'], ['Live', 'https://prabhu-omkar.github.io/AparnaBindu-v2/'], ['Code', gh('AparnaBindu-v2')]] },
  { cat: 'ml', title: 'Churn Dashboard', kind: '95.2% accuracy', text: 'Predicts player churn with XGBoost and explains each prediction with SHAP.', tags: ['XGBoost', 'Flask'], links: [['Live', 'https://churn-dashboard-nkxv.onrender.com'], ['Code', gh('Churn_Dashboard')]] },
  { cat: 'prod', title: 'Mouse Marathon', kind: 'Winner, The Stupid Hack 2026', text: 'Cursor distance in light years, with a webcam that hides your cursor. I built the backend.', tags: ['Express', 'OpenCV'], links: [['Code', gh('Mouse-marathon')]] },
  { cat: 'prod', title: 'Renosh', kind: 'Food-waste platform', text: 'Three Flutter apps linking restaurants, consumers and NGOs, with a demand forecaster.', tags: ['Flutter', 'Firebase'], links: [['Code', gh('Renosh')]] },
  { cat: 'prod', title: 'Axiom', kind: 'Shopify app', text: 'Audits a store so AI assistants like ChatGPT and Perplexity recommend its products.', tags: ['TypeScript', 'GEO'], links: [['Code', gh('Axiom')]] },
  { cat: 'prod', title: 'Git-Rabbit', kind: 'Browser extension', text: 'Pushes every accepted LeetCode, Codeforces or AtCoder solution to GitHub.', tags: ['Manifest V3'], links: [['Code', gh('Git-Rabbit')]] },
  { cat: 'sec', title: 'Zypher', kind: 'SIH 2026, cleared internal round', text: 'Finds cryptography in code and binaries and plans a post-quantum migration.', tags: ['Python', 'NIST PQC'], links: [['Site', 'https://prabhu-omkar.github.io/Zypher-website/'], ['Code', gh('Zypher')]] },
  { cat: 'sec', title: 'Cryptography_RSA', kind: 'RSA from scratch', text: 'Key exchange visualised, with vulnerability tests and key-strength benchmarks.', tags: ['Python'], links: [['Code', gh('Cryptography_RSA')]] },
];

export const EXPERIENCE = [
  {
    role: 'Software Development Engineer Intern', org: 'martit', when: 'Jan – Jun 2026', where: 'Remote',
    points: [
      'Designed the Delivery Partner app UI/UX in Figma, including order-tracking and status-update screens, as part of a three-app marketplace',
      'Built Node.js REST endpoints that automatically assign delivery tasks to the right technician',
    ],
  },
  {
    role: 'Student Committee Member', org: 'Cynergy Coding Club', when: 'Mar 2025 – Feb 2026', where: 'RUAS, Bengaluru',
    points: ['Part of the committee running the university coding club'],
  },
];

export const AWARDS = {
  Wins: [
    ['Mar 2026', 'Winner, The Stupid Hack', '1st of 80 teams'],
    ['2026', '3rd, HackNova 26', 'Out of 60 participants'],
    ['2025', 'Winner, SIH internal hackathon', 'RUAS round of Smart India Hackathon'],
    ['Mar 2026', 'Winner, Maths and Ladder', 'Pi Day'],
    ['Dec 2025', 'Winner, Desmos Art', 'National Mathematics Day'],
    ['Apr 2026', 'Winner, Design Quiz and Egg Drop', 'Anokhi design fest'],
  ],
  'Finals and rankings': [
    ['Oct 2025', 'Top 8, SIH 2025', 'Of 500 submissions'],
    ['Oct 2026', 'Top 1,000, Amazon ML Challenge', 'Of 32,000 teams'],
    ['2026', 'SIH 2026, internal round', 'Cleared with Zypher'],
    ['Mar 2026', 'Finalist, Integration Bee', 'Pi Day'],
    ['2026', 'Finalist, The Sentence debate', 'Top 4'],
    ['2026', 'Finalist, Pitch Pulse', 'Pravrutti tech fest'],
  ],
  'Research and academics': [
    ['2026', 'ICMLDE 2026 paper', 'AparnaBindu, co-first author'],
    ['Aug 2023', 'Ramaiah Memorial Scholarship', 'One of 30, first batch'],
    ['2023', 'KCET rank 4,203', 'Top 5 in my PU college'],
    ['2023', 'JEE Main 90.07 percentile', 'Top 3 in my PU college'],
    ['Dec 2024', 'Runner-up, Maths Quiz', 'National Mathematics Day'],
  ],
};

export const CERTS = [
  ['May 2026', 'Cisco Endpoint Security', 'Cisco Networking Academy'],
  ['Dec 2025', 'Introduction to Deep Learning', 'Infosys Springboard'],
  ['Dec 2025', 'Cryptography in IT Security and Hacking', 'Infosys Springboard'],
];

export const OPEN_SOURCE = [
  ['freeCodeCamp', '#70180', 'Curriculum tests now accept equivalent print expressions', 'https://github.com/freeCodeCamp/freeCodeCamp/pull/70180'],
  ['OmniRoute', '#13579', 'Fixed `omniroute update` failing on peer dependencies', 'https://github.com/cheaper-inference/OmniRoute/pull/13579'],
];

export const SKILLS = [
  ['Machine learning', ['Python', 'PyTorch', 'scikit-learn', 'XGBoost', 'LightGBM', 'Hugging Face', 'PySpark', 'OpenCV', 'SHAP', 'GNNs', 'Vision Transformers']],
  ['Building products', ['TypeScript', 'React', 'Node.js', 'Express', 'Flask', 'Flutter', 'Firebase', 'PostgreSQL', 'Three.js', 'Figma']],
  ['Systems & security', ['C++', 'OpenMP', 'MPI', 'Cryptography', 'OpenTelemetry']],
];

// Photos from time_froze on Pinterest. To host them yourself, save the files
// into /photos and change src/full to e.g. 'photos/elephant.jpg'.
const pin = (id, size) => `https://i.pinimg.com/${size}/${id}.jpg`;
export const PHOTOS = [
  ['70/f9/be/70f9be3c5ffbbfc30049c2e6a4e60adb', 'Elephant in the long grass'],
  ['99/a2/d3/99a2d3f1833c520d2192f891aebadadc', 'Festival chariot, with the fair behind it'],
  ['3f/a8/4a/3fa84af122b39812b25c52473c5e1420', 'Chrome on a vintage car'],
  ['0c/a7/22/0ca722d00c57678908d521e7e12bb6ee', 'Inside a rock-cut cave hall'],
  ['34/c1/a6/34c1a6eddb6c36f44e7bdb953c6c8ad7', 'A statue in scaffolding under a monsoon sky'],
  ['5f/ba/89/5fba8999a772e27d1a570d907e0c4f2a', 'Footsteps to the sea at sunset'],
  ['d4/ed/79/d4ed79db69e4047b0ce14a6e809fd70d', 'A city at night, from the air'],
].map(([id, caption]) => ({ src: pin(id, '736x'), full: pin(id, 'originals'), caption }));

/* ================= HTML builders ================= */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const links = (arr = []) => arr.length
  ? `<p class="links">${arr.map(([l, h]) => `<a href="${h}" target="_blank" rel="noopener">${esc(l)}</a>`).join('')}</p>` : '';
// A scoresheet: the figures that matter, ruled like a chess score card.
const sheet = (arr) => `<dl class="sheet n${arr.length}" style="--n:${arr.length}">${arr.map(([v, l, u]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}${u ? `<small>${esc(u)}</small>` : ''}</dd></div>`).join('')}</dl>`;
const sub = (t) => `<h3 class="sub">${esc(t)}</h3>`;

function viz(v) {
  if (!v) return '';
  if (v.type === 'bars') {
    return `<figure class="viz"><figcaption>${esc(v.caption)}</figcaption>${v.rows.map(([l, n]) => `
      <div class="bar"><span class="bar-l">${esc(l)}</span><span class="bar-t"><i style="--w:${n}%"></i></span><span class="bar-v">${n}</span></div>`).join('')}</figure>`;
  }
  if (v.type === 'squares') {
    const cells = Array.from({ length: v.max }, (_, i) => {
      const fill = Math.max(0, Math.min(1, v.value - i));
      return `<span class="${i % 2 ? 'lt' : 'dk'}" style="--f:${fill}"></span>`;
    }).join('');
    return `<figure class="viz"><figcaption>${esc(v.caption)}</figcaption><div class="file">${cells}</div></figure>`;
  }
  if (v.type === 'grid') {
    const cells = Array.from({ length: v.total }, (_, i) => `<span${i < v.mark ? ' class="on"' : ''}></span>`).join('');
    return `<figure class="viz"><figcaption>${esc(v.caption)}</figcaption><div class="dotgrid${v.total < 120 ? ' big' : ''}">${cells}</div></figure>`;
  }
  return '';
}

export function renderTimeline(item) {
  return `
    ${sheet(item.stats)}
    ${viz(item.viz)}
    ${item.sections
    ? item.sections.map(([h, ps]) => `${sub(h)}<div class="story">${ps.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`).join('')
    : `<div class="story">${item.story.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`}
    ${item.sections ? '' : sub('Highlights')}
    ${item.tiles
    ? `<ul class="tiles">${item.tiles.map(([t, d, h]) => `<li><strong>${h ? `<a href="${h}" target="_blank" rel="noopener"${h.endsWith('.pdf') ? ' download' : ''}>${esc(t)}</a>` : esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>`
    : `<ul class="hl">${item.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`}
    ${links(item.links)}`;
}

function projectsHTML() {
  return `
    <p class="lede">Machine learning first, but I like shipping the whole thing: the model, the backend and the interface people actually touch.</p>
    ${['ml', 'prod', 'sec'].map((c) => `
      ${sub(CATS[c])}
      <ul class="tiles proj">${PROJECTS.filter((p) => p.cat === c).map((p) => `
        <li>
          <strong>${esc(p.title)}</strong>
          <span class="kind">${esc(p.kind)}</span>
          <span>${esc(p.text)}</span>
          <span class="tags">${p.tags.map(esc).join(', ')}</span>
          ${links(p.links)}
        </li>`).join('')}
      </ul>`).join('')}`;
}

function aboutHTML() {
  return `
    <p class="lede">I'm Omkar, a Mathematics & Computing undergraduate in Bengaluru. I like problems where the maths matters: entity resolution at Amazon-challenge scale, vision models for Kolam art, and right now, graph neural networks over two complete fruit-fly brains.</p>
    <div class="story"><p>I usually end up building the whole product around a model too, from backends to browser extensions. That is how a reverse Pac-Man, a post-quantum crypto scanner and a cursor marathon measured in light years all ended up on my GitHub.</p></div>
    ${sheet([['9.0', 'CGPA'], ['2027', 'Graduating'], ['Bengaluru', 'Based in']])}
    ${sub('Experience')}
    <ol class="xp">${EXPERIENCE.map((x) => `
      <li>
        <div class="xp-head"><h4>${esc(x.role)}</h4><time>${esc(x.when)}</time></div>
        <p class="xp-org">${esc(x.org)}, ${esc(x.where)}</p>
        <ul class="hl">${x.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </li>`).join('')}
    </ol>
    ${sub('Toolbox')}
    <dl class="skills">${SKILLS.map(([g, list]) => `<div><dt>${esc(g)}</dt><dd>${list.map(esc).join(', ')}</dd></div>`).join('')}</dl>
    ${sub('Away from the keyboard')}
    <dl class="skills">
      <div><dt>Photography</dt><dd>I shoot as <a href="${PROFILE.links.photos}" target="_blank" rel="noopener">time_froze</a> and I am a member of the university photography club</dd></div>
      <div><dt>Cubing</dt><dd>3×3 in 35 seconds at best; also 2×2, 4×4 and Pyraminx</dd></div>
      <div><dt>Cooking</dt><dd>The other place I experiment</dd></div>
    </dl>
    ${sub('Contact')}
    ${links([['GitHub', PROFILE.links.github], ['LinkedIn', PROFILE.links.linkedin]])}
    ${PROFILE.email ? `<p class="email">${esc(PROFILE.email)}</p>` : ''}`;
}

function achievementsHTML() {
  const tiles = (arr) => `<ul class="tiles proj ach">${arr.map(([d, t, x, h]) => `
    <li><strong>${h ? `<a href="${h}" target="_blank" rel="noopener">${esc(t)}</a>` : esc(t)}</strong><span class="kind">${esc(d)}</span><span>${md(x)}</span></li>`).join('')}</ul>`;
  return `
    <p class="lede">Hackathons, maths contests, a debate final and a research paper.</p>
    ${sheet([[String(AWARDS.Wins.length), 'Wins and podiums'], [String(AWARDS['Finals and rankings'].length), 'Finals and rankings'], [String(CERTS.length), 'Certifications']])}
    ${Object.entries(AWARDS).map(([g, arr]) => `${sub(g)}${tiles(arr)}`).join('')}
    ${sub('Certifications')}
    ${tiles(CERTS.map(([d, t, by]) => [d, t, by]))}`;
}

function photographyHTML() {
  return `
    <p class="lede">I shoot under the name time_froze: temple elephants, festival chariots, old cars up close. Anything worth stopping for.</p>
    <div class="story"><p>I am a member of the photography club at RUAS. Tap any photo to see it larger.</p></div>
    <div class="photos">${PHOTOS.map((p, i) => `
      <figure><button type="button" class="ph" data-i="${i}" aria-label="Open ${esc(p.caption)}"><img src="${p.src}" alt="${esc(p.caption)}" loading="lazy"></button><figcaption>${esc(p.caption)}</figcaption></figure>`).join('')}
    </div>
    ${links([['See more on Pinterest', PROFILE.links.photos]])}
    <div class="lightbox" hidden><button type="button" class="lb-close" aria-label="Close photo">×</button><img alt=""><p></p></div>`;
}

export const PROMO_RENDER = { projects: projectsHTML, about: aboutHTML, achievements: achievementsHTML, photography: photographyHTML };

// Interactivity inside a rendered panel (project filters).
export function wirePanel(root) {
  const lb = root.querySelector('.lightbox');
  if (lb) {
    const img = lb.querySelector('img'); const cap = lb.querySelector('p');
    root.querySelectorAll('.ph').forEach((b) => b.addEventListener('click', () => {
      const p = PHOTOS[+b.dataset.i];
      img.src = p.full; img.alt = p.caption; cap.textContent = p.caption; lb.hidden = false;
    }));
    lb.addEventListener('click', () => { lb.hidden = true; img.src = ''; });
  }
  const btns = root.querySelectorAll('.filters button');
  btns.forEach((b) => b.addEventListener('click', () => {
    btns.forEach((x) => x.classList.toggle('on', x === b));
    const c = b.dataset.cat;
    root.querySelectorAll('[data-cat]').forEach((el) => {
      if (el.tagName === 'BUTTON') return;
      el.hidden = c !== 'all' && el.dataset.cat !== c;
    });
  }));
}

// Plain page used when WebGL is unavailable.
export function renderFallback() {
  return `
    <header><h1>${PROFILE.name}</h1><p>${PROFILE.role}</p></header>
    ${TIMELINE.map((t) => `<section><p class="kind">${esc(t.date)}</p><h2>${esc(t.title)}</h2>${renderTimeline(t)}</section>`).join('')}
    ${PROMOTIONS.map((p) => `<section><h2>${p.label}</h2>${PROMO_RENDER[p.key]()}</section>`).join('')}`;
}
