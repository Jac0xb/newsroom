import { Stage } from "./stage";
import { User } from "./user";

export interface Workflow {
    id: number
    name: string
    creator: User
    description: string
    stages: Stage[]
}