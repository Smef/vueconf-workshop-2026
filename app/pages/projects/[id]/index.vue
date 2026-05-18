<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";
import Dialog from "primevue/dialog";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import FileUpload from "primevue/fileupload";
import { NuxtLink } from "#components";

const route = useRoute();
const id = computed(() => route.params.id);

const { data: project, status, error } = await useFetch(`/api/app/projects/${id.value}`);

const {
    data: reports,
    status: reportsStatus,
    error: reportsError,
    refresh: refreshReports,
} = await useFetch(`/api/app/projects/${id.value}/daily-reports`);

const { data: allMaterials, refresh: refreshMaterials } = await useFetch(`/api/app/projects/${id.value}/materials`);

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

function formatQuantity(value: string | number | null | undefined) {
    if (value == null) return "—";
    const n = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatBudget(value: number | null | undefined) {
    if (value == null) return "—";
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

const activeTab = ref("reports");

// --- Add report form ---

const showReportModal = ref(false);
const newReportDate = ref<Date>(new Date());
const newReportSummary = ref("");
const newReportPhoto = ref<File | null>(null);
const newReportPhotoPreview = ref<string | null>(null);
const submitting = ref(false);
const submitError = ref<string | null>(null);

watch(newReportPhoto, (file, prevFile) => {
    if (prevFile && newReportPhotoPreview.value) {
        URL.revokeObjectURL(newReportPhotoPreview.value);
    }
    newReportPhotoPreview.value = file ? URL.createObjectURL(file) : null;
});

function openReportModal() {
    newReportDate.value = new Date();
    newReportSummary.value = "";
    newReportPhoto.value = null;
    submitError.value = null;
    speechError.value = null;
    showReportModal.value = true;
}

function onPhotoSelect(event: { files: File[] }) {
    newReportPhoto.value = event.files[0] ?? null;
}

function removePhoto() {
    newReportPhoto.value = null;
}

function onDialogHide() {
    if (recognition && listening.value) recognition.stop();
    submitError.value = null;
    speechError.value = null;
}

function toIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function submitReport() {
    const summary = newReportSummary.value.trim();
    if (!summary || submitting.value) return;

    submitting.value = true;
    submitError.value = null;
    try {
        const formData = new FormData();
        formData.append("report_date", toIsoDate(newReportDate.value));
        formData.append("summary", summary);
        if (newReportPhoto.value) {
            formData.append("photo", newReportPhoto.value);
        }
        await $fetch(`/api/app/projects/${id.value}/daily-reports`, {
            method: "POST",
            body: formData,
        });
        newReportSummary.value = "";
        newReportDate.value = new Date();
        newReportPhoto.value = null;
        showReportModal.value = false;
        await Promise.all([refreshReports(), refreshMaterials()]);
    } catch (e: unknown) {
        submitError.value = e instanceof Error ? e.message : "Failed to save report";
    } finally {
        submitting.value = false;
    }
}

// --- Microphone / Web Speech API ---

type SpeechRecognitionLike = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: ((e: Event) => void) | null;
    onend: (() => void) | null;
};

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: {
        length: number;
        [index: number]: {
            isFinal: boolean;
            [index: number]: { transcript: string };
        };
    };
}

const speechSupported = ref(false);
const listening = ref(false);
const speechError = ref<string | null>(null);
let recognition: SpeechRecognitionLike | null = null;
let summaryBaseline = "";

onMounted(() => {
    const w = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    speechSupported.value = !!Ctor;
});

function toggleMic() {
    if (!speechSupported.value) return;
    if (listening.value) {
        recognition?.stop();
        return;
    }

    const w = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    speechError.value = null;
    summaryBaseline = newReportSummary.value;

    recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result) continue;
            const alt = result[0];
            if (!alt) continue;
            if (result.isFinal) finalText += alt.transcript;
            else interimText += alt.transcript;
        }
        if (finalText) {
            summaryBaseline = (summaryBaseline + " " + finalText).trim();
        }
        const combined = interimText ? `${summaryBaseline} ${interimText}`.trim() : summaryBaseline;
        newReportSummary.value = combined;
    };

    recognition.onerror = (event) => {
        const err = event as Event & { error?: string };
        speechError.value = err.error ?? "Speech recognition error";
        listening.value = false;
    };

    recognition.onend = () => {
        listening.value = false;
    };

    recognition.start();
    listening.value = true;
}

