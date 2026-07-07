<script>
  // The AR <-> diffusion dial. Attention mask morphs with block size B;
  // the marker tracks the measured BD3-LM perplexity bounds (Tables 3-4).
  import bd3lm from '../../data/bd3lm.json';

  const STOPS = [
    { b: 1, label: 'B = 1 (AR)', key: 'ar' },
    { b: 4, label: 'B = 4', key: 'b4' },
    { b: 8, label: 'B = 8', key: 'b8' },
    { b: 16, label: 'B = 16', key: 'b16' },
    { b: 256, label: 'B = L (MDLM)', key: 'mdlm' },
  ];

  let idx = $state(2);
  let dataset = $state('lm1b');
  let stop = $derived(STOPS[idx]);

  const N = 16; // grid size for the mask drawing
  function attends(q, k, b) {
    if (b === 1) return k <= q;                    // causal
    if (b >= N) return true;                       // full bidirectional
    return Math.floor(k / b) <= Math.floor(q / b); // block-causal
  }
  // scale B stops onto the 16x16 grid for drawing
  const DRAW_B = { 1: 1, 4: 2, 8: 4, 16: 8, 256: 16 };

  let curve = $derived(bd3lm[dataset]);
  let ppl = $derived(curve[stop.key]);

  // svg plot geometry
  const W = 300, H = 170, PAD = 34;
  let vals = $derived(STOPS.map((s) => curve[s.key]));
  let lo = $derived(Math.min(...vals)), hi = $derived(Math.max(...vals));
  function xy(i, v) {
    const x = PAD + (i / (STOPS.length - 1)) * (W - PAD - 10);
    const y = H - 24 - ((v - lo) / (hi - lo)) * (H - 50);
    return [x, y];
  }
</script>

<div class="widget">
  <div class="widget-title">The block dial · measured, not sketched</div>

  <div class="row">
    <div class="mask">
      <div class="grid" style={`--n:${N}`}>
        {#each Array(N) as _, q}
          {#each Array(N) as _, k}
            <span class:on={attends(q, k, DRAW_B[stop.b])}></span>
          {/each}
        {/each}
      </div>
      <div class="cap">attention mask ({stop.b === 1 ? 'causal' : stop.b >= 256 ? 'fully bidirectional' : 'block-causal'})</div>
    </div>

    <div class="plot">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="perplexity vs block size">
        <polyline
          points={STOPS.map((s, i) => xy(i, curve[s.key]).join(',')).join(' ')}
          fill="none" stroke="var(--gray)" stroke-width="1.2"
        />
        {#each STOPS as s, i}
          {@const [x, y] = xy(i, curve[s.key])}
          {#if s.key === 'ar'}
            <rect x={x - 4} y={y - 4} width="8" height="8" fill="var(--indigo)" />
          {:else}
            <circle cx={x} cy={y} r="4.5" fill="#fff" stroke="var(--teal)" stroke-width="1.6" />
          {/if}
          <text x={x} y={H - 8} text-anchor="middle" class="tick">{s.b === 256 ? 'L' : s.b}</text>
        {/each}
        {#each [xy(idx, ppl)] as [mx, my]}
          <circle cx={mx} cy={my} r="8" fill="none" stroke="var(--amber)" stroke-width="2.5" />
        {/each}
        <text x={PAD - 6} y="14" class="axis">test PPL</text>
      </svg>
      <div class="readout">
        {stop.label}: <strong>{stop.key === 'ar' ? '' : '≤ '}{ppl.toFixed(2)}</strong>
        {stop.key === 'ar' ? '(exact NLL)' : '(ELBO upper bound)'}
      </div>
    </div>
  </div>

  <div class="controls">
    <input type="range" min="0" max={STOPS.length - 1} step="1" bind:value={idx} aria-label="block size" />
    <span class="grp">
      <button class:active={dataset === 'lm1b'} onclick={() => (dataset = 'lm1b')}>LM1B</button>
      <button class:active={dataset === 'owt'} onclick={() => (dataset = 'owt')}>OpenWebText</button>
    </span>
  </div>
  <p class="note">
    Smaller blocks buy a tighter likelihood and an exact cross-block KV cache; larger blocks buy
    more tokens per parallel step. Every value is from the Block Diffusion paper's own tables;
    diffusion entries are upper bounds, so their true NLLs are unknown but no worse.
  </p>
</div>

<style>
  .row { display: flex; gap: 1.2rem; flex-wrap: wrap; align-items: flex-start; }
  .mask { flex: 0 0 12rem; }
  .grid { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; }
  .grid span { background: #fff; aspect-ratio: 1; display: block; }
  .grid span.on { background: var(--plum); opacity: 0.75; }
  .cap { font-family: var(--sans); font-size: 0.75rem; color: var(--gray); margin-top: 0.35rem; text-align: center; }
  .plot { flex: 1; min-width: 16rem; }
  svg { width: 100%; height: auto; }
  .tick { font-family: var(--sans); font-size: 10px; fill: var(--gray); }
  .axis { font-family: var(--sans); font-size: 10px; fill: var(--gray); }
  .readout { font-family: var(--sans); font-size: 0.92rem; margin-top: 0.2rem; }
  .controls { display: flex; align-items: center; gap: 1rem; margin-top: 0.8rem; }
  .controls input { flex: 1; }
  .grp { display: inline-flex; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; font-family: var(--sans); font-size: 0.82rem; }
  .grp button { border: none; background: #fff; padding: 0.28rem 0.6rem; font: inherit; cursor: pointer; color: var(--gray); }
  .grp button.active { background: var(--indigo); color: #fff; }
  .note { font-size: 0.85rem; color: var(--gray); margin-bottom: 0; }
</style>
