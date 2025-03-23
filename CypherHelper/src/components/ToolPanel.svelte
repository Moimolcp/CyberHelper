<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let activeToolId: string | null = null;
  let gridCharCount: number = 0;
  let showGridInput = false;

  const tools = [
    {
      id: 'select',
      icon: '◰',
      name: 'Select',
      action: () => dispatch('tool', { type: 'select' })
    },
    {
      id: 'grid',
      icon: '⊞',
      name: 'Grid',
      action: () => {
        showGridInput = true;
      }
    },
    {
      id: 'delete',
      icon: '✗',
      name: 'Delete Last',
      action: () => dispatch('tool', { type: 'delete' })
    }
  ];

  function handleToolClick(tool: typeof tools[0]) {
    if (tool.id === 'grid') {
      showGridInput = true;
    } else {
      activeToolId = activeToolId === tool.id ? null : tool.id;
      tool.action();
    }
  }

  function handleGridSubmit() {
    if (gridCharCount > 0) {
      dispatch('tool', { 
        type: 'grid', 
        charCount: gridCharCount 
      });
      showGridInput = false;
      activeToolId = 'grid';
    }
  }
</script>

<div class="tool-panel">
  <div class="tool-group">
    <h3>Selection Tools</h3>
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
  </div>

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
          <button class="submit-btn" on:click={handleGridSubmit}>Aceptar</button>
          <button class="cancel-btn" on:click={() => showGridInput = false}>Cancelar</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tool-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    position: relative;
  }

  .tool-button {
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #333;
  }

  .tool-button:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }

  .tool-button.active {
    background: #ff3e00;
    border-color: #ff3e00;
    color: white;
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .grid-input-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .grid-input-container label {
    font-size: 0.9rem;
    color: #666;
  }

  .grid-input-container input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .button-container {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .submit-btn, .cancel-btn {
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
    background: #f5f5f5;
    color: #666;
  }

  .cancel-btn:hover {
    background: #eee;
  }
</style> 