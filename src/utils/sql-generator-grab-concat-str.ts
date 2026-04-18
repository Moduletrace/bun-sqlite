type Param = {
    field: string;
    alias: string;
    separator?: string;
};

export default function sqlGenGrabConcatStr({
    alias,
    field,
    separator = ",",
}: Param) {
    let gc = `GROUP_CONCAT(${field}, '${separator}') AS ${alias}`;
    return gc;
}
