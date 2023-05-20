export interface RPCCreateMatchPayload {
    cross_play: boolean;
    custom_data: {
        host_country_id: string;
        max_players: string;
    };
    description: string;
    game_type: string;
    legacy_password: string;
    mod: string;
    platform: string;
    product: string;
    public: boolean;
    server_name: string;
    status: string;
    tags: string[];
    version: string;
}

export function rpcCreateJominiMatch(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    payload: string
): string {
    const match_id = nk.matchCreate("jomini", JSON.parse(payload));
    return JSON.stringify({ match_id });
}
