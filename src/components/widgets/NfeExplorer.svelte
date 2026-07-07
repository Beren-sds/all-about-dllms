<script>
  // Measured NFE / quality / wall-clock curves from the tiny-dLLM run
  // (sampling.json is the model's own output; AR references included).
  import s from '../../data/sampling.json';

  let judgeGaming = $state(false);
  let hover = $state(null); // {panel, i}

  const series = [
    { key: 'genppl_confidence', name: 'confidence', color: 'var(--rose)' },
    { key: 'genppl_noisy', name: 'noisy confidence', color: 'var(--teal)' },
    { key: 'genppl_random', name: 'random', color: 'var(--amber)' },
  ];

  const W = 320, H = 200, PAD = 40;
  const nfes = s.nfe;

  function lx(n) {
    const lo = Math.log2(nfes[0]), hi = Math.log2(nfes[nfes.length - 1]);
    return PAD + ((Math.log2(n) - lo) / (hi - lo)) * (W - PAD - 12);
  }
  // left panel y: log scale over genPPL range incl. references
  const allP = [...s.genppl_confidence, ...s.genppl_noisy, ...s.genppl_random, s.genppl_ar_samples, s.genppl_real_text];
  const pLo = Math.log10(Math.min(...allP)), pHi = Math.log10(Math.max(...allP));
  function ly(v) { return 16 + (1 - (Math.log10(v) - pLo) / (pHi - pLo)) * (H - 46); }
  // right panel y: log scale over seconds
  const allT = [...s.seconds_noisy, s.seconds_ar];
  const tLo = Math.log10(Math.min(...allT)), tHi = Math.log10(Math.max(...allT));
  function ty(v) { return 16 + (1 - (Math.log10(v) - tLo) / (tHi - tLo)) * (H - 46); }
</script>

<div class="widget">
  <div class="widget-title">The compute knob, measured (64 samples x 256 chars per point)</div>
  <div class="panels">
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="generative perplexity vs NFE">
        {#each series as sr}
          <polyline
            points={nfes.map((n, i) => `${lx(n)},${ly(s[sr.key][i])}`).join(' ')}
            fill="none" stroke={sr.color} stroke-width="1.6"
          />
          {#each nfes as n, i}
            <circle
              cx={lx(n)} cy={ly(s[sr.key][i])} r="3.5" fill={sr.color}
              onmouseenter={() => (hover = { key: sr.key, i })}
              onmouseleave={() => (hover = null)}
              role="presentation"
            />
          {/each}
        {/each}
        <line x1={PAD} x2={W - 12} y1={ly(s.genppl_ar_samples)} y2={ly(s.genppl_ar_samples)}
              stroke="var(--indigo)" stroke-dasharray="5 3" stroke-width={judgeGaming ? 2.4 : 1.1} />
        <line x1={PAD} x2={W - 12} y1={ly(s.genppl_real_text)} y2={ly(s.genppl_real_text)}
              stroke="var(--gray)" stroke-dasharray="2 3" stroke-width={judgeGaming ? 2.4 : 1.1} />
        <text x={W - 14} y={ly(s.genppl_ar_samples) - 4} text-anchor="end" class="lab" fill="var(--indigo)">AR self-samples {s.genppl_ar_samples.toFixed(1)}</text>
        <text x={W - 14} y={ly(s.genppl_real_text) - 4} text-anchor="end" class="lab" fill="var(--gray)">real text {s.genppl_real_text.toFixed(1)}</text>
        {#each nfes as n}
          <text x={lx(n)} y={H - 8} text-anchor="middle" class="lab">{n}</text>
        {/each}
        <text x={PAD - 4} y="12" class="lab">genPPL (log)</text>
        {#if hover}
          <text x={lx(nfes[hover.i])} y={ly(s[hover.key][hover.i]) - 8} text-anchor="middle" class="tipnum">{s[hover.key][hover.i].toFixed(1)}</text>
        {/if}
      </svg>
      <figcaption>quality vs steps: NFE 1 means fully independent draws (the multimodality problem); more steps, better joint structure</figcaption>
    </figure>

    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="sampling wall-clock vs NFE">
        <polyline
          points={nfes.map((n, i) => `${lx(n)},${ty(s.seconds_noisy[i])}`).join(' ')}
          fill="none" stroke="var(--teal)" stroke-width="1.6"
        />
        {#each nfes as n, i}
          <circle cx={lx(n)} cy={ty(s.seconds_noisy[i])} r="3.5" fill="var(--teal)" />
        {/each}
        <line x1={PAD} x2={W - 12} y1={ty(s.seconds_ar)} y2={ty(s.seconds_ar)}
              stroke="var(--indigo)" stroke-dasharray="5 3" />
        <text x={W - 14} y={ty(s.seconds_ar) - 4} text-anchor="end" class="lab" fill="var(--indigo)">AR sequential {s.seconds_ar}s</text>
        {#each nfes as n}
          <text x={lx(n)} y={H - 8} text-anchor="middle" class="lab">{n}</text>
        {/each}
        <text x={PAD - 4} y="12" class="lab">wall-clock s (log)</text>
      </svg>
      <figcaption>latency vs steps: the dLLM undercuts its AR twin up to NFE 128 on this hardware</figcaption>
    </figure>
  </div>

  <label class="toggle">
    <input type="checkbox" bind:checked={judgeGaming} />
    who out-Shakespeares Shakespeare?
  </label>
  {#if judgeGaming}
    <p class="note">
      Look at the two reference lines: the AR judge scores its <em>own</em> samples
      ({s.genppl_ar_samples.toFixed(1)}) as more probable than genuine held-out Shakespeare
      ({s.genppl_real_text.toFixed(1)}). Generative perplexity rewards low-entropy samplers,
      which is why it must never be reported without a diversity measure.
    </p>
  {/if}
</div>

<style>
  .panels { display: flex; gap: 1rem; flex-wrap: wrap; }
  figure { flex: 1; min-width: 17rem; margin: 0; }
  svg { width: 100%; height: auto; }
  .lab { font-family: var(--sans); font-size: 9.5px; fill: var(--gray); }
  .tipnum { font-family: var(--sans); font-size: 10px; font-weight: 700; fill: var(--ink); }
  figcaption { font-size: 0.8rem; color: var(--gray); }
  .toggle { font-family: var(--sans); font-size: 0.88rem; display: inline-flex; gap: 0.4rem; align-items: center; margin-top: 0.6rem; cursor: pointer; }
  .note { font-size: 0.9rem; background: var(--wash-rose); border-radius: 6px; padding: 0.6rem 0.8rem; }
</style>
