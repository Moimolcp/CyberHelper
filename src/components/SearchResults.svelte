<script lang="ts">
  export let results: string[] = [];
  export let onSelect: (word: string) => void;
  export let style: string = "";
</script>

<div class="search-results" {style}>
  <div class="results-header">
    <h3>Possible Words</h3>
    <span class="count">{results.length} results</span>
  </div>

  <div class="results-list">
    {#each results as result}
      <div class="result-item" onclick={() => onSelect(result)}>
        <span class="word">{result}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .search-results {
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);

    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    width: 300px;
    max-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .results-header {
    padding: 12px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--clr-primary-a10);
  }

  .count {
    font-size: 0.8rem;
    color: var(--clr-light-a0);
  }

  .results-list {
    overflow-y: auto;
    max-height: 350px;
  }

  .result-item {
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--clr-light-a0);
  }

  .result-item:hover {
    background-color: #444;
  }

  .word {
    font-weight: 500;
    color: var(--clr-primary-a10);
  }

  .frequency {
    font-size: 0.8rem;
    background-color: var(--clr-surface-a10);
    color: var(--clr-light-a0);
    padding: 2px 6px;
    border-radius: 12px;
  }
</style>
