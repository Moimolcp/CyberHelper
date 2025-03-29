<script lang="ts">
  import { clearState } from "../storage/symbols.svelte";

  let confirmed = $state(false);
  let message = $state("Limpiar datos");

  var timeoutId: number | undefined;


  function handleClear() {
    if (!confirmed) {
      message = "Seguro?";
      confirmed = true;
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        message = "Limpiar datos";
        confirmed = false;
      }, 1000);
    } else {
      message = "Limpiando...";
      confirmed = true;
      clearState();
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        message = "Limpiar datos";
        confirmed = false;
      }, 500);
    }    
  }
</script>

<button class="clear-button" onclick={handleClear}> {message} </button>

<style>
  .clear-button {
    background-color: var(--clr-surface-a20);
    color: var(--clr-light-a0);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .clear-button:hover {
    background-color: var(--clr-surface-a30);
  }
</style>