<script lang="ts">
  import Toolbar from "./Toolbar.svelte";
  import ImageViewer from "./ImageViewer.svelte";
  import { onMount } from "svelte";

  let isResizing = $state(false);
  let currentPanel = $state<string | null>(null);
  let startX = $state(0);
  let startWidth = $state(0);

  function handleMouseDown(event: MouseEvent, panel: string) {
    const target = event.target as HTMLElement;
    if (!target.closest(".panel-resizer")) return;
    event.preventDefault();
    isResizing = true;
    currentPanel = panel;
    startX = event.clientX;

    const panelElement = document.querySelector(
      `.${panel}-panel`,
    ) as HTMLElement;
    startWidth = panelElement.offsetWidth;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isResizing || !currentPanel) return;
    const panelElement = document.querySelector(
      `.${currentPanel}-panel`,
    ) as HTMLElement;
    const diff = event.clientX - startX;
    let newWidth = startWidth - diff;
    // Limitar el ancho mínimo y máximo
    newWidth = Math.max(100, Math.min(1000, newWidth));
    panelElement.style.flex = `0 0 ${newWidth}px`;
  }

  function handleMouseUp() {
    isResizing = false;
    currentPanel = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  onMount(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  });
</script>

<div class="layout">
  <div class="toolbar">
    <slot name="toolbar"></slot>
  </div>

  <div class="content">
    <div class="tools-panel">
      <slot name="tools">
        <div style="color: #666;">Tools will appear here</div>
      </slot>
    </div>

    <div class="main-content">
      <slot />
    </div>

    <div
      class="panel-resizer"
      data-panel="symbols"
      on:mousedown={(e) => handleMouseDown(e, "symbols")}
    ></div>

    <div class="symbols-panel">
      <slot name="symbols">
        <div style="color: #666;">No symbols created yet</div>
      </slot>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
  }

  :global(#app) {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .layout {
    background-color: var(--clr-surface-a0);

    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

  }

  .toolbar {
    background-color: var(--clr-surface-a0);
    
    flex: 0 0 auto;
    width: 100%;
  }

  .content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .tools-panel {
    background-color: var(--clr-surface-a10);

    flex: 0 0 50px;
    border-right: 1px solid #444; /* Borde más oscuro */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .main-content {    
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .symbols-panel {
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);
    
    flex: 0 0 200px;
    border-left: 1px solid #444; /* Borde más oscuro */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  .panel-resizer {
    width: 4px;
    background: transparent;
    cursor: col-resize;
    transition: background-color 0.2s;
  }

  .panel-resizer:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .tools-panel,
  .symbols-panel {
    transition: flex-basis 0.1s ease;
  }

</style>
