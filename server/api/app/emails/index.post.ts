import { z } from "zod";

const fieldsSchema = z.object({
    from: z.string().email(),
    subject: z.string().min(1),
    body: z.string().min(1),
});

export default defineEventHandler(async (event) => {
    const parts = await readMultipartFormData(event);

    const { from, subject, body } = fieldsSchema.parse({
        from: parts?.find((p) => p.name === "from")?.data.toString(),
        subject: parts?.find((p) => p.name === "subject")?.data.toString(),
        body: parts?.find((p) => p.name === "body")?.data.toString(),
    });

    const attachment = parts?.find((p) => p.name === "attachment");

    // This stops TS from complaining about unused variables. You should remove this and implement you actual email processing.
    void { from, subject, body, attachment };

    // This is just a fake endpoint, so we simply return success
    return {
        success: true,
        message: "Email sent successfully (fake)",
    };
});
