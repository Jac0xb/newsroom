import { Stage } from "./stage"
import { Workflow } from "./workflow"
import { User } from "./user";

export interface Document {
    id: number
    name: string
    creator: User
    content: string
    description: string
    workflow: Workflow
    stage: Stage
    googleDocId: string
}