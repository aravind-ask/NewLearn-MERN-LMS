import { IInterview } from "../../models/Interview";

export interface IInterviewRepository {
  create(interview: Partial<IInterview>): Promise<IInterview>;
  findById(id: string): Promise<IInterview | null>;
  findByUserId(userId: string): Promise<IInterview[]> 
  update(id: string, interview: Partial<IInterview>): Promise<IInterview | null>;
}
