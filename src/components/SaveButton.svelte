<script lang="ts">
    import { saveState } from "../storage/symbols.svelte";


    let message = $state("Guardar estado");


    function handleSave() {
        message = "Guardando...";
        saveState();
        window.setTimeout(() => {
            message = "Guardar estado";
        }, 500);
    }
</script>

<button class="save-button" onclick={handleSave}> {message} </button>

<style>
    .save-button {

        background-color: var(--clr-primary-a10);
        color: var(--clr-light-a0);

        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
    }

    .save-button:hover {
        background-color: var(--clr-primary-a20);
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
</style>
