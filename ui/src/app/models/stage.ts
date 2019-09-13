import { User } from "./user";

export interface Stage {
    id: number
    name: string
    creator: User
    description: string
    sequenceId: number
}