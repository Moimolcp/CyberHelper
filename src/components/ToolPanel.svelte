<script lang="ts">
  import { toolManager, updateTool } from "../storage/symbols.svelte";
  import type { Tool } from "../storage/symbols.svelte";

  const tools = [
    { id: "select", name: "Selección", icon: "◻", type: "select" },
    { id: "grid", name: "Cuadrícula", icon: "⊞", type: "grid" },
    { id: "delete", name: "Borrar", icon: "🗑", type: "delete" },
    { id: "search", name: "Buscar", icon: "🔍", type: "search" },
  ];

  let showGridInput = $state(false);
  let gridCharCount = $state(1);
  let activeToolId = $state("select");

  function handleToolClick(tool: {
    id: string;
    name: string;
    icon: string;
    type: string;
  }) {
    if (tool.id === "grid") {
      showGridInput = true;
    } else {
      activeToolId = tool.id;
      updateTool({
        type: tool.type as Tool["type"],
        charCount: 0,
      });
    }
  }

  function handleGridSubmit() {
    activeToolId = "grid";
    updateTool({
      type: "grid",
      charCount: gridCharCount,
    });
    showGridInput = false;
  }
</script>

<div class="tool-panel">
  {#each tools as tool}
    <button
      class="tool-button"
      class:active={activeToolId === tool.id}
      on:click={() => handleToolClick(tool)}
      title={tool.name}
    >
      <span class="tool-icon">{tool.icon}</span>
    </button>
  {/each}

  {#if showGridInput}
    <div class="grid-input-overlay">
      <div class="grid-input-container">
        <label for="charCount">Número de caracteres:</label>
        <input
          type="number"
          id="charCount"
          bind:value={gridCharCount}
          min="1"
          step="1"
        />
        <div class="button-container">
          <button class="submit-btn" on:click={handleGridSubmit}>Aceptar</button
          >
          <button class="cancel-btn" on:click={() => (showGridInput = false)}
            >Cancelar</button
          >
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tool-panel {
    background: var(--clr-surface-a10);
    color: var(--clr-light-a0);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    position: relative;
    padding-top: 8px;    
  }

  .tool-button {
    background: var(--clr-surface-a20);
    color: var(--clr-light-a0);

    width: 40px;
    height: 40px;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .tool-button:hover {
    background: var(--clr-surface-a30);
  }

  .tool-button.active {
    background: var(--clr-primary-a10);
    border-color: var(--clr-primary-a10);
    color: var(--clr-light-a0);
  }

  .tool-icon {
    font-size: 1.2rem;
    color: inherit;
  }

  .grid-input-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .grid-input-container {
    background: #333;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .grid-input-container label {
    font-size: 0.9rem;
    color: #ccc;
  }

  .grid-input-container input {
    padding: 0.5rem;
    border: 1px solid #444;
    border-radius: 4px;
    font-size: 1rem;
    background: #555;
    color: white;
  }

  .button-container {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .submit-btn,
  .cancel-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .submit-btn {
    background: #ff3e00;
    color: white;
  }

  .submit-btn:hover {
    background: #ff2d00;
  }

  .cancel-btn {
    background: #444;
    color: white;
  }

  .cancel-btn:hover {
    background: #666;
  }
</style>
