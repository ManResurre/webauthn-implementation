import { Entity, Column, PrimaryGeneratedColumn, Index, BaseEntity } from 'typeorm';

@Entity()
@Index('IDX_CHALLENGE', ['challenge'], { unique: true, sparse: true })
@Index('IDX_EXPIRE_AT', ['expireAt'], { sparse: true })
export class SessionsModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  challenge: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'datetime', nullable: true })
  expireAt?: Date;
}
