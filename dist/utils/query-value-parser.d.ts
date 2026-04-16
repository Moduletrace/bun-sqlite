import type { QueryRawValueType, ServerQueryObjectValue } from "../types";
type Params = {
    query_value: ServerQueryObjectValue;
};
export default function queryValueParser({ query_value, }: Params): QueryRawValueType | QueryRawValueType[];
export {};
