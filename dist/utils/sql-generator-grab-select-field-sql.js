import sqlGenGrabConcatStr from "./sql-generator-grab-concat-str";
export default function sqlGenGrabSelectFieldSQL({ selectFields, append_table_names, table_name }) {
    let str = "";
    str += ` ${selectFields
        ?.map((fld) => {
        let fld_str = ``;
        const final_fld_name = typeof fld == "object"
            ? append_table_names
                ? `${table_name}.${String(fld)}`
                : `${String(fld.fieldName)}`
            : `${String(fld)}`;
        if (typeof fld == "object") {
            const fld_name = `${String(fld.fieldName)}`;
            if (fld.count) {
                fld_str += `COUNT(${fld_name})`;
                if (fld.count.alias) {
                    fld_str += ` AS ${fld.count.alias}`;
                }
            }
            else if (fld.sum) {
                fld_str += `SUM(${fld_name}) AS ${fld.sum.alias}`;
            }
            else if (fld.group_concat) {
                fld_str += sqlGenGrabConcatStr({
                    field: fld_name,
                    alias: fld.group_concat.alias,
                    separator: fld.group_concat.separator,
                });
            }
            else {
                fld_str +=
                    final_fld_name + (fld.alias ? ` as ${fld.alias}` : ``);
            }
        }
        else {
            fld_str += final_fld_name;
        }
        return fld_str;
    })
        .join(",")}`;
    return str;
}
