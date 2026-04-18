type Param = {
    field: string;
    alias: string;
    separator?: string;
    distinct?: boolean;
};

export default function sqlGenGrabConcatStr({
    alias,
    field,
    separator = ",",
    distinct,
}: Param) {
    let gc = `GROUP_CONCAT(`;

    if (distinct) {
        gc += `DISTINCT `;
    }

    gc += `${field}'`;

    if (!distinct) {
        gc += `, '${separator}`;
    }
    gc += `)`;
    gc += ` AS ${alias}`;

    return gc;
}
