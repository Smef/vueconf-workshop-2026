<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import FileUpload from "primevue/fileupload";
import { FetchError } from "ofetch";

const { data: parents, pending: loadingParents } = useFetch("/api/app/parents");

const form = ref({
    from: "",
    subject: "",
    body: "",
});

const attachedFile = ref<File | null>(null);
const isSending = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

function onFileSelect(event: { files: File[] }) {
    attachedFile.value = event.files[0] || null;
}

function removeAttachment() {
    attachedFile.value = null;
}

async function sendEmail() {
    if (!form.value.from || !form.value.subject || !form.value.body) {
        errorMessage.value = "Please fill in all fields.";
        return;
    }

    errorMessage.value = "";
    successMessage.value = "";
    isSending.value = true;

    try {
        const formData = new FormData();
        formData.append("from", form.value.from);
        formData.append("subject", form.value.subject);
        formData.append("body", form.value.body);
        if (attachedFile.value) {
            formData.append("attachment", attachedFile.value);
        }

        await $fetch("/api/app/emails", {
            method: "POST",
            body: formData,
        });

        successMessage.value = "Email sent successfully!";
        form.value = { from: "", subject: "", body: "" };
        attachedFile.value = null;
    } catch (e) {
        if (e instanceof FetchError || e instanceof Error) {
            errorMessage.value = e.message || "An error occurred while sending the email.";
        } else {
            errorMessage.value = "An unknown error occurred while sending the email.";
        }
    } finally {
        isSending.value = false;
    }
}
</script>

<template>
    <div class="mx-auto max-w-3xl p-6">
        <h1 class="mb-6 text-3xl font-bold">Send Email (Demo)</h1>

        <Card>
            <template #content>
                <div v-if="loadingParents" class="flex justify-center p-8">
                    <ProgressSpinner />
                </div>
                <form v-else class="flex flex-col gap-4" @submit.prevent="sendEmail">
                    <div class="flex flex-col gap-2">
                        <label for="from" class="font-semibold text-color">From (Parent)</label>
                        <Select
                            id="from"
                            v-model="form.from"
                            :options="parents"
                            option-label="name"
                            option-value="email"
                            placeholder="Select a Parent"
                            class="w-full"
                        >
                            <template #option="slotProps">
                                <div>
                                    <div>{{ slotProps.option.name }}</div>
                                    <div class="text-sm text-muted-color">{{ slotProps.option.email }}</div>
                                </div>
                            </template>
                        </Select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="subject" class="font-semibold text-color">Subject</label>
                        <InputText id="subject" v-model="form.subject" placeholder="Email Subject" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="body" class="font-semibold text-color">Message</label>
                        <Textarea id="body" v-model="form.body" rows="6" placeholder="Type your message here..." />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-semibold text-color">Attachment (Optional)</label>
                        <div
                            v-if="attachedFile"
                            class="flex items-center gap-2 rounded-border border border-surface p-3"
                        >
                            <i class="pi pi-paperclip text-muted-color" />
                            <span class="flex-1 truncate text-sm text-color">{{ attachedFile.name }}</span>
                            <span class="text-xs text-muted-color">{{ (attachedFile.size / 1024).toFixed(1) }} KB</span>
                            <Button
                                icon="pi pi-times"
                                size="small"
                                text
                                rounded
                                severity="secondary"
                                type="button"
                                @click="removeAttachment"
                            />
                        </div>
                        <FileUpload
                            v-else
                            mode="basic"
                            :multiple="false"
                            choose-label="Attach File"
                            choose-icon="pi pi-paperclip"
                            @select="onFileSelect"
                        />
                    </div>

                    <Message v-if="errorMessage" severity="error" :closable="false" class="mt-2">{{
                        errorMessage
                    }}</Message>
                    <Message
                        v-if="successMessage"
                        severity="success"
                        :closable="true"
                        class="mt-2"
                        @close="successMessage = ''"
                        >{{ successMessage }}</Message
                    >

                    <div class="mt-4 flex justify-end">
                        <Button
                            type="submit"
                            label="Send Email"
                            icon="pi pi-send"
                            :loading="isSending"
                            :disabled="!form.from || !form.subject || !form.body"
                        />
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>
