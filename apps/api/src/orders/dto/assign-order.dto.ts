import { IsOptional, IsString } from 'class-validator';

export class AssignOrderDto {
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @IsOptional()
  @IsString()
  reason?: string;
}
