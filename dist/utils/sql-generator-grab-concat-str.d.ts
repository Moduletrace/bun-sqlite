type Param = {
    field: string;
    alias: string;
    separator?: string;
    distinct?: boolean;
};
export default function sqlGenGrabConcatStr({ alias, field, separator, distinct, }: Param): string;
export {};
