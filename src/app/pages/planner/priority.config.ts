export type PriorityLevel = 'bassa' | 'media' | 'alta';

export const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
    bassa: 1,
    media: 1.5,
    alta: 2
}