<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { refDebounced } from "@vueuse/core";

const search = ref("");
const debouncedSearch = refDebounced(search, 300);

const {
    data: students,
    status,
    error,
} = await useFetch("/api/app/students", {
    query: computed(() => ({ q: debouncedSearch.value || undefined })),
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold">Students</h1>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Overview of all students and the parents connected to them.
                </p>
            </div>
            <InputText v-model="search" placeholder="Search students…" class="w-64" />
        </div>

        <div v-if="status === 'pending'" class="flex items-center gap-2">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm text-surface-500">Loading…</span>
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
            <strong>Failed to load students:</strong> {{ error.message }}
        </Message>

        <Card v-else>
            <template #content>
                <DataTable
                    :value="students ?? []"
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
                    <Column field="student_number" header="Student #" sortable style="width: 12rem">
                        <template #body="{ data }">
                            <div class="row-content">
                                {{ data.student_number }}
                            </div>
                        </template>
                    </Column>
                    <Column field="name" header="Name" sortable>
                        <template #body="{ data }">
                            <div class="row-content">
                                {{ data.name }}
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
