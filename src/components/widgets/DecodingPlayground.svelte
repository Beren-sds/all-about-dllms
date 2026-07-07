<script>
  // Replays real decodes of the 1.85M-parameter tiny MDLM.
  // Data: src/data/trajectories/{policy}_{nfe}.json, exported by the model
  // itself (export_traj.py); nothing here is a scripted animation.
  const modules = import.meta.glob('../../data/trajectories/*.json', { eager: true });

  let { compact = false, autoplay = false } = $props();

  const POLICIES = [
    { id: 'confidence', name: 'confidence' },
    { id: 'noisy', name: 'noisy confidence' },
    { id: 'random', name: 'random order' },
  ];
  const NFES = [4, 8, 16, 32, 64];

  let policy = $state('noisy');
  let nfe = $state(compact ? 16 : 32);
  let step = $state(0);
  let playing = $state(autoplay);
  let timer = null;

  function traj() {
    const key = `../../data/trajectories/${policy}_${nfe}.json`;
    return modules[key]?.default ?? modules[key];
  }

  let current = $derived(traj());
  let frame = $derived(current.steps[Math.min(step, current.steps.length - 1)]);
  let committedSet = $derived(new Set(frame.committed));
  let maskChar = $derived(current.mask_char);

  function reset() { step = 0; }
  $effect(() => { policy; nfe; reset(); });

  $effect(() => {
    if (playing) {
      timer = setInterval(() => {
        step = (step + 1) % current.steps.length;
      }, 380);
      return () => clearInterval(timer);
    }
  });

  function cellKind(ch, i) {
    if (ch === maskChar) return 'mask';
    if (committedSet.has(i)) return 'new';
    return 'set';
  }
</script>

<div class="widget" class:compact>
  <div class="widget-title">Decoding playground · real replays of a 1.85M-param dLLM</div>

  <div class="controls">
    <span class="grp">
      {#each POLICIES as p}
        <button class:active={policy === p.id} onclick={() => (policy = p.id)}>{p.name}</button>
      {/each}
    </span>
    <label>
      NFE
      <select bind:value={nfe}>
        {#each NFES as n}<option value={n}>{n}</option>{/each}
      </select>
    </label>
    <button class="play" onclick={() => (playing = !playing)}>{playing ? 'pause' : 'play'}</button>
  </div>

  <div class="canvas" style={`--cols:${compact ? 32 : 32}`}>
    {#each frame.canvas.split('') as ch, i}
      <span class={cellKind(ch, i)}>{ch === maskChar ? '' : ch === ' ' ? ' ' : ch}</span>
    {/each}
  </div>

  <div class="scrub">
    <input
      type="range"
      min="0"
      max={current.steps.length - 1}
      bind:value={step}
      aria-label="decoding step"
    />
    <span class="lbl">step {step + 1} / {current.steps.length} · {frame.committed.length} tokens committed this step</span>
  </div>
</div>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 0.7rem; align-items: center; font-family: var(--sans); font-size: 0.85rem; margin-bottom: 0.7rem; }
  .grp { display: inline-flex; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; }
  .grp button { border: none; background: #fff; padding: 0.3rem 0.65rem; font: inherit; cursor: pointer; color: var(--gray); }
  .grp button.active { background: var(--teal); color: #fff; }
  select { font: inherit; }
  .play { border: 1px solid var(--teal); color: var(--teal); background: #fff; border-radius: 6px; padding: 0.28rem 0.8rem; font: inherit; cursor: pointer; }

  .canvas {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow: hidden;
    font-family: var(--mono);
    font-size: 0.72rem;
    line-height: 1.5;
  }
  .canvas span { background: #fff; text-align: center; min-height: 1.15rem; }
  .canvas span.mask { background: #e7ebf1; }
  .canvas span.new { background: #f6dfb9; animation: flash 0.45s ease-out; }
  @keyframes flash { from { background: var(--amber); color: #fff; } }

  .scrub { display: flex; align-items: center; gap: 0.7rem; margin-top: 0.6rem; font-family: var(--sans); font-size: 0.8rem; color: var(--gray); }
  .scrub input { flex: 1; }
  .compact .canvas { font-size: 0.62rem; }
</style>
