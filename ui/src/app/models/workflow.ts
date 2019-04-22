import { Stage} from "./stage";

export class Workflow {
    id: number | undefined
    name: string | undefined
    stages: Stage[] = []
}