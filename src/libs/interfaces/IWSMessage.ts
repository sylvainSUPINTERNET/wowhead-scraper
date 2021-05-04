'use strict';
interface IWSMessage {
    source: string;
    type: string;
}

interface IWSMessageNewSubBumbleAnalysisProfiles extends IWSMessage {
    subKey: string,
    subSharedKey: string
}

const WSMessageType = {
    "NEW_SUB_BUMBLE_ANALYSIS_PROFILES": "newSubAnalysisProfiles"
};

const WSMesageSource = {
    "BUMBLE_WEB": "bumble-web"
}
