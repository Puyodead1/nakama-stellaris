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
    const matches = nk.matchList(50, null, null, 0, 100, null);
    logger.debug("matches: " + JSON.stringify(matches));
    return JSON.stringify({ matches: matches });
}
