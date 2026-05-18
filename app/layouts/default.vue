<script setup lang="ts">
const collapsed = useCookie<boolean>("sidebar-collapsed", { default: () => false });
</script>

<template>
    <div class="flex h-screen w-screen overflow-hidden">
        <AppSidebar v-model:collapsed="collapsed" />
        <main class="flex-1 overflow-auto p-6">
            <slot />
        </main>
    </div>
</template>
