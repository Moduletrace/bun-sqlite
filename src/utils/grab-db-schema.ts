import init from "../functions/init";

export default async function grabDbSchema() {
    const { dbSchema } = await init();
    return dbSchema;
}
