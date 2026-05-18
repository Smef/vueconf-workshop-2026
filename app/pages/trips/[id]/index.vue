<script setup lang="ts">
import Card from "primevue/card";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Button from "primevue/button";
import dayjs from "dayjs";

const route = useRoute();
const id = computed(() => route.params.id);

const { data: tripData, status, error } = await useFetch(`/api/app/trips/${id.value}`);
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <Button
                icon="pi pi-arrow-left"
                severity="secondary"
                text
                rounded
                aria-label="Back to Trips"
                @click="$router.push('/trips')"
            />
            <div v-if="tripData">
                <h1 class="text-2xl font-semibold">{{ tripData.destination }}</h1>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {{ dayjs(tripData.date).format("MMMM D, YYYY h:mm A") }}
                </p>
            </div>
            <div v-else class="h-10 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <div v-if="status === 'pending'" class="flex items-center gap-2">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm text-surface-500">Loading…</span>
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
            <strong>Failed to load trip:</strong> {{ error.message }}
        </Message>

        <template v-else-if="tripData">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <template #title>Trip Details</template>
                    <template #content>
                        <dl class="space-y-4">
                            <div>
                                <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Destination</dt>
                                <dd class="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                                    {{ tripData.destination }}
                                </dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Date</dt>
                                <dd class="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                                    {{ dayjs(tripData.date).format("MMMM D, YYYY h:mm A") }}
                                </dd>
                            </div>
                        </dl>
                    </template>
                </Card>

                <Card>
                    <template #title>Students on Trip</template>
                    <template #content>
                        <DataTable
                            :value="tripData.studentTrips ?? []"
                            striped-rows
                            size="small"
                            :pt="{
                                Column: {
                                    bodyCell: { class: '!p-0' },
                                },
                            }"
                        >
                            <Column field="student.name" header="Student Name">
                                <template #body="{ data }">
                                    <div class="row-content">
                                        {{ data.student?.name }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="student.student_number" header="Student Number">
                                <template #body="{ data }">
                                    <div class="row-content">
                                        {{ data.student?.student_number }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="approved" header="Approval Status">
                                <template #body="{ data }">
                                    <div class="row-content">
                                        <Tag v-if="data.approved === true" severity="success" value="Approved" />
                                        <Tag v-else-if="data.approved === false" severity="danger" value="Denied" />
                                        <Tag v-else severity="warn" value="Pending" />
                                    </div>
                                </template>
                            </Column>
                            <Column field="approvedBy.name" header="Approved By">
                                <template #body="{ data }">
                                    <div class="row-content text-neutral-500">
                                        {{ data.approvedBy ? data.approvedBy.name : "—" }}
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </div>
        </template>
    </div>
</template>

<style scoped>
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
