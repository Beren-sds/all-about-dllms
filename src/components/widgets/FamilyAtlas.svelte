<script>
  import data from '../../data/families.json';
  import refs from '../../data/refs.json';

  let mode = $state('atlas'); // 'atlas' | 'quiz'
  let selected = $state('masked');
  let fam = $derived(data.families.find((f) => f.id === selected));

  // quiz state
  let qi = $state(0);
  let picks = $state({ state: '', granularity: '', provenance: '' });
  let graded = $state(false);
  let score = $state(0);
  let q = $derived(data.quiz[qi]);

  const stateOpts = data.axes[0].values;
  const granOpts = data.axes[1].values;
  const provOpts = data.axes[2].values;

  function grade() {
    graded = true;
    if (
      picks.state === q.answer.state &&
      picks.granularity === q.answer.granularity &&
      picks.provenance === q.answer.provenance
    ) score += 1;
  }
  function next() {
    qi = (qi + 1) % data.quiz.length;
    picks = { state: '', granularity: '', provenance: '' };
    graded = false;
    if (qi === 0) score = 0;
  }
  function ok(axis) { return picks[axis] === q.answer[axis]; }
</script>

<div class="widget">
  <div class="widget-title">The family atlas · four axes classify every dLLM</div>

  <div class="modes">
    <button class:active={mode === 'atlas'} onclick={() => (mode = 'atlas')}>explore</button>
    <button class:active={mode === 'quiz'} onclick={() => (mode = 'quiz')}>quiz: read the coordinates</button>
  </div>

  {#if mode === 'atlas'}
    <div class="tree">
      {#each data.families as f}
        <button
          class="chip" class:sel={selected === f.id}
          style={`--c:${f.color}`}
          onclick={() => (selected = f.id)}
        >{f.name}</button>
      {/each}
    </div>

    <div class="card" style={`--c:${fam.color}`}>
      <h4>{fam.name}</h4>
      <dl>
        <dt>State space</dt><dd>{fam.state}</dd>
        <dt>Granularity</dt><dd>{fam.granularity}</dd>
        <dt>Likelihood</dt><dd>{fam.likelihood}</dd>
        <dt>KV cache</dt><dd>{fam.cache}</dd>
        <dt>Output length</dt><dd>{fam.length}</dd>
        <dt>Self-correction</dt><dd>{fam.selfCorrection}</dd>
        <dt>Provenance seen</dt><dd>{fam.provenanceSeen}</dd>
        <dt>Exemplars</dt><dd>{fam.exemplars.join(', ')}</dd>
      </dl>
      <p class="when"><strong>Choose when:</strong> {fam.chooseWhen}</p>
      <p class="refs">
        {#each fam.refs as r, i}
          <a href={refs[r]?.arxiv ? `https://arxiv.org/abs/${refs[r].arxiv}` : refs[r]?.url} target="_blank" rel="noopener">{refs[r]?.authors ?? r}</a>{i < fam.refs.length - 1 ? ' · ' : ''}
        {/each}
      </p>
    </div>
  {:else}
    <div class="quiz">
      <p class="prompt">
        <span class="qnum">{qi + 1} / {data.quiz.length}</span>
        Give the coordinates of <strong>{q.model}</strong>:
      </p>
      <div class="axes">
        <label>state space
          <select bind:value={picks.state} disabled={graded}>
            <option value="">choose…</option>
            {#each stateOpts as o}<option>{o}</option>{/each}
          </select>
          {#if graded}<span class={ok('state') ? 'yes' : 'no'}>{ok('state') ? '✓' : `✗ ${q.answer.state}`}</span>{/if}
        </label>
        <label>granularity
          <select bind:value={picks.granularity} disabled={graded}>
            <option value="">choose…</option>
            {#each granOpts as o}<option>{o}</option>{/each}
          </select>
          {#if graded}<span class={ok('granularity') ? 'yes' : 'no'}>{ok('granularity') ? '✓' : `✗ ${q.answer.granularity}`}</span>{/if}
        </label>
        <label>provenance
          <select bind:value={picks.provenance} disabled={graded}>
            <option value="">choose…</option>
            {#each provOpts as o}<option>{o}</option>{/each}
          </select>
          {#if graded}<span class={ok('provenance') ? 'yes' : 'no'}>{ok('provenance') ? '✓' : `✗ ${q.answer.provenance}`}</span>{/if}
        </label>
      </div>
      {#if !graded}
        <button class="go" onclick={grade} disabled={!picks.state || !picks.granularity || !picks.provenance}>grade</button>
      {:else}
        <p class="explain">{q.explain}</p>
        <button class="go" onclick={next}>{qi === data.quiz.length - 1 ? `finish (score ${score}/${data.quiz.length})` : 'next model'}</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .modes { display: inline-flex; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; margin-bottom: 0.9rem; font-family: var(--sans); font-size: 0.85rem; }
  .modes button { border: none; background: #fff; padding: 0.32rem 0.8rem; font: inherit; cursor: pointer; color: var(--gray); }
  .modes button.active { background: var(--plum); color: #fff; }

  .tree { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.9rem; }
  .chip { font-family: var(--sans); font-size: 0.85rem; border: 1.5px solid var(--c); color: var(--c); background: #fff; border-radius: 999px; padding: 0.28rem 0.8rem; cursor: pointer; }
  .chip.sel { background: var(--c); color: #fff; }

  .card { border: 1px solid var(--c); border-left: 5px solid var(--c); border-radius: 8px; padding: 0.8rem 1rem; }
  .card h4 { margin: 0 0 0.5rem; font-family: var(--sans); color: var(--c); }
  dl { display: grid; grid-template-columns: 9rem 1fr; gap: 0.15rem 0.8rem; margin: 0; font-size: 0.9rem; }
  dt { font-family: var(--sans); color: var(--gray); font-size: 0.8rem; }
  dd { margin: 0; }
  .when { font-size: 0.9rem; margin: 0.7rem 0 0.2rem; }
  .refs { font-size: 0.8rem; margin: 0.2rem 0 0; font-family: var(--sans); }

  .quiz .prompt { font-size: 0.98rem; }
  .qnum { font-family: var(--sans); font-size: 0.75rem; color: var(--amber); font-weight: 700; margin-right: 0.5rem; }
  .axes { display: grid; gap: 0.55rem; }
  .axes label { font-family: var(--sans); font-size: 0.85rem; display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
  .axes select { font: inherit; }
  .yes { color: var(--teal); font-weight: 700; }
  .no { color: var(--rose); font-weight: 700; }
  .go { margin-top: 0.8rem; border: 1px solid var(--plum); color: var(--plum); background: #fff; border-radius: 6px; padding: 0.3rem 0.9rem; font-family: var(--sans); cursor: pointer; }
  .go:disabled { opacity: 0.45; cursor: default; }
  .explain { background: var(--wash-blue); border-radius: 6px; padding: 0.6rem 0.8rem; font-size: 0.92rem; }
</style>
