import { Stage} from "./stage";

export class Workflow {
    id: number | undefined
    name: string | undefined
    creator: string | undefined
    description: string | undefined
    stages: Stage[] = []
}