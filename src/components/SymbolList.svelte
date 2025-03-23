<script lang="ts">
  import { symbolManager, updateSymbol, deleteSymbol } from '../storage/symbols.svelte';
  import { type Symbol, type SymbolGroup } from '../storage/symbols.svelte';

  let editingSymbol: Symbol | null = null;

  function handleSaveSymbol() {
    if (editingSymbol) {
      updateSymbol(editingSymbol.id, { char: editingSymbol.char });
      editingSymbol = null;
    }
  }

  function handleEditSymbol(symbol: Symbol) {
    editingSymbol = symbol;
  }

  function handleDeleteSymbol(id: string) {
    deleteSymbol(id);
  }


</script>




<div class="symbol-list">
  <h2>Symbols</h2>
  
  {#if symbolManager.symbols.length === 0}
    <div class="empty-state">No symbols created yet</div>
  {:else}
    <div class="symbols-container">
      
      <!-- Símbolos no agrupados -->
      {#each symbolManager.symbols.filter(s => !s.groupId) as symbol (symbol.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="symbol-item"
             draggable="true"             
             ></div>
          <div class="symbol-image">
            <img src={symbol.imageUrl} alt={symbol.char} />
          </div>
          <div class="symbol-info">
            {#if editingSymbol?.id === symbol.id}
              <input
                type="text"
                bind:value={editingSymbol.char}
                onkeydown={(e) => e.key === 'Enter' && handleSaveSymbol()}
                maxlength="1"
              />
              <button class="action-btn" onclick={handleSaveSymbol}>✓</button>
              <button class="action-btn cancel" onclick={() => editingSymbol = null}>×</button>
            {:else}
              <span class="symbol-char">{symbol.char || 'A'}</span>
              <button class="action-btn" onclick={() => handleEditSymbol(symbol)}>Edit</button>
              <button class="action-btn delete" onclick={() => deleteSymbol(symbol.id)}>×</button>
            {/if}
          </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .symbol-list {
    height: 100%;
    overflow-y: auto;
    padding: 0.5rem;
    background: white;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
    font-size: 1rem;
  }

  .empty-state {
    color: #666;
    text-align: center;
    padding: 1rem 0;
    font-size: 0.9rem;
  }

  .symbols-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .symbol-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f8f8f8;
  }

  .symbol-image {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    border-radius: 2px;
    overflow: hidden;
    background: white;
    flex-shrink: 0;
  }

  .symbol-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .symbol-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-grow: 1;
    min-width: 0;
  }

  .symbol-char {
    font-size: 0.9rem;
    font-weight: bold;
    color: #333;
    min-width: 16px;
    text-align: center;
    background: white;
    border: 1px solid #ddd;
    border-radius: 2px;
    padding: 0.1rem 0.25rem;
  }

  input {
    padding: 0.1rem 0.25rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 0.9rem;
    width: 25px;
    text-align: center;
  }

  input:focus {
    border-color: #ff3e00;
    outline: none;
  }

  .action-btn {
    padding: 0.1rem 0.35rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    background: white;
    color: #333;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
    min-width: 30px;
  }

  .action-btn:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .action-btn.delete {
    color: #ff3e00;
    border-color: #ff3e00;
  }

  .action-btn.delete:hover {
    background: #fff0ed;
  }

  .action-btn.cancel {
    color: #666;
  }

  .action-btn.cancel:hover {
    background: #f0f0f0;
  }

  .symbol-group {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 0.25rem;
    overflow: hidden;
  }

  .group-header {
    background: #f0f0f0;
    padding: 0.15rem 0.35rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 1px solid #ddd;
  }

  .group-count {
    color: #666;
    font-size: 0.8rem;
  }

  .group-symbols {
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .group-symbols.collapsed {
    display: none;
  }

  .drag-target {
    border: 2px dashed #ff3e00;
  }

  .symbol-item {
    cursor: move;
  }

  .symbol-item:hover {
    background: #f5f5f5;
  }

  .group-actions {
    margin-left: auto;
    display: flex;
    gap: 0.25rem;
  }

  .group-input {
    padding: 0.1rem 0.25rem;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 0.9rem;
    width: 25px;
    text-align: center;
    background: white;
  }

  .group-input:focus {
    border-color: #ff3e00;
    outline: none;
  }

  .collapse-btn {
    padding: 0 0.25rem;
    border: none;
    background: none;
    cursor: pointer;
    color: #666;
    font-size: 0.8rem;
    line-height: 1;
  }

  .collapse-btn:hover {
    color: #333;
  }

  .drag-target-group {
    border: 2px dashed #ff3e00;
    background: #fff8f7;
  }

  .symbol-item.not-draggable {
    cursor: default;
    opacity: 0.9;
  }

  .symbol-item.not-draggable:hover {
    background: #f8f8f8;
  }
</style> 