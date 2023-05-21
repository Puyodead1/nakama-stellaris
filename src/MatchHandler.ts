const tickRate = 10;
const maxEmptyTicks = tickRate * 10; // tickRate * seconds

export interface LobbyMatchState extends nkruntime.MatchState {
    players: { [userId: string]: PlayerState };
    playerCount: number;
    gameState: EGameState;
    emptyTicks: number;

    crossPlay: boolean;
    customData: {
        hostCountryId: string;
        maxPlayers: number;
    };
    description: string;
    gameType: string;
    hostUserId: string;
    password: string;
    platform: string;
    product: string;
    public: boolean;
    serverName: string;
    version: string;
}

export interface PlayerState {
    presence: nkruntime.Presence | null;
    isReady: boolean;
}

export enum EGameState {
    InvalidStatus = "invalid",
    Lobby = "lobby",
    Running = "ingame",
    Custom = "custom",
}

export enum EOpCodes {
    UpdateState = 8,
    Unknown1 = 255,
}

export const MatchInit = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: any }
) {
    // Define the match state
    const state: LobbyMatchState = {
        players: {},
        open: true,
        crossPlay: params.cross_play,
        customData: {
            hostCountryId: params.custom_data.host_country_id,
            maxPlayers: Number(params.custom_data.max_players),
        },
        description: params.description,
        gameType: "0",
        hostUserId: ctx.userId,
        password: params.legacy_password ?? "",
        platform: params.platform,
        product: params.product,
        public: params.public,
        serverName: params.server_name,
        playerCount: 0,
        gameState: EGameState.Lobby,
        emptyTicks: 0,
        version: params.version,
    };

    // Update the match label to surface important information for players who are searching for a match
    const label = JSON.stringify({
        cross_play: state.crossPlay,
        custom_data: {
            host_country_id: state.customData.hostCountryId,
            max_players: state.customData.maxPlayers.toString(),
        },
        description: state.description,
        game_name: "stellaris",
        game_type: state.gameType,
        has_password: !!state.password,
        password: state.password,
        host_user_id: state.hostUserId,
        open: true, // TODO:
        platform: state.platform,
        presence_count: 0,
        product: state.product,
        public: state.public,
        senario: "",
        server_name: state.serverName,
        status: state.gameState,
        tags: [],
        version: state.version,
    });

    return {
        state,
        tickRate,
        label,
    };
};

export const MatchJoinAttempt = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: LobbyMatchState,
    presence: nkruntime.Presence,
    metadata: { [key: string]: any }
) {
    // Accept new players unless the required amount has been fulfilled
    let accept = true;
    if (Object.keys(state.players).length >= state.customData.maxPlayers) {
        accept = false;
    }

    // Reserve the spot in the match
    state.players[presence.userId] = { presence: null, isReady: false };

    return {
        state,
        accept,
    };
};

export const MatchJoin = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: LobbyMatchState,
    presences: nkruntime.Presence[]
) {
    // Populate the presence property for each player
    presences.forEach(function (presence) {
        state.players[presence.userId].presence = presence;
        state.playerCount++;
    });

    // If the match is full then update the state
    if (state.playerCount === state.customData.maxPlayers) {
        state.gameState = EGameState.Running;
    }

    // Update the match label
    const label = JSON.stringify({
        cross_play: state.crossPlay,
        custom_data: {
            host_country_id: state.customData.hostCountryId,
            max_players: state.customData.maxPlayers.toString(),
        },
        description: state.description,
        game_name: "stellaris",
        game_type: state.gameType,
        has_password: !!state.password,
        password: state.password,
        host_user_id: state.hostUserId,
        open: state.gameState === EGameState.Running ? false : true,
        platform: state.platform,
        presence_count: presences.length,
        product: state.product,
        public: state.public,
        senario: "",
        server_name: state.serverName,
        status: state.gameState,
        tags: [],
        version: state.version,
    });

    dispatcher.matchLabelUpdate(label);

    return {
        state,
    };
};

export const MatchLeave = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: LobbyMatchState,
    presences: nkruntime.Presence[]
) {
    // Remove the player from match state
    presences.forEach(function (presence) {
        delete state.players[presence.userId];
        state.playerCount--;
    });

    return {
        state,
    };
};

export const MatchLoop = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: LobbyMatchState,
    messages: nkruntime.MatchMessage[]
) {
    messages.forEach(function (message) {
        const data = new TextDecoder("utf-8").decode(message.data);
        if (message.opCode === EOpCodes.UpdateState) {
            state.gameState = EGameState[data];
        }

        // TODO: update match label?

        // broadcast the state to all players
        dispatcher.broadcastMessage(
            EOpCodes.UpdateState,
            new TextEncoder().encode(state.gameState.toString())
        );
    });

    // If the match is empty, increment the empty ticks
    if (state.playerCount === 0) {
        state.emptyTicks++;
    } else {
        state.emptyTicks = 0;
    }

    // If the match has been empty for too long, end it
    if (state.emptyTicks >= maxEmptyTicks) {
        return null;
    }

    return {
        state,
    };
};

export const MatchTerminate = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: LobbyMatchState,
    graceSeconds: number
) {
    return {
        state,
    };
};

export const MatchSignal = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: LobbyMatchState,
    data: string
) {
    return {
        state,
        data,
    };
};
