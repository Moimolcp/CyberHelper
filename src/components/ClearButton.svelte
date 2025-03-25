<script lang="ts">
  import { clearState } from "../storage/symbols.svelte";

  function handleClear() {
    if (
      confirm(
        "¿Estás seguro de que quieres limpiar todos los datos guardados? Esta acción no se puede deshacer.",
      )
    ) {
      clearState();
    }
  }
</script>

<button class="clear-button" on:click={handleClear}> Limpiar datos </button>

<style>
  .clear-button {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .clear-button:hover {
    background-color: #cc0000;
  }
</style>
