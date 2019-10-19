import { INRDocument } from "./INRDocument";

export interface INRDocComment {
    id: number;
    text: string;
    created: Date;
    lastUpdated: Date;
    document: INRDocument;
}
