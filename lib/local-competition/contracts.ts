export interface RemoteAuthRepository{signIn():Promise<never>}
export interface RemoteCompetitionRepository{submitResult():Promise<never>}
export interface RemoteLeaderboardRepository{list():Promise<never>}
export interface RemoteProfileRepository{sync():Promise<never>}
export interface RemoteEmployerRepository{listOpportunities():Promise<never>}
export interface VerifiedAssessmentRepository{verify():Promise<never>}
export interface RemoteCVSyncRepository{sync():Promise<never>}
