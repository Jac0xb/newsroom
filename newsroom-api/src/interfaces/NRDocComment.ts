import { NRDocument } from "./NRDocument";

export interface NRDocComment {
    id: number;
    text: string;
    created: Date;
    lastUpdated: Date;
    document: NRDocument;
}
