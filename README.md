# All You Need to Know About dLLMs

An interactive web tutorial on diffusion language models: hub + 9 chapters
covering the AR-vs-diffusion anchor, the masked-diffusion objective, the
prehistory and the flow-matching road, decoding, the block dial, the family
taxonomy, scaling/post-training/serving, safety, and a cheat sheet.

Curated from the long-form LaTeX tutorial *The Past and Present of Text
Diffusion Models* (90pp PDF), which remains the source of truth for all
claims, derivations, and the annotated bibliography.

## What makes it interactive

Five widgets, all driven by real data committed under `src/data/`:

- **Decoding playground**: replays actual step-by-step decodes of a
  1.85M-parameter character-level masked dLLM (trajectories exported from the
  trained checkpoint; see `src/data/trajectories/`).
- **Block dial**: attention-mask morphing + the measured BD3-LM perplexity
  curves (paper Tables 3-4).
- **NFE explorer**: measured quality/latency curves from the tiny model's
  sampling runs (`src/data/sampling.json`).
- **Family atlas**: identity cards + a "read the coordinates" quiz.
- **Break-even calculator**: the serving cost toy model.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # static build to dist/
npm run check      # content gate: banned strings, broken links, data validity
```

Stack: Astro 5 + Svelte islands + MDX with KaTeX (build-time math). Deploys to
GitHub Pages via `.github/workflows/deploy.yml`; set `site` in
`astro.config.mjs` to the Pages origin before first deploy.

## Data provenance

Every cited number traces to a verified arXiv source (`src/data/refs.json`).
The tiny-model data comes from the companion tutorial's `code/tiny_dllm.py`
(training) and `code/export_traj.py` (trajectory export); regenerating them
requires PyTorch and about half an hour on Apple silicon.
