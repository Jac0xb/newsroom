import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRDocument, NRStage, NRUser } from "../entity";
import { PermissionService } from "./PermissionService";

@Service()
export class DocumentService {
    @InjectRepository(NRDocument)
    private dcRep: Repository<NRDocument>;

    @Inject()
    private permServ: PermissionService;

    public async getDocument(did: number): Promise<NRDocument> {
        try {
            return await this.dcRep.findOneOrFail(did);
        } catch (err) {
            console.error("Error getting document:", err);

            const errStr = `Document with ID ${did} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async appendPermToDC(dc: NRDocument, st: NRStage, usr: NRUser) {
        dc.permission = await this.permServ.getDCPermForUser(dc, st, usr);
    }

    public async appendPermsToDCS(dcs: NRDocument[], usr: NRUser) {
        for (const dc of dcs) {
            const dcwst = await this.dcRep.findOne(dc.id, {relations: ["stage"]});
            await this.appendPermToDC(dc, dcwst.stage, usr);
        }
    }

    public async appendAssigneeToDC(dc: NRDocument) {
        const ass = await this.dcRep.findOne(dc.id, {relations: ["assignee"]});
        dc.assignee = ass.assignee;
    }

    public async appendAssigneeToDCS(dcs: NRDocument[]) {
        for (const dc of dcs) {
            await this.appendAssigneeToDC(dc);
        }
    }
}
