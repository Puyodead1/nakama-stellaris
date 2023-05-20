export const OnRegisterMatchmakerMatched: nkruntime.MatchmakerMatchedFunction =
    function (
        ctx: nkruntime.Context,
        logger: nkruntime.Logger,
        nk: nkruntime.Nakama,
        matches: nkruntime.MatchmakerResult[]
    ) {
        var matchId = nk.matchCreate("jomini", { isPrivate: false });
        logger.debug(`Created jomoni match with ID: ${matchId}`);

        return matchId;
    };
