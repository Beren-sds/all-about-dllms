<script>
  // Toy serving-cost model from the tutorial's break-even arithmetic:
  //   AR with exact cache:       cost ~ sum_i i           = L^2 / 2
  //   full-canvas dLLM, no cache: cost ~ N * L^2
  //   block dLLM, cross-block cache: outer loop over L/B blocks; each of the
  //   N_b within-block steps attends B x (position in sequence) ~ N_b * B * L
  // Attention-only accounting; constants and MLP costs ignored on purpose.
  let L = $state(1024);
  let N = $state(64);
  let B = $state(32);

  let arCost = $derived((L * L) / 2);
  let fullCost = $derived(N * L * L);
  // per block: N_b steps, each ~ B tokens attending to full prefix ~ L
  let nb = $derived(Math.max(1, Math.round(N / (L / B))));
  let blockCost = $derived((L / B) * nb * B * L);

  let max = $derived(Math.max(arCost, fullCost, blockCost));
  const fmt = (v) => (v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.round(v).toLocaleString());
</script>

<div class="widget">
  <div class="widget-title">Break-even calculator · attention-cost toy model</div>
  <div class="inputs">
    <label>sequence length L
      <input type="range" min="7" max="12" step="1" value={Math.log2(L)} oninput={(e) => (L = 2 ** +e.target.value)} />
      <b>{L}</b>
    </label>
    <label>diffusion steps N
      <input type="range" min="2" max="10" step="1" value={Math.log2(N)} oninput={(e) => (N = 2 ** +e.target.value)} />
      <b>{N}</b>
    </label>
    <label>block size B
      <input type="range" min="3" max="8" step="1" value={Math.log2(B)} oninput={(e) => (B = 2 ** +e.target.value)} />
      <b>{B}</b>
    </label>
  </div>

  <div class="bars">
    {#each [
      { name: `AR, exact cache (${L} steps)`, v: arCost, c: 'var(--indigo)' },
      { name: `full-canvas dLLM, no cache (${N} steps)`, v: fullCost, c: 'var(--teal)' },
      { name: `block dLLM, cross-block cache (${nb} steps/block)`, v: blockCost, c: 'var(--amber)' },
    ] as row}
      <div class="bar">
        <span class="name">{row.name}</span>
        <div class="track"><div class="fill" style={`width:${(row.v / max) * 100}%; background:${row.c}`}></div></div>
        <span class="val">{fmt(row.v)}</span>
      </div>
    {/each}
  </div>

  <p class="verdict">
    {#if fullCost < arCost}
      At N = {N} steps the cache-free dLLM does less attention work than cached AR;
      whether that wins wall-clock depends on hardware utilization.
    {:else}
      At N = {N} steps the cache-free dLLM does {(fullCost / arCost).toFixed(1)}x the attention work of
      cached AR; parallelism per step has to make up the difference.
    {/if}
  </p>
  <p class="note">
    Toy accounting: attention FLOPs only, no constants, no MLP, no batching effects.
    It reproduces the structure of the trade, not any system's absolute numbers.
  </p>
</div>

<style>
  .inputs { display: grid; gap: 0.4rem; margin-bottom: 1rem; font-family: var(--sans); font-size: 0.85rem; }
  .inputs label { display: grid; grid-template-columns: 11rem 1fr 3.2rem; align-items: center; gap: 0.7rem; }
  .bars { display: grid; gap: 0.45rem; }
  .bar { display: grid; grid-template-columns: 17rem 1fr 4rem; gap: 0.7rem; align-items: center; font-family: var(--sans); font-size: 0.8rem; }
  .track { background: #eef1f5; border-radius: 4px; height: 0.85rem; overflow: hidden; }
  .fill { height: 100%; border-radius: 4px; transition: width 0.2s ease; }
  .val { text-align: right; color: var(--gray); }
  .verdict { font-size: 0.92rem; margin: 0.8rem 0 0.2rem; }
  .note { font-size: 0.8rem; color: var(--gray); margin: 0; }
  @media (max-width: 640px) {
    .inputs label { grid-template-columns: 8rem 1fr 3rem; }
    .bar { grid-template-columns: 9rem 1fr 3.4rem; }
  }
</style>
