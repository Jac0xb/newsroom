
import { 
    NRRole as INRRole, 
    NRRole as INRGroup, 
    NRUser as INRUser, 
    NRStage as INRStage, 
    NRDocument as INRDocument, 
    NRWorkflow as INRWorkflow, 
    NRDCPermission as INRDCPermission, 
    NRWFUSPermission as INRWFUSPermission, 
    NRWFPermission as INRWFPermission, 
    NRSTPermission as INRSTPermission, 
    NRDCUSPermission as INRDCUSPermission, 
    NRSTUSPermission as INRSTUSPermission, 
    NRTrigger as INRTrigger, 
    NRUserSummary as INRUserSummary,
    NRDocComment as INRDocComment
} from "../../../../newsroom-api/src/interfaces";


export class NRRole implements INRRole {
    id: number;    name: string;
    description: string;
    created: Date;
    lastUpdated: Date;
    users: NRUser[];
    wfpermissions: NRWFPermission[];
    stpermissions: NRSTPermission[];
    dcpermissions: NRDCPermission[];

    constructor(init?: Partial<NRRole>) {
        Object.assign(this, init);
    }
}

export class NRGroup implements INRGroup {
    id: number;    name: string;
    description: string;
    created: Date;
    lastUpdated: Date;
    users: NRUser[];
    wfpermissions: NRWFPermission[];
    stpermissions: NRSTPermission[];
    dcpermissions: NRDCPermission[];

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
    roles: INRRole[];
    wfpermissions: INRWFUSPermission[];
    stpermissions: INRSTUSPermission[];
    dcpermissions: INRDCUSPermission[];

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
    creator: INRUser;
    workflow: INRWorkflow;
    documents: INRDocument[];
    permissions: INRSTPermission[];
    usrpermissions: INRSTUSPermission[];

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
    workflow: INRWorkflow;
    stage: INRStage;
    permissions: INRDCPermission[];
    usrpermissions: INRDCUSPermission[];
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
    document: INRDocument;

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
    documents: INRDocument[];
    stages: INRStage[];
    permissions: INRWFPermission[];
    usrpermissions: INRWFUSPermission[];

    constructor(init?: Partial<NRWorkflow>) {
        Object.assign(this, init);
    }
}

export class NRDCPermission implements INRDCPermission {
    id: number;    
    access: number;
    document: INRDocument;
    role: INRRole;

    constructor(init?: Partial<NRDCPermission>) {
        Object.assign(this, init);
    }
}

export class NRWFUSPermission implements INRWFUSPermission {
    id: number;    
    access: number;
    workflow: INRWorkflow;
    user: INRUser;

    constructor(init?: Partial<NRWFUSPermission>) {
        Object.assign(this, init);
    }
}

export class NRWFPermission implements INRWFPermission {
    id: number;    
    access: number;
    workflow: INRWorkflow;
    role: INRRole;

    constructor (init?: Partial<NRWFPermission>) {
        Object.assign(this, init);
    }
}

export class NRSTPermission implements INRSTPermission {
    id: number;    
    access: number;
    stage: INRStage;
    role: INRRole;

    constructor(init?: Partial<NRSTPermission>) {
        Object.assign(this, init);
    }
}

export class NRDCUSPermission implements INRDCUSPermission {
    id: number;    
    access: number;
    document: INRDocument;
    user: INRUser;

    constructor(init?: Partial<NRDCUSPermission>) {
        Object.assign(this, init);
    }
} 

export class NRSTUSPermission implements INRSTUSPermission {
    id: number;    
    access: number;
    stage: INRStage;
    user: INRUser;

    constructor(init?: Partial<NRSTUSPermission>) {
        Object.assign(this, init);
    }
}
 
export class NRTrigger implements INRTrigger {
    id: number;    name: string;
    type: import("../../../../newsroom-api/src/interfaces/NRTrigger").NRTriggerType;
    channelName: string;
    documents: INRDocument[];
    workflows: INRWorkflow[];

    constructor(init?: Partial<NRTrigger>) {
        Object.assign(this, init);
    }
}

export class NRUserSummary implements INRUserSummary {
    userWriteWorkflows: Set<INRWorkflow>;    
    userWriteStages: Set<INRStage>;
    userReadWorkflows: Set<INRWorkflow>;
    userReadStages: Set<INRStage>;
    groupWriteWorkflows: Set<INRWorkflow>;
    groupWriteStages: Set<INRStage>;
    groupReadWorkflows: Set<INRWorkflow>;
    groupReadStages: Set<INRStage>;
    groups: INRRole[];

    constructor(init?: Partial<NRUserSummary>) {
        Object.assign(this, init);
    }
}