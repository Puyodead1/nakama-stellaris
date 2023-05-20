export interface RPCListMatchesPayload {
    min_players: number;
    max_players: number;
    cross_play: boolean;
    platform: string;
}

export function rpcListMatches(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    payload: string
): string {
    const matchList = nk.matchList(50, null, null, 0, 100, null);
    const matches: Record<string, object> = {};
    for (const match of matchList) {
        matches[match.matchId] = JSON.parse(match.label);
    }
    return JSON.stringify({ matches });
}
