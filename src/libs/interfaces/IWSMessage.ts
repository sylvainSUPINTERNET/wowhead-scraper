'use strict';

import { BumbleProfile } from "../../db/documents/BumbleProfiles";

export interface IWSMessage {
    source: string;
    type: string;
}

export interface IWSMessageNewSubBumbleAnalysisProfiles extends IWSMessage {
    subKey: string,
    subSharedKey: string
}

export interface IWSMessageBumbleAnalysisProfile extends BumbleProfile {
    
}

export const WSMessageType = {
    "NEW_SUB_BUMBLE_ANALYSIS_PROFILES": "newSubAnalysisProfiles",
    "BUMBLE_ANALYSIS_ROFILE": "bumbleAnalysisProfile"
};

export const WSMesageSource = {
    "BUMBLE_WEB": "bumble-web"
}
