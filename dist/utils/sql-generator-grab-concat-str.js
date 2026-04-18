export default function sqlGenGrabConcatStr({ alias, field, separator = ",", }) {
    let gc = `GROUP_CONCAT(${field}, '${separator}') AS ${alias}`;
    return gc;
}
