import type { TableSelectFieldsObject } from "../types";
import sqlGenGrabConcatStr from "./sql-generator-grab-concat-str";

type Param<T extends { [key: string]: any } = { [key: string]: any }> = {
    selectFields: (keyof T | TableSelectFieldsObject<T>)[];
    append_table_names?: boolean;
    table_name: string;
};

export default function sqlGenGrabSelectFieldSQL<
    T extends { [key: string]: any } = { [key: string]: any },
>({ selectFields, append_table_names, table_name }: Param<T>) {
    let str = "";

    str += ` ${selectFields
        ?.map((fld) => {
            let fld_str = ``;

            const final_fld_name =
                typeof fld == "object"
                    ? append_table_names
                        ? `${table_name}.${String(fld)}`
                        : `${String(fld.fieldName)}`
                    : `${String(fld)}`;

            if (typeof fld == "object") {
                const fld_name = `${String(fld.fieldName)}`;

                if (fld.count) {
                    fld_str += `COUNT(${fld_name})`;
                } else if (fld.sum) {
                    fld_str += `SUM(${fld_name})`;
                } else if (fld.average) {
                    fld_str += `AVERAGE(${fld_name})`;
                } else if (fld.max) {
                    fld_str += `MAX(${fld_name})`;
                } else if (fld.min) {
                    fld_str += `MIN(${fld_name})`;
                } else if (fld.distinct) {
                    fld_str += `DISTINCT ${fld_name}`;
                } else if (fld.group_concat) {
                    fld_str += sqlGenGrabConcatStr({
                        field: fld_name,
                        alias: fld.group_concat.alias,
                        separator: fld.group_concat.separator,
                        distinct: fld.group_concat.distinct,
                    });
                } else {
                    fld_str +=
                        final_fld_name + (fld.alias ? ` as ${fld.alias}` : ``);
                }

                if (fld.alias) {
                    fld_str += ` AS ${fld.alias}`;
                }
            } else {
                fld_str += final_fld_name;
            }

            return fld_str;
        })
        .join(",")}`;

    return str;
}
