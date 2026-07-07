export interface Chapter {
  slug: string;
  n: number;
  title: string;
  hook: string;
}

export const chapters: Chapter[] = [
  {
    slug: '1-two-ways',
    n: 1,
    title: 'Two Ways to Write a Sentence',
    hook: 'One design question separates GPT from a dLLM: in what order, given what context, are tokens decided?',
  },
  {
    slug: '2-masked-diffusion',
    n: 2,
    title: 'How Masked Diffusion Works',
    hook: 'The whole objective collapses to a weighted fill-in-the-blanks loss, and that is its superpower.',
  },
  {
    slug: '3-origins',
    n: 3,
    title: 'Where dLLMs Came From',
    hook: 'Parallel decoding existed by 2019. Diffusion supplied the missing warrant, and flow matching re-derived it.',
  },
  {
    slug: '4-decoding',
    n: 4,
    title: 'The Decoding Playground',
    hook: 'Watch a real model fill a canvas of masks, and see why the number of steps is the knob that matters.',
  },
  {
    slug: '5-block-dial',
    n: 5,
    title: 'The Block Dial',
    hook: 'AR and diffusion are endpoints of one slider. Drag it and watch the attention mask and perplexity move.',
  },
  {
    slug: '6-family-atlas',
    n: 6,
    title: 'The Family Atlas',
    hook: 'Four axes classify every dLLM ever shipped. Learn to read coordinates off a press release.',
  },
  {
    slug: '7-making-useful',
    n: 7,
    title: 'Making dLLMs Useful',
    hook: 'Scaling laws, RL on a bound, and the serving arithmetic that decides whether diffusion is actually faster.',
  },
  {
    slug: '8-applications',
    n: 8,
    title: 'Where dLLMs Earn Their Keep',
    hook: 'Code, proteins, and pixels adopt dLLMs where an AR weakness is structural to the domain, plus what remains unsolved.',
  },
  {
    slug: '9-safety',
    n: 9,
    title: 'Safety When Decoding Is Parallel',
    hook: 'Every dLLM capability has a safety dual. Mask-infilling attacks exploit exactly what makes dLLMs good.',
  },
  {
    slug: '10-cheat-sheet',
    n: 10,
    title: 'The Cheat Sheet',
    hook: 'Twelve numbers, five equations, one decision helper, and where to go deeper.',
  },
];

export function prevNext(slug: string) {
  const i = chapters.findIndex((c) => c.slug === slug);
  return {
    prev: i > 0 ? chapters[i - 1] : null,
    next: i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null,
  };
}
