<script lang="ts">
  export let text: string | null = null;
  /** Same hero image the home screen paints, so the bubble can sit on its top edge. */
  export let imageSrc = 'build/images/boy.png';

  // Measured from the hero PNGs: artwork starts at the top edge of each file.
  const HERO_ASPECT = {
    boy: 629 / 800,
    girl: 653 / 800
  };

  $: isGirl = imageSrc.includes('girl');
  $: imageAspect = isGirl ? HERO_ASPECT.girl : HERO_ASPECT.boy;
</script>

{#if text}
  <div class="speech-wrap" style="--hero-aspect: {imageAspect}">
    <div class="hero-anchor">
      <div class="speech-bubble" class:girl={isGirl} role="status" aria-live="polite">
        <p class="speech-text">{text}</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .speech-wrap {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    container-type: size;
    overflow: visible;
  }

  /* Same box as background-size: contain; background-position: center. */
  .hero-anchor {
    position: relative;
    aspect-ratio: var(--hero-aspect);
    width: min(100cqw, calc(100cqh * var(--hero-aspect)));
    flex: none;
  }

  .speech-bubble {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 14px);
    transform: translateX(-50%);
    width: 92%;
    max-width: 22rem;
    background: #163a5f;
    color: #ffffff;
    border-radius: 1.45rem;
    padding: 1.05rem 1.45rem 1.2rem;
    box-shadow: 0 6px 16px rgba(10, 30, 50, 0.28);
    text-align: center;
  }

  .speech-bubble::after {
    content: '';
    position: absolute;
    left: auto;
    right: 18%;
    bottom: -14px;
    border-width: 16px 13px 0 9px;
    border-style: solid;
    border-color: #163a5f transparent transparent transparent;
  }

  .speech-bubble.girl {
    background: #eccdf7;
    color: #2f153a;
    border-radius: 999px;
    padding: 1.25rem 1.65rem 1.35rem;
    box-shadow: none;
  }

  .speech-bubble.girl::after {
    left: 26%;
    right: auto;
    border-color: #eccdf7 transparent transparent transparent;
  }

  .speech-text {
    margin: 0;
    font-size: clamp(15px, 4.2vw, 22px);
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
  }

  .speech-bubble.girl .speech-text {
    color: #2f153a;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.25;
  }

  .speech-bubble:not(.girl) {
    background: #d6eefb;
    color: #0c273a;
    border-radius: 999px;
    padding: 1.25rem 1.65rem 1.35rem;
    box-shadow: none;
  }

  .speech-bubble:not(.girl)::after {
    left: 26%;
    right: auto;
    border-color: #d6eefb transparent transparent transparent;
  }

  .speech-bubble:not(.girl) .speech-text {
    color: #0c273a;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.25;
  }
</style>
