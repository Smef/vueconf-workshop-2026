<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import Card from "primevue/card";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import ScrollPanel from "primevue/scrollpanel";

const { data: parents, status: dbStatus, error: dbError } = await useFetch("/api/app/test/parents");

interface ChatMessage {
    role: "user" | "assistant";
    text: string;
}

const messages = ref<ChatMessage[]>([]);
const input = ref("");
const sending = ref(false);

async function sendMessage() {
    const text = input.value.trim();
    if (!text || sending.value) return;

    messages.value.push({ role: "user", text });
    input.value = "";
    sending.value = true;

    try {
        const { reply } = await $fetch<{ reply: string }>("/api/app/test/gemini", {
            method: "POST",
            body: { message: text },
        });
        messages.value.push({ role: "assistant", text: reply });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Request failed";
        messages.value.push({ role: "assistant", text: `Error: ${message}` });
    } finally {
        sending.value = false;
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-semibold">Setup Test</h1>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Verify your database connection and Gemini API key are working.
            </p>
        </div>

        <Card>
            <template #title>Database</template>
            <template #content>
                <div v-if="dbStatus === 'pending'" class="flex items-center gap-2">
                    <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
                    <span class="text-sm text-surface-500">Loading…</span>
                </div>

                <Message v-else-if="dbError" severity="error" :closable="false">
                    <strong>Connection failed:</strong> {{ dbError.message }}
                </Message>

                <template v-else>
                    <Message severity="success" :closable="false" class="mb-4">
                        Connected — {{ parents?.length ?? 0 }} Parent records loaded.
                    </Message>
                    <DataTable :value="parents ?? []" striped-rows size="small">
                        <Column field="id" header="ID" style="width: 60px" />
                        <Column field="name" header="Name" />
                        <Column field="email" header="Email" />
                        <Column field="favorite_color" header="Favorite Color" />
                        <Column field="birthday" header="Birthday">
                            <template #body="{ data }">
                                {{ data.birthday ? new Date(data.birthday).toLocaleDateString() : "—" }}
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </template>
        </Card>

        <Card>
            <template #title>Gemini API</template>
            <template #content>
                <ScrollPanel style="height: 18rem" class="mb-3">
                    <div class="flex flex-col gap-3 p-1">
                        <p v-if="messages.length === 0" class="text-sm text-surface-400">
                            Send a message to test your Gemini API key.
                        </p>
                        <div
                            v-for="(msg, i) in messages"
                            :key="i"
                            class="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                            :class="
                                msg.role === 'user'
                                    ? 'ml-auto bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100'
                                    : 'bg-surface-100 text-surface-900 shadow-sm dark:bg-surface-800 dark:text-surface-100'
                            "
                        >
                            {{ msg.text }}
                        </div>
                        <div v-if="sending" class="text-sm text-surface-400 italic">Thinking…</div>
                    </div>
                </ScrollPanel>

                <div class="flex gap-2">
                    <Textarea
                        v-model="input"
                        placeholder="Type a message and press Enter…"
                        rows="2"
                        class="flex-1 resize-none"
                        :disabled="sending"
                        @keydown="handleKeydown"
                    />
                    <Button
                        icon="pi pi-send"
                        :loading="sending"
                        :disabled="!input.trim()"
                        aria-label="Send"
                        @click="sendMessage"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>
