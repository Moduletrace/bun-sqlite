export default function sqlGenGrabConcatStr({ alias, field, separator = ",", distinct, }) {
    let gc = `GROUP_CONCAT(`;
    if (distinct) {
        gc += `DISTINCT `;
    }
    gc += `${field}, '${separator}'`;
    gc += `)`;
    gc += ` AS ${alias}`;
    return gc;
}
