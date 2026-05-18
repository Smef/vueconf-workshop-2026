<script setup lang="ts">
const { isDark } = useDarkMode();
</script>

<template>
    <Html lang="en-US" :class="{ dark: isDark }">
        <Head>
            <title>Workshop</title>
        </Head>
        <Body class="dark:bg-neutral-950 dark:text-neutral-100">
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
        </Body>
    </Html>
</template>
