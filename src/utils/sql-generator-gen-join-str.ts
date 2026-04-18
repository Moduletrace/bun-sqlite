import type {
    ServerQueryParamsJoin,
    ServerQueryParamsJoinMatchObject,
    SQLInsertGenValueType,
} from "../types";

type Param = {
    mtch: ServerQueryParamsJoinMatchObject;
    join: ServerQueryParamsJoin;
    table_name: string;
};

export default function sqlGenGenJoinStr({ join, mtch, table_name }: Param) {
    let values: SQLInsertGenValueType[] = [];

    if (mtch.__batch) {
        let btch_mtch = ``;
        btch_mtch += `(`;

        for (let i = 0; i < mtch.__batch.matches.length; i++) {
            const __mtch = mtch.__batch.matches[
                i
            ] as ServerQueryParamsJoinMatchObject;

            const { str, values: batch_values } = sqlGenGenJoinStr({
                join,
                mtch: __mtch,
                table_name,
            });

            btch_mtch += str;

            values.push(...batch_values);

            if (i < mtch.__batch.matches.length - 1) {
                btch_mtch += ` ${mtch.__batch.operator || "OR"} `;
            }
        }

        btch_mtch += `)`;

        return {
            str: btch_mtch,
            values,
        };
    }

    const equality = mtch.raw_equality || "=";

    const lhs = `${
        typeof mtch.source == "object" ? mtch.source.tableName : table_name
    }.${typeof mtch.source == "object" ? mtch.source.fieldName : mtch.source}`;

    const rhs = `${(() => {
        if (mtch.targetLiteral) {
            values.push(mtch.targetLiteral);

            // if (typeof mtch.targetLiteral == "number") {
            //     return `${mtch.targetLiteral}`;
            // }
            // return `'${mtch.targetLiteral}'`;

            return `?`;
        }

        if (join.alias) {
            return `${
                typeof mtch.target == "object"
                    ? mtch.target.tableName
                    : join.alias
            }.${
                typeof mtch.target == "object"
                    ? mtch.target.fieldName
                    : mtch.target
            }`;
        }

        return `${
            typeof mtch.target == "object"
                ? mtch.target.tableName
                : join.tableName
        }.${
            typeof mtch.target == "object" ? mtch.target.fieldName : mtch.target
        }`;
    })()}`;

    if (mtch.between) {
        values.push(mtch.between.min, mtch.between.max);

        return {
            str: `${lhs} BETWEEN ? AND ?`,
            values,
        };
    }

    if (mtch.not_between) {
        values.push(mtch.not_between.min, mtch.not_between.max);

        return {
            str: `${lhs} NOT BETWEEN ? AND ?`,
            values,
        };
    }

    return {
        str: `${lhs} ${equality} ${rhs}`,
        values,
    };
}
