export default defineEventHandler(async () => {
    const parents = await Parents.all();
    return parents;
});
