import { Stage } from "./stage";

export interface Workflow {
    id: number
    name: string
    creator: string
    description: string
    stages: Stage[]
}