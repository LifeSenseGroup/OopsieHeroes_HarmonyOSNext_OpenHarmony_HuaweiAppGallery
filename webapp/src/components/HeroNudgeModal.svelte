<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import {
    playHeroNudgeSound,
    recordHeroNudgeSound,
    stopHeroNudgeSound,
    stopRecordHeroNudgeSound
  } from '../utils/NativeBridge';

  export let open = false;

  const dispatch = createEventDispatcher<{ close: undefined; saved: undefined }>();
  const HERO_NUDGE_FILENAME = 'hero_nudge_voice.wav';
  const PREVIEW_DURATION_MS = 30_000;

  let isRecording = false;
  let canPreview = false;
  let previewStopTimer: ReturnType<typeof setTimeout> | null = null;

  function clearPreviewStopTimer() {
    if (previewStopTimer) {
      clearTimeout(previewStopTimer);
      previewStopTimer = null;
    }
  }

  $: if (!open) {
    isRecording = false;
    clearPreviewStopTimer();
  }

  onDestroy(() => {
    clearPreviewStopTimer();
    stopHeroNudgeSound();
  });

  function closeModal() {
    if (isRecording) {
      stopRecording();
    }
    clearPreviewStopTimer();
    stopHeroNudgeSound();
    dispatch('close');
  }

  function startRecording() {
    if (isRecording) return;
    clearPreviewStopTimer();
    stopHeroNudgeSound();
    isRecording = true;
    recordHeroNudgeSound(HERO_NUDGE_FILENAME);
  }

  function stopRecording() {
    if (!isRecording) return;
    stopRecordHeroNudgeSound();
    isRecording = false;
    canPreview = true;
  }

  function playPreview() {
    if (!canPreview || isRecording) return;
    clearPreviewStopTimer();
    stopHeroNudgeSound();
    playHeroNudgeSound(0.33);
    previewStopTimer = setTimeout(() => {
      stopHeroNudgeSound();
      previewStopTimer = null;
    }, PREVIEW_DURATION_MS);
  }

  function saveNudge() {
    localStorage.setItem('heroNudgeVoicePath', HERO_NUDGE_FILENAME);
    localStorage.setItem('heroNudgeVoiceSaved', 'true');
    localStorage.setItem('heroNudgeEnabled', 'true');
    dispatch('saved');
    dispatch('close');
  }
</script>

{#if open}
  <div class="modal-overlay" role="dialog" aria-modal="true" aria-label={$_('heroNudge.title')}>
    <div class="sheet">
      <div class="sheet-content">
        <div class="drag-handle" />
        <div class="header-row">
          <h2>{$_('heroNudge.title')}</h2>
          <button class="close-btn" type="button" aria-label={$_('heroNudge.close')} on:click={closeModal}>×</button>
        </div>
        <p class="instructions">{$_('heroNudge.instructions')}</p>
        <div class="script-box">
          {$_('heroNudge.line1')}
          <br /><br />
          {$_('heroNudge.line2')}
          <br /><br />
          {$_('heroNudge.line3')}
          <br /><br />
          {$_('heroNudge.line4')}
          <br /><br />
          {$_('heroNudge.line5')}
        </div>

        <div class="record-actions">
          {#if isRecording}
            <button class="mic-btn stop" type="button" on:click={stopRecording}>■ {$_('heroNudge.stop')}</button>
          {:else}
            <button class="mic-btn" type="button" on:click={startRecording}>● {$_('heroNudge.record')}</button>
          {/if}
        </div>

        <div class="secondary-actions">
          <button class="secondary-btn" type="button" on:click={playPreview}>{$_('heroNudge.preview')}</button>
          <button class="save-btn" type="button" on:click={saveNudge}>{$_('heroNudge.save')}</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10010;
    background: rgba(3, 10, 24, 0.72);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .sheet {
    width: 100%;
    height: calc(70vh + 38px);
    background: linear-gradient(180deg, rgba(8, 24, 46, 0.98), rgba(17, 45, 86, 0.98));
    color: #eef6ff;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    border: 1px solid rgba(166, 209, 255, 0.45);
    box-shadow: 0 -18px 44px rgba(0, 0, 0, 0.45);
    padding: 14px 20px 24px;
    overflow-y: auto;
  }

  .drag-handle {
    width: 52px;
    height: 5px;
    border-radius: 99px;
    background: rgba(201, 223, 255, 0.55);
    margin: 2px auto 12px;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-family: Arial, sans-serif;
    font-size: 22px;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-size: 20px;
    cursor: pointer;
  }

  .instructions {
    margin-top: 12px;
    line-height: 1.45;
    color: #dcecff;
  }

  .script-box {
    margin-top: 10px;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid rgba(170, 210, 255, 0.5);
    background: rgba(127, 173, 230, 0.15);
    font-style: italic;
    line-height: 1.4;
  }

  .record-actions {
    margin-top: 18px;
    display: flex;
    justify-content: center;
  }

  .mic-btn {
    width: 148px;
    border: none;
    border-radius: 999px;
    padding: 13px 16px;
    background: linear-gradient(180deg, #ed3f58, #c4293f);
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 10px 22px rgba(208, 46, 78, 0.4);
    cursor: pointer;
  }

  .mic-btn.stop {
    background: linear-gradient(180deg, #f15a5a, #bf1c1c);
  }

  .secondary-actions {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .secondary-btn,
  .save-btn {
    border-radius: 12px;
    padding: 12px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(170, 212, 255, 0.5);
  }

  .secondary-btn {
    background: rgba(255, 255, 255, 0.08);
    color: #eff7ff;
  }

  .save-btn {
    background: linear-gradient(135deg, rgba(22, 97, 190, 0.95), rgba(74, 163, 255, 0.95));
    color: #fff;
  }
</style>
