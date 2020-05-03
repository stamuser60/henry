import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Examp {
  @PrimaryColumn('int')
  id: number;
}
