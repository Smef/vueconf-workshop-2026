export default defineEventHandler(async () => {
    const tags = await DailyReportTag.orderBy("name", "asc").get();
    return tags;
});
