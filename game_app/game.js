(() => {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const screens = {
    menu: qs('#screen-menu'),
    howto: qs('#screen-howto'),
    play: qs('#screen-play'),
    results: qs('#screen-results')
  };
  const btns = {
    how: qs('#howBtn'),
    back: qs('#backToMenu'),
    start: qs('#startBtn'),
    roll: qs('#rollBtn'),
    playAgain: qs('#playAgainBtn'),
    toMenu: qs('#toMenuBtn'),
    contrast: qs('#contrastBtn')
  };
  const els = {
    region: qs('#region'),
    difficulty: qs('#difficulty'),
    quickDemo: qs('#quickDemo'),
    board: qs('#board'),
    rollResult: qs('#rollResult'),
    turnInfo: qs('#turnInfo'),
    gauges: {
      Budget: qs('#gBudget'), Resilience: qs('#gResilience'),
      Awareness: qs('#gAwareness'), Equity: qs('#gEquity')
    },
    outputs: {
      Budget: qs('#oBudget'), Resilience: qs('#oResilience'),
      Awareness: qs('#oAwareness'), Equity: qs('#oEquity')
    },
    modal: qs('#eventModal'),
    eventTitle: qs('#eventTitle'),
    eventText: qs('#eventText'),
    optionBtns: qs('#optionBtns'),
    factBox: qs('#factBox'),
    factText: qs('#factText'),
    resultsCard: qs('#resultsCard')
  };

  // Basic seeded RNG for reproducible demos
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  let rand = mulberry32(0xC0FFEE);

  const TILE_COUNT = 30;
  const MAX_VAL = 100, MIN_VAL = 0;
  const START = { Budget: 50, Resilience: 50, Awareness: 50, Equity: 50 };
  const WIN_REQ = { Budget: 0, Resilience: 70, Awareness: 60, Equity: 55 };

  let state = {
    region: 'VN',
    difficulty: 'normal',
    position: 0,
    turn: 1,
    turnMax: 15,
    gauges: { ...START },
    deck: [],
    done: false
  };

  // Event cards (trimmed for brevity but sufficient variety)
  const EVENTS = {
    VN: [
      {
        title: "River flood warning 🌧️",
        text: "Water levels rising near town. What do you do first?",
        fact: "Early warnings + clear comms save lives and protect the budget.",
        options: [
          { label: "Activate SMS/Loa phường alerts; instruct at-risk zones to move valuables.", effects: {Budget:-2, Resilience:+6, Awareness:+6, Equity:+2} },
          { label: "Wait for more data before alerting.", effects: {Budget:+0, Resilience:-4, Awareness:-6, Equity:-3} },
          { label: "Deploy sandbags to critical spots only.", effects: {Budget:-4, Resilience:+4, Awareness:+1, Equity:+0} }
        ]
      },
      {
        title: "Plant mangroves 🌱",
        text: "Coastal erosion threatens a fishing village. Choose an approach.",
        fact: "Mangroves reduce storm surge and support livelihoods.",
        options: [
          { label: "Community-led planting with training & stipends.", effects: {Budget:-6, Resilience:+8, Awareness:+4, Equity:+5} },
          { label: "Hire contractor; minimal local involvement.", effects: {Budget:-8, Resilience:+6, Awareness:+1, Equity:-2} },
          { label: "Delay to next year.", effects: {Budget:+2, Resilience:-5, Awareness:-2, Equity:-2} }
        ]
      },
      {
        title: "School safety drill 🏫",
        text: "Flood drill at local schools.",
        fact: "Regular drills build muscle memory and reduce panic.",
        options: [
          { label: "Inclusive drill incl. students with disabilities.", effects: {Budget:-3, Resilience:+6, Awareness:+7, Equity:+6} },
          { label: "Basic drill, no adjustments.", effects: {Budget:-1, Resilience:+3, Awareness:+3, Equity:+0} },
          { label: "Skip this term.", effects: {Budget:+1, Resilience:-3, Awareness:-4, Equity:-3} }
        ]
      },
      {
        title: "Community micro-grants 💡",
        text: "Small grants for household flood-proofing.",
        fact: "Equity-focused funding reduces worst impacts for vulnerable groups.",
        options: [
          { label: "Target low-income & elderly households first.", effects: {Budget:-7, Resilience:+6, Awareness:+3, Equity:+8} },
          { label: "First-come-first-served.", effects: {Budget:-5, Resilience:+3, Awareness:+2, Equity:-2} },
          { label: "Invest in publicity instead.", effects: {Budget:-2, Resilience:+1, Awareness:+4, Equity:-3} }
        ]
      },
      {
        title: "Drainage cleanup 🧹",
        text: "Monsoon approaching; drains clogged.",
        fact: "Maintenance prevents urban flash floods.",
        options: [
          { label: "Neighborhood cleanup days + trucks.", effects: {Budget:-5, Resilience:+6, Awareness:+3, Equity:+2} },
          { label: "Only clear near markets.", effects: {Budget:-3, Resilience:+3, Awareness:+0, Equity:-2} },
          { label: "Defer to save budget.", effects: {Budget:+3, Resilience:-6, Awareness:-2, Equity:-1} }
        ]
      }
    ],
    AU: [
      {
        title: "Severe heatwave ☀️",
        text: "Temps 40°C+ forecast. Plan of action?",
        fact: "Cooling centers & buddy systems reduce heat deaths.",
        options: [
          { label: "Open cooled community hubs + transport & water.", effects: {Budget:-6, Resilience:+7, Awareness:+5, Equity:+7} },
          { label: "Issue advisories only.", effects: {Budget:-1, Resilience:+2, Awareness:+3, Equity:+1} },
          { label: "No action.", effects: {Budget:+2, Resilience:-6, Awareness:-4, Equity:-3} }
        ]
      },
      {
        title: "Bushfire fuel reduction 🔥",
        text: "High fuel load around town edge.",
        fact: "Planned burns + cultural burning lower risk when done safely.",
        options: [
          { label: "Co-design program with indigenous rangers.", effects: {Budget:-7, Resilience:+8, Awareness:+3, Equity:+6} },
          { label: "Hire contractor; quick perimeter strip.", effects: {Budget:-5, Resilience:+5, Awareness:+1, Equity:-1} },
          { label: "Delay — conditions uncertain.", effects: {Budget:+1, Resilience:-5, Awareness:-2, Equity:-2} }
        ]
      },
      {
        title: "Heat-aware school schedule 🕘",
        text: "Shift activities & add shade.",
        fact: "Adjusting schedules reduces exposure for children.",
        options: [
          { label: "Provide shade sails + cool water breaks.", effects: {Budget:-6, Resilience:+5, Awareness:+5, Equity:+5} },
          { label: "Advise indoor PE only.", effects: {Budget:-1, Resilience:+3, Awareness:+2, Equity:+1} },
          { label: "Business as usual.", effects: {Budget:+1, Resilience:-4, Awareness:-3, Equity:-2} }
        ]
      },
      {
        title: "Neighbor check-in network 🤝",
        text: "Volunteers call vulnerable residents during extremes.",
        fact: "Social ties boost survival and recovery.",
        options: [
          { label: "Train & roster volunteers; priority lists.", effects: {Budget:-3, Resilience:+6, Awareness:+3, Equity:+7} },
          { label: "Ad-hoc only.", effects: {Budget:-1, Resilience:+2, Awareness:+1, Equity:+2} },
          { label: "Skip — privacy concerns.", effects: {Budget:+0, Resilience:-3, Awareness:-2, Equity:-3} }
        ]
      },
      {
        title: "Urban trees 🌳",
        text: "Street greening plan under debate.",
        fact: "Trees cool suburbs and support health.",
        options: [
          { label: "Plant in hottest, lowest-income blocks first.", effects: {Budget:-6, Resilience:+6, Awareness:+2, Equity:+7} },
          { label: "Evenly across all suburbs.", effects: {Budget:-6, Resilience:+5, Awareness:+2, Equity:+1} },
          { label: "Cancel — costs too high now.", effects: {Budget:+3, Resilience:-6, Awareness:-2, Equity:-2} }
        ]
      }
    ]
  };

  function buildBoard(){
    els.board.innerHTML = '';
    for(let i=1;i<=TILE_COUNT;i++){
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.setAttribute('role','gridcell');
      tile.dataset.index = i;
      if(i % 5 === 0) tile.dataset.kind = 'hazard';
      tile.innerHTML = `<span class="idx">${i}</span>`;
      els.board.appendChild(tile);
    }
    // place pawn at 1
    placePawn(1);
  }

  function placePawn(idx){
    qsa('.pawn', els.board).forEach(p => p.remove());
    const tile = qs(`.tile[data-index="${idx}"]`, els.board);
    if(!tile) return;
    const pawn = document.createElement('div');
    pawn.className = 'pawn';
    pawn.setAttribute('aria-label', 'Player position');
    pawn.textContent = '🧭';
    tile.appendChild(pawn);
  }

  function setGauge(name, val){
    const clamped = Math.max(MIN_VAL, Math.min(MAX_VAL, Math.round(val)));
    els.gauges[name].style.width = `${clamped}%`;
    els.outputs[name].textContent = clamped;
    state.gauges[name] = clamped;
  }

  function applyEffects(effects){
    Object.entries(effects).forEach(([k,v]) => setGauge(k, (state.gauges[k] ?? 50) + v * diffScale()));
  }

  function diffScale(){
    // harder difficulty amplifies negatives and reduces positives
    switch(state.difficulty){
      case 'easy': return 1.0;
      case 'normal': return 1.0;
      case 'hard': return 1.2;
    }
    return 1.0;
  }

  function rollDice(){
    const n = Math.floor(rand()*6)+1;
    els.rollResult.textContent = n;
    return n;
  }

  function drawEvent(){
    if(state.deck.length === 0){
      // refill deck by shuffling region events
      state.deck = shuffle([...EVENTS[state.region]]);
    }
    return state.deck.pop();
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(rand()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function openEvent(card){
    els.eventTitle.textContent = card.title;
    els.eventText.textContent = card.text;
    els.factText.textContent = card.fact;
    els.optionBtns.innerHTML = '';
    card.options.forEach((opt, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card';
      b.textContent = opt.label;
      b.addEventListener('click', () => {
        applyEffects(opt.effects);
        els.factBox.open = true;
        btns.roll.disabled = false;
        els.modal.close();
        endTurn();
      });
      els.optionBtns.appendChild(b);
    });
    els.modal.showModal();
  }

  function startGame(){
    // seed RNG
    rand = mulberry32(0xC0FFEE ^ Date.now());
    state.region = els.region.value;
    state.difficulty = els.difficulty.value;
    state.position = 1;
    state.turn = 1;
    state.turnMax = qs('#quickDemo').checked ? 8 : 15;
    state.gauges = { ...START };
    ['Budget','Resilience','Awareness','Equity'].forEach(k => setGauge(k, START[k]));
    buildBoard();
    updateTurnInfo();
    showScreen('play');
  }

  function updateTurnInfo(){
    els.turnInfo.textContent = `Turn ${state.turn}/${state.turnMax}`;
  }

  function endTurn(){
    state.turn++;
    if(state.position >= TILE_COUNT || state.turn > state.turnMax){
      finishGame();
    } else {
      updateTurnInfo();
    }
  }

  function finishGame(){
    showScreen('results');
    const g = state.gauges;
    const passed = g.Budget >= WIN_REQ.Budget && g.Resilience >= WIN_REQ.Resilience &&
                   g.Awareness >= WIN_REQ.Awareness && g.Equity >= WIN_REQ.Equity;
    const grade = passed ? '🏆 Community Resilient' : '🔁 Needs Work';
    const tips = [
      g.Resilience < WIN_REQ.Resilience ? 'Invest earlier in risk reduction.' : 'Great prevention choices.',
      g.Awareness < WIN_REQ.Awareness ? 'Add drills and clear messaging.' : 'Awareness campaigns worked.',
      g.Equity < WIN_REQ.Equity ? 'Target vulnerable groups first.' : 'Inclusive programs paid off.',
      g.Budget < 0 ? 'Balance quick wins with sustainable spend.' : 'Budget held together.'
    ];
    els.resultsCard.innerHTML = `
      <div class="card">
        <h3 style="margin:.25rem 0;">${grade}</h3>
        <p><strong>Region:</strong> ${state.region === 'VN' ? 'Việt Nam 🇻🇳' : 'Australia 🇦🇺'} | <strong>Difficulty:</strong> ${state.difficulty}</p>
        <ul>
          <li>Budget: ${g.Budget}</li>
          <li>Resilience: ${g.Resilience}</li>
          <li>Awareness: ${g.Awareness}</li>
          <li>Equity: ${g.Equity}</li>
        </ul>
        <p><em>Reflections:</em></p>
        <ul>${tips.map(t=>`<li>${t}</li>`).join('')}</ul>
      </div>
    `;
  }

  function showScreen(id){
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[id].classList.add('active');
  }

  // Event listeners
  btns.how.addEventListener('click', () => showScreen('howto'));
  btns.back.addEventListener('click', () => showScreen('menu'));
  btns.start.addEventListener('click', (e) => { e.preventDefault(); startGame(); });
  btns.playAgain.addEventListener('click', startGame);
  btns.toMenu.addEventListener('click', () => showScreen('menu'));
  btns.roll.addEventListener('click', () => {
    btns.roll.disabled = true;
    const n = rollDice();
    state.position = Math.min(TILE_COUNT, state.position + n);
    placePawn(state.position);
    setTimeout(() => {
      openEvent(drawEvent());
    }, 300);
  });
  btns.contrast.addEventListener('click', (e) => {
    const pressed = e.currentTarget.getAttribute('aria-pressed') === 'true';
    e.currentTarget.setAttribute('aria-pressed', String(!pressed));
    document.documentElement.classList.toggle('high-contrast');
  });

  // Build initial board
  buildBoard();
})();