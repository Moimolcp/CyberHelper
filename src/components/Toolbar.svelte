<script lang="ts">
  import ClearButton from "./ClearButton.svelte";
  import SaveButton from "./SaveButton.svelte";
  let { callbackFileUpload } = $props();

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        callbackFileUpload({
          id: crypto.randomUUID(),
          name: file.name,
          imageUrl: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="toolbar">
  <div class="upload-container">
    <input
      type="file"
      accept="image/*"
      onchange={handleFileUpload}
      id="image-upload"
      class="hidden"
    />
    <button class="upload-button" onclick={() => document.getElementById('image-upload')?.click()}> Upload Image </button>
  </div>
  <SaveButton />
  <ClearButton />
</div>

<style>

  .toolbar {
    background-color: var(--clr-surface-a10);

    display: flex;
    padding: 0.5rem;
    border-bottom: 1px solid #444;
    z-index: 10;
    gap: 0.5rem;
  }

  .upload-container {
    display: flex;
    align-items: center;
  }

  .hidden {
    display: none;
  }

  .upload-button {
    background: var(--clr-primary-a10);
    color: var(--clr-light-a0);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .upload-button:hover {
    background-color: var(--clr-primary-a20);
  }
</style>
