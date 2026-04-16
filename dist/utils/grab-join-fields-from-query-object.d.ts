import type { BunSQLiteQueryFieldValues, ServerQueryParam } from "../types";
type Params<Q extends Record<string, any> = Record<string, any>> = {
    query: ServerQueryParam<Q>;
};
export default function grabJoinFieldsFromQueryObject<Q extends Record<string, any> = Record<string, any>, F extends string = string, T extends string = string>({ query }: Params<Q>): BunSQLiteQueryFieldValues<F, T>[];
export {};
