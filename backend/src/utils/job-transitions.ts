import { JobState } from "../types/job-state";


export function isValidTransition(
    current: JobState,
    next: JobState
): boolean{
    const transitions = {
        [JobState.QUEUED]: [JobState.IN_FLIGHT,],

        [JobState.IN_FLIGHT]: 
        [JobState.COMPLETED, JobState.FAILED,],
        
        [JobState.COMPLETED]: [],
        [JobState.FAILED]: []
    };
    return transitions[current].includes(next)
}