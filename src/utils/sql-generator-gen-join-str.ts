import type {
    ServerQueryParamsJoin,
    ServerQueryParamsJoinMatchObject,
} from "../types";

type Param = {
    mtch: ServerQueryParamsJoinMatchObject;
    join: ServerQueryParamsJoin;
    table_name: string;
};

export default function sqlGenGenJoinStr({ join, mtch, table_name }: Param) {
    if (mtch.__batch) {
        let btch_mtch = ``;
        btch_mtch += `(`;

        for (let i = 0; i < mtch.__batch.matches.length; i++) {
            const __mtch = mtch.__batch.matches[
                i
            ] as ServerQueryParamsJoinMatchObject;
            btch_mtch += `${sqlGenGenJoinStr({ join, mtch: __mtch, table_name })}`;
            if (i < mtch.__batch.matches.length - 1) {
                btch_mtch += ` ${mtch.__batch.operator || "OR"} `;
            }
        }

        btch_mtch += `)`;

        return btch_mtch;
    }

    return `${
        typeof mtch.source == "object" ? mtch.source.tableName : table_name
    }.${
        typeof mtch.source == "object" ? mtch.source.fieldName : mtch.source
    }=${(() => {
        if (mtch.targetLiteral) {
            if (typeof mtch.targetLiteral == "number") {
                return `${mtch.targetLiteral}`;
            }
            return `'${mtch.targetLiteral}'`;
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
}