onBeforeUnmount(() => {
    if (recognition && listening.value) recognition.stop();
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <NuxtLink to="/projects">
                <Button icon="pi pi-arrow-left" severity="secondary" text rounded aria-label="Back to projects" />
            </NuxtLink>
            <h1 class="text-2xl font-semibold">
                {{ project?.name ?? "Project" }}
            </h1>
            <Tag v-if="project?.status" :value="project.status" :severity="statusSeverity[project.status] ?? 'info'" />
        </div>

        <div v-if="status === 'pending'" class="flex items-center gap-2">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm text-surface-500">Loading…</span>
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
            <strong>Failed to load project:</strong> {{ error.message }}
        </Message>

        <template v-else-if="project">
            <Card>
                <template #title>Overview</template>
                <template #content>
                    <p class="text-surface-700 dark:text-surface-300">
                        {{ project.description ?? "No description provided." }}
                    </p>
                </template>
            </Card>

            <Card>
                <template #title>Details</template>
                <template #content>
                    <dl class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                        <div>
                            <dt class="text-xs tracking-wide text-surface-500 uppercase">Address</dt>
                            <dd class="mt-1 text-sm">{{ project.address ?? "—" }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs tracking-wide text-surface-500 uppercase">Budget</dt>
                            <dd class="mt-1 text-sm">{{ formatBudget(project.budget) }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs tracking-wide text-surface-500 uppercase">Start Date</dt>
                            <dd class="mt-1 text-sm">{{ formatDate(project.start_date) }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs tracking-wide text-surface-500 uppercase">End Date</dt>
                            <dd class="mt-1 text-sm">{{ formatDate(project.end_date) }}</dd>
                        </div>
                    </dl>
                </template>
            </Card>

            <Card>
                <template #content>
                    <Tabs v-model:value="activeTab">
                        <div class="mb-1 flex items-center justify-between">
                            <TabList>
                                <Tab value="reports">Daily Reports</Tab>
                                <Tab value="materials">Materials Used</Tab>
                            </TabList>
                            <Button label="New Report" icon="pi pi-plus" size="small" @click="openReportModal" />
                        </div>
                        <TabPanels class="!px-0 !pb-0">
                            <TabPanel value="reports">
                                <div class="space-y-4">
                                    <div v-if="reportsStatus === 'pending'" class="flex items-center gap-2">
                                        <ProgressSpinner style="width: 18px; height: 18px" stroke-width="4" />
                                        <span class="text-sm text-surface-500">Loading reports…</span>
                                    </div>

                                    <Message v-else-if="reportsError" severity="error" :closable="false">
                                        <strong>Failed to load reports:</strong> {{ reportsError.message }}
                                    </Message>

                                    <div v-else-if="!reports || reports.length === 0" class="text-sm text-surface-500">
                                        No reports yet. Click <strong>New Report</strong> to add the first one.
                                    </div>

                                    <ul v-else class="space-y-2">
                                        <li v-for="report in reports" :key="report.id">
                                            <NuxtLink
                                                :to="`/projects/${id}/daily-reports/${report.id}`"
                                                class="group flex items-start gap-4 rounded-lg border border-surface-200 bg-surface-0 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:border-surface-700 dark:bg-surface-900 dark:hover:border-primary-700 dark:hover:bg-primary-950/30"
                                            >
                                                <div class="w-10 shrink-0 text-center">
                                                    <div
                                                        class="text-xs font-semibold tracking-wide text-surface-400 uppercase"
                                                    >
                                                        {{
                                                            new Date(report.report_date).toLocaleString("default", {
                                                                month: "short",
                                                            })
                                                        }}
                                                    </div>
                                                    <div
                                                        class="text-2xl leading-tight font-bold text-surface-800 dark:text-surface-100"
                                                    >
                                                        {{ new Date(report.report_date).getDate() }}
                                                    </div>
                                                    <div class="text-xs text-surface-400">
                                                        {{ new Date(report.report_date).getFullYear() }}
                                                    </div>
                                                </div>

                                                <div class="min-w-0 flex-1 pt-0.5">
                                                    <p
                                                        class="line-clamp-2 text-sm leading-relaxed text-surface-700 dark:text-surface-300"
                                                    >
                                                        {{ report.summary }}
                                                    </p>
                                                    <div v-if="report.tags?.length" class="mt-2 flex flex-wrap gap-1">
                                                        <Tag
                                                            v-for="tag in report.tags"
                                                            :key="tag.id"
                                                            :value="tag.tag.name"
                                                            severity="warn"
                                                            size="small"
                                                        />
                                                    </div>
                                                </div>

                                                <img
                                                    v-if="report.photo_path"
                                                    :src="report.photo_path"
                                                    class="h-14 w-14 shrink-0 rounded-lg object-cover shadow-sm"
                                                    alt="Report photo"
                                                />

                                                <i
                                                    class="pi pi-angle-right mt-1 shrink-0 text-surface-300 transition-colors group-hover:text-primary-500 dark:text-surface-600 dark:group-hover:text-primary-400"
                                                />
                                            </NuxtLink>
                                        </li>
                                    </ul>
                                </div>
                            </TabPanel>

                            <TabPanel value="materials">
                                <div v-if="!allMaterials || allMaterials.length === 0" class="text-sm text-surface-500">
                                    No materials recorded yet.
                                </div>
                                <DataTable v-else :value="allMaterials" striped-rows size="small" :row-hover="true">
                                    <Column field="report_date" header="Date" style="width: 9rem">
                                        <template #body="{ data }">
                                            {{ formatDate(data.report_date) }}
                                        </template>
                                    </Column>
                                    <Column field="material.name" header="Material">
                                        <template #body="{ data }">
                                            {{ data.material?.name ?? "—" }}
                                        </template>
                                    </Column>
                                    <Column field="material.category" header="Category" style="width: 12rem">
                                        <template #body="{ data }">
                                            {{ data.material?.category ?? "—" }}
                                        </template>
                                    </Column>
                                    <Column field="quantity" header="Quantity" style="width: 8rem">
                                        <template #body="{ data }">
                                            {{ formatQuantity(data.quantity) }}
                                        </template>
                                    </Column>
                                    <Column field="material.unit" header="Unit" style="width: 7rem">
                                        <template #body="{ data }">
                                            {{ data.material?.unit ?? "—" }}
                                        </template>
                                    </Column>
                                    <Column header="" style="width: 4rem">
                                        <template #body="{ data }">
                                            <NuxtLink :to="`/projects/${id}/daily-reports/${data.daily_report_id}`">
                                                <Button
                                                    icon="pi pi-arrow-right"
                                                    severity="secondary"
                                                    text
                                                    rounded
                                                    aria-label="View report"
                                                />
                                            </NuxtLink>
                                        </template>
                                    </Column>
                                </DataTable>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </template>
            </Card>
        </template>

        <Dialog
            v-model:visible="showReportModal"
            modal
            header="New Daily Report"
            class="w-full sm:!w-[40rem]"
            :draggable="false"
            @hide="onDialogHide"
        >
            <div class="space-y-4">
                <div>
                    <label class="mb-1 block text-xs tracking-wide text-surface-500 uppercase">Date</label>
                    <DatePicker v-model="newReportDate" date-format="yy-mm-dd" show-icon fluid :disabled="submitting" />
                </div>

                <div>
                    <label class="mb-1 block text-xs tracking-wide text-surface-500 uppercase">Summary</label>
                    <div class="relative">
                        <Textarea
                            v-model="newReportSummary"
                            rows="6"
                            class="w-full pr-12"
                            :placeholder="
                                listening
                                    ? 'Listening… speak now.'
                                    : 'Describe today\'s work, crew, deliveries, issues, etc.'
                            "
                            :disabled="submitting"
                        />
                        <Button
                            v-if="speechSupported"
                            :icon="listening ? 'pi pi-stop-circle' : 'pi pi-microphone'"
                            :severity="listening ? 'danger' : 'secondary'"
                            :outlined="!listening"
                            rounded
                            class="!absolute top-2 right-2"
                            :aria-label="listening ? 'Stop recording' : 'Start voice input'"
                            :disabled="submitting"
                            @click="toggleMic"
                        />
                    </div>
                    <p v-if="!speechSupported" class="mt-1 text-xs text-surface-500">
                        Voice input not supported in this browser.
                    </p>
                    <p v-else-if="speechError" class="mt-1 text-xs text-red-600">
                        Voice input error: {{ speechError }}
                    </p>
                    <p v-else-if="listening" class="mt-1 text-xs text-red-600">
                        <i class="pi pi-circle-fill animate-pulse" /> Recording…
                    </p>
                </div>

                <div>
                    <label class="mb-1 block text-xs tracking-wide text-surface-500 uppercase">Photo (Optional)</label>
                    <div v-if="newReportPhoto" class="flex items-center gap-3 rounded-border border border-surface p-3">
                        <img
                            v-if="newReportPhotoPreview"
                            :src="newReportPhotoPreview"
                            class="h-12 w-12 rounded object-cover"
                            alt="Preview"
                        />
                        <span class="flex-1 truncate text-sm text-color">{{ newReportPhoto.name }}</span>
                        <span class="shrink-0 text-xs text-muted-color">
                            {{ (newReportPhoto.size / 1024).toFixed(1) }} KB
                        </span>
                        <Button
                            icon="pi pi-times"
                            size="small"
                            text
                            rounded
                            severity="secondary"
                            :disabled="submitting"
                            @click="removePhoto"
                        />
                    </div>
                    <FileUpload
                        v-else
                        mode="basic"
                        :multiple="false"
                        accept="image/*"
                        choose-label="Attach Photo"
                        choose-icon="pi pi-image"
                        :disabled="submitting"
                        @select="onPhotoSelect"
                    />
                </div>

                <Message v-if="submitError" severity="error" :closable="false">{{ submitError }}</Message>
            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    severity="secondary"
                    text
                    :disabled="submitting"
                    @click="showReportModal = false"
                />
                <Button
                    label="Save Report"
                    icon="pi pi-save"
                    :loading="submitting"
                    :disabled="!newReportSummary.trim()"
                    @click="submitReport"
                />
            </template>
        </Dialog>
    </div>
</template>
