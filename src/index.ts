import "fast-text-encoding";

import { rpcCreateJominiMatch } from "./CreateMatch";
import { rpcListMatches } from "./ListMatches";
import {
    LobbyMatchState,
    MatchInit,
    MatchJoin,
    MatchJoinAttempt,
    MatchLeave,
    MatchLoop,
    MatchSignal,
    MatchTerminate,
} from "./MatchHandler";

function InitModule(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
    initializer.registerMatch<LobbyMatchState>("jomini", {
        matchInit: MatchInit,
        matchJoinAttempt: MatchJoinAttempt,
        matchJoin: MatchJoin,
        matchLeave: MatchLeave,
        matchLoop: MatchLoop,
        matchSignal: MatchSignal,
        matchTerminate: MatchTerminate,
    });

    // initializer.registerMatchmakerMatched(OnRegisterMatchmakerMatched);

    initializer.registerRpc("list_matches", rpcListMatches);
    initializer.registerRpc("create_jomini_match", rpcCreateJominiMatch);
    logger.info("TypeScript module loaded.");
}

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);
