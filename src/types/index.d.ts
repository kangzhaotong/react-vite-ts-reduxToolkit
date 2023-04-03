export interface sizeType {
    width: number;
    height: number;
}
export interface dataType {
    label: string;
    stroke: string;
    fill: string;
    fontFill: string;
    fontSize: number;
}
export interface Props {
    size: sizeType;
    data: dataType;
    ['Props']: any;
}
export type Datum = {
    nodes?: unknown[];
    egdes?: unknown[];
};