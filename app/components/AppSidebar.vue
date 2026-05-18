<script setup lang="ts">
import Button from "primevue/button";

const route = useRoute();
const collapsed = defineModel<boolean>("collapsed", { default: false });

const navItems = [
    {
        label: "Setup",
        navItems: [
            { label: "Home", icon: "pi pi-home", to: "/" },
            { label: "Test", icon: "pi pi-question-circle", to: "/test" },
        ],
    },
    {
        label: "Construction",
        navItems: [
            { label: "Projects", icon: "pi pi-briefcase", to: "/projects" },
            { label: "Materials", icon: "pi pi-box", to: "/materials" },
            { label: "Report Tags", icon: "pi pi-tag", to: "/daily-report-tags" },
        ],
    },
    {
        label: "Education",
        navItems: [
            { label: "Students", icon: "pi pi-users", to: "/students" },
            { label: "Parents", icon: "pi pi-user", to: "/parents" },
            { label: "Email", icon: "pi pi-envelope", to: "/emails" },
            { label: "Trips", icon: "pi pi-map-marker", to: "/trips" },
        ],
    },
];

const isActive = (to: string) => route.path === to;
</script>

<template>
    <aside
        class="flex h-screen flex-col border-r border-neutral-200 bg-neutral-50 transition-[width] dark:border-neutral-800 dark:bg-neutral-900"
        :class="collapsed ? 'w-16' : 'w-64'"
    >
        <div
            class="flex h-14 shrink-0 items-center border-b border-neutral-200 px-3 dark:border-neutral-800"
            :class="collapsed ? 'justify-center' : 'justify-between'"
        >
            <span class="overflow-hidden text-lg font-semibold transition-all" :class="collapsed ? 'w-0' : 'w-72'"
                >Workshop</span
            >
            <Button
                :icon="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
                severity="secondary"
                text
                rounded
                :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                @click="collapsed = !collapsed"
            />
        </div>

        <nav class="flex flex-1 flex-col overflow-x-hidden p-2">
            <template v-for="section in navItems" :key="section.label">
                <span
                    class="overflow-hidden px-4 py-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-all dark:text-neutral-500"
                    :class="collapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'"
                    >{{ section.label }}</span
                >
                <NuxtLink
                    v-for="item in section.navItems"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center justify-start rounded-md px-4 py-2 text-sm transition-all"
                    :class="
                        isActive(item.to)
                            ? 'bg-neutral-200/70 text-neutral-900 dark:bg-neutral-800/70 dark:text-neutral-50'
                            : 'text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800'
                    "
                    :title="collapsed ? item.label : undefined"
                >
                    <i :class="[item.icon, isActive(item.to) ? 'opacity-90' : '']" />
                    <span
                        class="overflow-hidden pl-3 transition-all"
                        :class="{ 'w-0': collapsed, 'w-full': !collapsed }"
                        >{{ item.label }}</span
                    >
                </NuxtLink>
                <div class="my-1 border-t border-neutral-200 dark:border-neutral-800" />
            </template>
        </nav>

        <div
            class="flex shrink-0 items-center border-t border-neutral-200 p-2 dark:border-neutral-800"
            :class="collapsed ? 'justify-center' : 'justify-end'"
        >
            <LightDarkToggle />
        </div>
    </aside>
</template>
