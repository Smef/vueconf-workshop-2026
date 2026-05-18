<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";

const { data: materials, status, error } = await useFetch("/api/app/materials");

function formatCost(value: number | null | undefined) {
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
        <div>
            <h1 class="text-2xl font-semibold">Materials</h1>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Catalog of construction materials available across projects.
            </p>
        </div>

        <div v-if="status === 'pending'" class="flex items-center gap-2">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm text-surface-500">Loading…</span>
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
            <strong>Failed to load materials:</strong> {{ error.message }}
        </Message>

        <Card v-else>
            <template #content>
                <DataTable :value="materials ?? []" striped-rows size="small" removable-sort :row-hover="true">
                    <Column field="name" header="Name" sortable />
                    <Column field="category" header="Category" sortable style="width: 12rem">
                        <template #body="{ data }">
                            <Tag :value="data.category" severity="info" />
                        </template>
                    </Column>
                    <Column field="description" header="Description" />
                    <Column field="unit" header="Unit" sortable style="width: 8rem" />
                    <Column field="unit_cost" header="Unit Cost" sortable style="width: 9rem">
                        <template #body="{ data }">
                            {{ formatCost(data.unit_cost) }}
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>
