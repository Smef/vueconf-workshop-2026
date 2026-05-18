<script setup lang="ts">
import Button from "primevue/button";

const { isDark, toggle } = useDarkMode();
</script>

<template>
    <ClientOnly>
        <Button
            :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            severity="secondary"
            text
            rounded
            @click="toggle"
        />
    </ClientOnly>
</template>
