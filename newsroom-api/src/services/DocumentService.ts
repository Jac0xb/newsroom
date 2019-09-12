import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { DBConstants, NRDCPermission, NRDocument, NRUser } from "../entity";
import { UserService } from "./UserService";

@Service()
export class DocumentService {
    @InjectRepository(NRDocument)
    private documentRepository: Repository<NRDocument>;

    @InjectRepository(NRDCPermission)
    private permDCRepository: Repository<NRDCPermission>;

    @Inject()
    private userService: UserService;

    // Get a document based on ID.
    public async getDocument(did: number): Promise<NRDocument> {
        try {
            return await this.documentRepository.findOneOrFail(did);
        } catch (err) {
            console.error("Error getting document:", err);

            const errStr = `Document with ID ${did} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Determine if a user has READ/WRITE on a document.
    public async getDocumentPermissionForUser(doc: NRDocument, user: NRUser): Promise<number> {
        const allRoles = await this.userService.getUserRoles(user.id);

        let allowed = false;

        for (const role of allRoles) {
            const roleRight = await this.permDCRepository
                .createQueryBuilder(DBConstants.DCPERM_TABLE)
                .select(`MAX(${DBConstants.DCPERM_TABLE}.access)`, "max")
                .where(`${DBConstants.DCPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${DBConstants.DCPERM_TABLE}.documentId = :dcid`, {dcid: doc.id})
                .getRawOne();

            if (roleRight.max === DBConstants.WRITE) {
                allowed = true;
                break;
            }
        }

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    // Add permission field to a single doc.
    public async addPermissionsToDoc(doc: NRDocument, user: NRUser): Promise<NRDocument> {
        doc.permission = await this.getDocumentPermissionForUser(doc, user);
        return doc;
    }

    // Add permission field to many docs.
    public async addPermissionsToDocs(docs: NRDocument[], user: NRUser): Promise<NRDocument[]> {
        for (let doc of docs) {
            doc = await this.addPermissionsToDoc(doc, user);
        }

        return docs;
    }
}
