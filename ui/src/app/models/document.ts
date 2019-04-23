import { Stage } from "./stage"
import { Workflow } from "./workflow"

export class Document {
    id: number | undefined
    name: string | undefined
    creator: string | undefined
    content: string | undefined
    description: string | undefined
    workflow: Workflow | undefined
    stage: Stage | undefined
}