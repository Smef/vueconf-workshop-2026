<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";

const { data: tags, status, error, refresh } = await useFetch("/api/app/daily-report-tags");

const newTagName = ref("");
const submitting = ref(false);
const submitError = ref<string | null>(null);

async function addTag() {
    const name = newTagName.value.trim();
    if (!name) return;
    submitting.value = true;
    submitError.value = null;
    try {
        await $fetch("/api/app/daily-report-tags", {
            method: "POST",
            body: { name },
        });
        newTagName.value = "";
        await refresh();
    } catch (e: unknown) {
        submitError.value = e instanceof Error ? e.message : "Failed to add tag";
    } finally {
        submitting.value = false;
    }
}

async function deleteTag(tagId: number) {
    submitError.value = null;
    try {
        await $fetch(`/api/app/daily-report-tags/${tagId}`, { method: "DELETE" });
        await refresh();
    } catch (e: unknown) {
        submitError.value = e instanceof Error ? e.message : "Failed to delete tag";
    }
}
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-semibold">Daily Report Tags</h1>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Tags used to flag notable events in daily progress reports.
            </p>
        </div>

        <Message v-if="submitError" severity="error" :closable="false">{{ submitError }}</Message>

        <Card>
            <template #content>
                <form class="mb-4 flex gap-2" @submit.prevent="addTag">
                    <InputText v-model="newTagName" placeholder="New tag name" class="flex-1" :disabled="submitting" />
                    <Button
                        type="submit"
                        label="Add"
                        icon="pi pi-plus"
                        :loading="submitting"
                        :disabled="!newTagName.trim()"
                    />
                </form>

                <div v-if="status === 'pending'" class="flex items-center gap-2">
                    <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
                    <span class="text-sm text-surface-500">Loading…</span>
                </div>

                <Message v-else-if="error" severity="error" :closable="false">
                    <strong>Failed to load tags:</strong> {{ error.message }}
                </Message>

                <DataTable v-else :value="tags ?? []" striped-rows size="small" :row-hover="true">
                    <Column field="name" header="Name" />
                    <Column style="width: 4rem">
                        <template #body="{ data }">
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                rounded
                                size="small"
                                @click="deleteTag(data.id)"
                            />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>
