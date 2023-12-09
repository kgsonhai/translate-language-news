import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_time', type: 'datetime' })
  createdTime: string;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'finished_time', type: 'datetime' })
  finishedTime: string;
}
