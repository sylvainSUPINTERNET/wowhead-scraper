'use strict';

interface LinkedinMessages {
    content: Array<string>;
    username: string;
    jobTitle: string;
    createdAt: string;
    updatedAt: string | null;
    parsedByUserEmail: string;
}