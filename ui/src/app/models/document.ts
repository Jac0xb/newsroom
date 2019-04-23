import { Stage } from "./stage"
import { Workflow } from "./workflow"

export interface Document {
    id: number
    name: string
    creator: string
    content: string
    description: string
    workflow: Workflow
    stage: Stage
}