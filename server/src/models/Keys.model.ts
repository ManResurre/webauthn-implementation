import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class KeysModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true })
  keyId: string | null;

  @Column({ nullable: false })
  challenge: string;

  @Column({ nullable: false })
  type: string;

  @Column({ type: 'datetime', nullable: true })
  expireAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
