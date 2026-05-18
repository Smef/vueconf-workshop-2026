<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { refDebounced } from "@vueuse/core";

const search = ref("");
const debouncedSearch = refDebounced(search, 300);

const {
    data: projects,
    status,
    error,
} = await useFetch("/api/app/projects", {
    query: computed(() => ({ q: debouncedSearch.value || undefined })),
});

type Severity = "success" | "info" | "warn" | "secondary";

const statusSeverity: Record<string, Severity> = {
    active: "success",
    planning: "info",
    completed: "secondary",
};

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
}

function formatBudget(value: number | null | undefined) {
    if (value == null) return "—";
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold">Projects</h1>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Overview of all construction projects.
                </p>
            </div>
            <InputText v-model="search" placeholder="Search projects…" class="w-64" />
        </div>

        <div v-if="status === 'pending'" class="flex items-center gap-2">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm text-surface-500">Loading…</span>
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
            <strong>Failed to load projects:</strong> {{ error.message }}
        </Message>

        <Card v-else>
            <template #content>
                <DataTable
                    :value="projects ?? []"
                    striped-rows
                    size="small"
                    sort-mode="multiple"
                    removable-sort
                    :row-hover="true"
                    :pt="{
                        Column: {
                            bodyCell: { class: '!p-0' },
                        },
                    }"
                >
                    <Column field="name" header="Name" sortable>
                        <template #body="{ data }">
                            <NuxtLink :to="`/projects/${data.id}`" class="row-link">
                                {{ data.name }}
                            </NuxtLink>
                        </template>
                    </Column>
                    <Column field="status" header="Status" sortable style="width: 8rem">
                        <template #body="{ data }">
                            <NuxtLink :to="`/projects/${data.id}`" class="row-link" tabindex="-1">
                                <Tag :value="data.status" :severity="statusSeverity[data.status] ?? 'info'" />
                            </NuxtLink>
                        </template>
                    </Column>
                    <Column field="address" header="Address" tabindex-1>
                        <template #body="{ data }">
                            <NuxtLink :to="`/projects/${data.id}`" class="row-link" tabindex="-1">
                                {{ data.address ?? "—" }}
                            </NuxtLink>
                        </template>
                    </Column>
                    <Column field="start_date" header="Start" sortable style="width: 8rem">
                        <template #body="{ data }">
                            <NuxtLink :to="`/projects/${data.id}`" class="row-link" tabindex="-1">
                                {{ formatDate(data.start_date) }}
                            </NuxtLink>
                        </template>
                    </Column>
                    <Column field="end_date" header="End" sortable style="width: 8rem">
                        <template #body="{ data }">
                            <NuxtLink :to="`/projects/${data.id}`" class="row-link" tabindex="-1">
                                {{ formatDate(data.end_date) }}
                            </NuxtLink>
                        </template>
                    </Column>
                    <Column field="budget" header="Budget" sortable style="width: 9rem">
                        <template #body="{ data }">
                            <NuxtLink :to="`/projects/${data.id}`" class="row-link" tabindex="-1">
                                {{ formatBudget(data.budget) }}
                            </NuxtLink>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<style scoped>
:deep(tbody td) {
    height: 1px;
}
.row-link {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0.5rem 0.75rem;
    color: inherit;
    text-decoration: none;
}
</style>
