import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Save server side refresh token for document management so we don't have to login every time.
 */
@Entity()
export class NRServerOAuthCredentials {
    @PrimaryColumn()
    public id: string;

    @Column()
    public refreshToken: string;
}
