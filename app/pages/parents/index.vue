<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import dayjs from "dayjs";
import { refDebounced } from "@vueuse/core";

const search = ref("");
const debouncedSearch = refDebounced(search, 300);

const {
    data: parents,
    status,
    error,
} = await useFetch("/api/app/parents", {
    query: computed(() => ({ q: debouncedSearch.value || undefined })),
});

const parentRows = computed<readonly unknown[]>(() => (Array.isArray(parents.value) ? parents.value : []));

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "—";
    const date = dayjs(value);
    return date.isValid() ? date.format("MMM D, YYYY") : "—";
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold">Parents</h1>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Overview of parent contacts.</p>
            </div>
            <InputText v-model="search" placeholder="Search parents…" class="w-64" />
        </div>

        <div v-if="status === 'pending'" class="flex items-center gap-2">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm text-surface-500">Loading…</span>
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
            <strong>Failed to load parents:</strong> {{ error.message }}
        </Message>

        <Card v-else>
            <template #content>
                <DataTable
                    :value="parentRows"
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
                            <div class="row-content">
                                {{ data.name }}
                            </div>
                        </template>
                    </Column>
                    <Column field="birthday" header="Birthday" sortable style="width: 10rem">
                        <template #body="{ data }">
                            <div class="row-content">
                                {{ formatDate(data.birthday) }}
                            </div>
                        </template>
                    </Column>
                    <Column field="email" header="Email" sortable>
                        <template #body="{ data }">
                            <div class="row-content">
                                {{ data.email ?? "—" }}
                            </div>
                        </template>
                    </Column>
                    <Column field="phone" header="Phone" sortable style="width: 11rem">
                        <template #body="{ data }">
                            <div class="row-content">
                                {{ data.phone ?? "—" }}
                            </div>
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

.row-content {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0.5rem 0.75rem;
    color: inherit;
    text-decoration: none;
}
</style>
