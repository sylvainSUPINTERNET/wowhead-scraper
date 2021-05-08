'use strict';
export interface IWSMessage {
    source: string;
    type: string;
}

export interface IWSMessageNewSubBumbleAnalysisProfiles extends IWSMessage {
    subKey: string,
    subSharedKey: string
}

export const WSMessageType = {
    "NEW_SUB_BUMBLE_ANALYSIS_PROFILES": "newSubAnalysisProfiles"
};

export const WSMesageSource = {
    "BUMBLE_WEB": "bumble-web"
}
