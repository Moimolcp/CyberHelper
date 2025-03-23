<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  interface Symbol {
    id: string;
    imageUrl: string;
    char: string;
    groupId?: string; // ID del grupo al que pertenece el símbolo
  }

  interface SymbolGroup {
    id: string;
    symbols: Symbol[];
    char: string;
    isCollapsed?: boolean;
  }

  export let symbols: Symbol[] = [];
  let editingSymbol: Symbol | null = null;
  let editingGroup: SymbolGroup | null = null;
  let symbolGroups: SymbolGroup[] = [];
  let draggedSymbol: Symbol | null = null;
  let dragTarget: Symbol | null = null;
  let dragTargetGroup: SymbolGroup | null = null;

  export function handleCreateSymbol(event: CustomEvent) {
    const { id, imageUrl, char } = event.detail;
    symbols = [...symbols, { id, imageUrl, char }];
  }

  export function handleUpdateSymbol(event: CustomEvent) {
    const { id, imageUrl } = event.detail;
    symbols = symbols.map(s => 
      s.id === id ? { ...s, imageUrl } : s
    );
  }

  export function handleDeleteSymbol(event: CustomEvent) {
    const { id } = event.detail;
    symbols = symbols.filter(s => s.id !== id);
  }

  function updateSymbolValue(symbol: Symbol, value: string) {
    if (!value.trim()) return; // No actualizar si el valor está vacío
    symbols = symbols.map(s => 
      s.id === symbol.id 
        ? { ...s, value } 
        : s
    );
    editingSymbol = null;
  }

  function handleEditSymbol(symbol: Symbol) {
    editingSymbol = { ...symbol };
  }

  function handleSaveSymbol() {
    if (editingSymbol) {
      const updatedSymbol = { ...editingSymbol };
      symbols = symbols.map(s => 
        s.id === updatedSymbol.id ? updatedSymbol : s
      );
      editingSymbol = null;
    }
  }

  function handleEditGroup(group: SymbolGroup) {
    editingGroup = { ...group };
  }

  function handleSaveGroup() {
    if (editingGroup) {
      const updatedGroup = { ...editingGroup };
      symbolGroups = symbolGroups.map(g => 
        g.id === updatedGroup.id ? updatedGroup : g
      );
      // Actualizar el carácter en todos los símbolos del grupo
      symbols = symbols.map(s => 
        s.groupId === updatedGroup.id ? { ...s, char: updatedGroup.char } : s
      );
      editingGroup = null;
    }
  }

  function deleteGroup(group: SymbolGroup) {
    // Eliminar todos los símbolos del grupo
    group.symbols.forEach(symbol => {
      deleteSymbol(symbol);
    });
    // Eliminar el grupo
    symbolGroups = symbolGroups.filter(g => g.id !== group.id);
  }

  function deleteSymbol(symbol: Symbol) {
    // Si el símbolo está en un grupo, eliminarlo del grupo
    if (symbol.groupId) {
      const group = symbolGroups.find(g => g.id === symbol.groupId);
      if (group) {
        group.symbols = group.symbols.filter(s => s.id !== symbol.id);
        // Si el grupo queda vacío, eliminarlo
        if (group.symbols.length === 0) {
          symbolGroups = symbolGroups.filter(g => g.id !== group.id);
        }
      }
    }
    
    symbols = symbols.filter(s => s.id !== symbol.id);
    dispatch('deleteSymbol', {
      type: 'delete',
      id: symbol.id
    });
  }

  function handleDragStart(event: DragEvent, symbol: Symbol) {
    draggedSymbol = symbol;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(event: DragEvent, symbol: Symbol | null = null, group: SymbolGroup | null = null) {
    event.preventDefault();
    if (!draggedSymbol) return;

    if (group) {
      dragTargetGroup = group;
      dragTarget = null;
    } else if (symbol && symbol.id !== draggedSymbol.id) {
      dragTarget = symbol;
      dragTargetGroup = null;
    }
  }

  function addSymbolToGroup(symbol: Symbol, group: SymbolGroup) {
    if (symbol.groupId === group.id) return; // Ya está en este grupo

    // Si el símbolo está en otro grupo, removerlo primero
    if (symbol.groupId) {
      const sourceGroup = symbolGroups.find(g => g.id === symbol.groupId);
      if (sourceGroup) {
        sourceGroup.symbols = sourceGroup.symbols.filter(s => s.id !== symbol.id);
        if (sourceGroup.symbols.length === 0) {
          symbolGroups = symbolGroups.filter(g => g.id !== sourceGroup.id);
        }
      }
    }

    // Agregar el símbolo al grupo objetivo y actualizar symbolGroups
    const updatedGroup = { ...group, symbols: [...group.symbols, symbol] };
    symbolGroups = symbolGroups.map(g => 
      g.id === group.id ? updatedGroup : g
    );

    // Actualizar el símbolo con el nuevo groupId y char
    symbols = symbols.map(s => 
      s.id === symbol.id ? { ...s, groupId: group.id, char: group.char } : s
    );
  }

  function handleDrop(event: DragEvent, targetSymbol: Symbol | null = null, targetGroup: SymbolGroup | null = null) {
    event.preventDefault();
    if (!draggedSymbol) return;

    // Si se soltó sobre un grupo
    if (targetGroup) {
      addSymbolToGroup(draggedSymbol, targetGroup);
    }
    // Si se soltó sobre un símbolo
    else if (targetSymbol && targetSymbol.id !== draggedSymbol.id) {
      // Si el símbolo objetivo está en un grupo, agregar al mismo grupo
      if (targetSymbol.groupId) {
        const group = symbolGroups.find(g => g.id === targetSymbol.groupId);
        if (group) {
          addSymbolToGroup(draggedSymbol, group);
        }
        return; // Importante: salir aquí para evitar crear un nuevo grupo
      }
      
      // Solo crear un nuevo grupo si ninguno de los símbolos está en un grupo
      if (!draggedSymbol.groupId && !targetSymbol.groupId) {
        const newGroup: SymbolGroup = {
          id: crypto.randomUUID(),
          symbols: [draggedSymbol, targetSymbol],
          char: targetSymbol.char,
          isCollapsed: false
        };
        
        // Actualizar symbolGroups
        symbolGroups = [...symbolGroups, newGroup];
        
        // Actualizar los símbolos con el nuevo groupId
        const symbolsToUpdate = [draggedSymbol.id, targetSymbol.id];
        symbols = symbols.map(s => 
          symbolsToUpdate.includes(s.id) 
            ? { ...s, groupId: newGroup.id, char: newGroup.char }
            : s
        );
      }
    }

    draggedSymbol = null;
    dragTarget = null;
    dragTargetGroup = null;
  }

  function handleDragEnd() {
    draggedSymbol = null;
    dragTarget = null;
    dragTargetGroup = null;
  }

  function ungroupSymbol(symbol: Symbol) {
    if (!symbol.groupId) return;
    
    const group = symbolGroups.find(g => g.id === symbol.groupId);
    if (group) {
      group.symbols = group.symbols.filter(s => s.id !== symbol.id);
      if (group.symbols.length === 0) {
        symbolGroups = symbolGroups.filter(g => g.id !== group.id);
      }
      symbols = symbols.map(s => 
        s.id === symbol.id ? { ...s, groupId: undefined } : s
      );
    }
  }

  function toggleGroup(group: SymbolGroup) {
    group.isCollapsed = !group.isCollapsed;
    symbolGroups = [...symbolGroups];
  }
</script>

<div class="symbol-list">
  <h2>Symbols</h2>
  
  {#if symbols.length === 0}
    <p class="empty-state">No symbols created yet</p>
  {:else}
    <div class="symbols-container">
      <!-- Símbolos agrupados -->
      {#each symbolGroups as group (group.id)}
        <div class="symbol-group"
             on:dragover={(e) => handleDragOver(e, null, group)}
             on:drop={(e) => handleDrop(e, null, group)}
             class:drag-target-group={dragTargetGroup?.id === group.id}>
          <div class="group-header">
            <button class="collapse-btn" on:click={() => toggleGroup(group)}>
              {group.isCollapsed ? '►' : '▼'}
            </button>
            {#if editingGroup && editingGroup.id === group.id}
              <input
                type="text"
                bind:value={editingGroup.char}
                on:keydown={(e) => e.key === 'Enter' && handleSaveGroup()}
                maxlength="1"
                class="group-input"
              />
              <button class="action-btn" on:click={handleSaveGroup}>✓</button>
              <button class="action-btn cancel" on:click={() => editingGroup = null}>×</button>
            {:else}
              <span class="symbol-char">{group.char}</span>
              <span class="group-count">({group.symbols.length})</span>
              <div class="group-actions">
                <button class="action-btn" on:click={() => handleEditGroup(group)}>Edit</button>
                <button class="action-btn delete" on:click={() => deleteGroup(group)}>Delete Group</button>
              </div>
            {/if}
          </div>
          {#if !group.isCollapsed}
            <div class="group-symbols" class:collapsed={group.isCollapsed}>
              {#each group.symbols as symbol (symbol.id)}
                <div class="symbol-item"
                     draggable="true"
                     on:dragstart={(e) => handleDragStart(e, symbol)}
                     on:dragover={(e) => handleDragOver(e, symbol)}
                     on:drop={(e) => handleDrop(e, symbol)}
                     on:dragend={handleDragEnd}
                     class:drag-target={dragTarget?.id === symbol.id}>
                  <div class="symbol-image">
                    <img src={symbol.imageUrl} alt={symbol.char} />
                  </div>
                  <div class="symbol-info">
                    <button class="action-btn" on:click={() => ungroupSymbol(symbol)}>Ungroup</button>
                    <button class="action-btn delete" on:click={() => deleteSymbol(symbol)}>×</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Símbolos no agrupados -->
      {#each symbols.filter(s => !s.groupId) as symbol (symbol.id)}
        <div class="symbol-item"
             draggable="true"
             on:dragstart={(e) => handleDragStart(e, symbol)}
             on:dragover={(e) => handleDragOver(e, symbol)}
             on:drop={(e) => handleDrop(e, symbol)}
             on:dragend={handleDragEnd}
             class:drag-target={dragTarget?.id === symbol.id}>
          <div class="symbol-image">
            <img src={symbol.imageUrl} alt={symbol.char} />
          </div>
          <div class="symbol-info">
            {#if editingSymbol && editingSymbol.id === symbol.id}
              <input
                type="text"
                bind:value={editingSymbol.char}
                on:keydown={(e) => e.key === 'Enter' && handleSaveSymbol()}
                maxlength="1"
              />
              <button class="action-btn" on:click={handleSaveSymbol}>✓</button>
              <button class="action-btn cancel" on:click={() => editingSymbol = null}>×</button>
            {:else}
              <span class="symbol-char">{symbol.char || 'A'}</span>
              <button class="action-btn" on:click={() => handleEditSymbol(symbol)}>Edit</button>
              <button class="action-btn delete" on:click={() => deleteSymbol(symbol)}>×</button>
            {/if}
          </div>
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
</style> 