export default defineEventHandler(async () => {
    const materials = await Material.all();
    return materials;
});
