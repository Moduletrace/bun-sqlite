type Param = {
    field: string;
    alias: string;
    separator?: string;
};
export default function sqlGenGrabConcatStr({ alias, field, separator, }: Param): string;
export {};
