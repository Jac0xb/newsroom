
import { 
    INRRole, 
    INRUser, 
    INRStage, 
    INRDocument, 
    INRWorkflow,
    INRWFPermission, 
    INRSTPermission,
    INRTrigger,
    NRTriggerType,
    INRDocComment
} from "../../../../interfaces/index";


export class NRRole implements INRRole {

    id: number;
    name: string;
    description: string;
    created: Date;
    lastUpdated: Date;
    users: INRUser[];
    wfpermissions: NRWFPermission[];
    stpermissions: NRSTPermission[];

    constructor(init?: Partial<NRRole>) {
        Object.assign(this, init);
    }
}

export class NRUser implements INRUser {

    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    created: Date;
    lastUpdated: Date;
    roles: NRRole[];
    admin: string;

    constructor(init?: Partial<NRUser>) {
        Object.assign(this, init);
    }
}

export class NRStage implements INRStage {

    id: number;
    sequenceId: number;
    name: string;
    description: string;
    created: Date;
    lastUpdated: Date;
    permission: number;
    creator: NRUser;
    workflow: NRWorkflow;
    documents: NRDocument[];
    permissions: NRSTPermission[];
    trigger: NRTrigger;

    constructor(init?: Partial<NRStage>) {
        Object.assign(this, init);
    }
}

export class NRDocument implements INRDocument {

    id: number;
    googleDocId: string;
    name: string;
    description: string;
    created: Date;
    lastUpdated: Date;
    permission: number;
    creator: INRUser;
    workflow: NRWorkflow;
    stage: NRStage;
    comments: NRDocComment[];

    constructor(init?: Partial<NRDocument>) {
        Object.assign(this, init);
    }
}

export class NRDocComment implements INRDocComment {

    id: number;
    text: string;
    created: Date;
    lastUpdated: Date;
    document: NRDocument;

    constructor(init?: Partial<NRDocComment>) {
        Object.assign(this, init);
    }
}

export class NRWorkflow implements INRWorkflow {

    id: number;
    name: string;
    description: string;
    created: Date;
    lastUpdated: Date;
    permission: number;
    creator: INRUser;
    documents: NRDocument[];
    stages: NRStage[];
    permissions: NRWFPermission[];

    constructor(init?: Partial<NRWorkflow>) {
        Object.assign(this, init);
    }
}

export class NRWFPermission implements INRWFPermission {

    id: number;
    access: number;
    workflow: NRWorkflow;
    role: NRRole;

    public constructor (init?: Partial<NRWFPermission>) {
        Object.assign(this, init);
    }
}

export class NRSTPermission implements INRSTPermission {

    id: number;
    access: number;
    stage: NRStage;
    role: NRRole;

    public constructor(init?: Partial<NRSTPermission>) {
        Object.assign(this, init);
    }
}
 
export class NRTrigger implements INRTrigger {

    id: number;
    type: NRTriggerType;
    channelName: string;
    stage: NRStage;
    document: NRDocument;
    workflow: NRWorkflow;

    public constructor(init?: Partial<NRTrigger>) {
        Object.assign(this, init);
    }
}