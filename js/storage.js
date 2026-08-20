const STORAGE_KEY = "kdtracker-save";

const SAVE_PREFIX = "KD1:";


/*
 * Default save
 */

function createDefaultSave() {
    return {
        version: 1,
        tricks: {},
        combos: {},
        settings: {}
    };
}


/*
 * Local save
 */

export function loadSave() {
    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return createDefaultSave();
    }

    try {
        const parsed =
            JSON.parse(saved);

        return {
            ...createDefaultSave(),
            ...parsed
        };

    } catch {
        console.warn(
            "Invalid local save. Starting fresh."
        );

        return createDefaultSave();
    }
}


/*
 * Automatically save locally
 */

export function saveProgress(save) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(save)
    );
}

/* get combo */
export function getCombo(save, comboId) {

    if (!save.combos[comboId]) {
        save.combos[comboId] = {
            id: comboId,
            name: "",
            steps: [],
            attempts: 0,
            landed: 0,
            sessions: []
        };
    }

    return save.combos[comboId];
}
/*
 * Get individual trick progress
 */

export function getTrickProgress(save, trickId) {

    if (!save.tricks[trickId]) {

        save.tricks[trickId] = {
            goal: 1,
            attempts: 0,
            landed: 0,
            firstAttempt: null,
            lastAttempt: null,
            sessions: []
        };
    }

    return save.tricks[trickId];
}


/*
 * Convert Uint8Array to Base64
 */

function bytesToBase64(bytes) {
    let binary = "";

    const chunkSize = 0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {
        binary += String.fromCharCode(
            ...bytes.subarray(
                i,
                i + chunkSize
            )
        );
    }

    return btoa(binary);
}


/*
 * Convert Base64 to Uint8Array
 */

function base64ToBytes(base64) {
    const binary =
        atob(base64);

    const bytes =
        new Uint8Array(
            binary.length
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {
        bytes[i] =
            binary.charCodeAt(i);
    }

    return bytes;
}


/*
 * Make Base64 URL-safe
 */

function base64UrlEncode(base64) {
    return base64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


/*
 * Reverse URL-safe Base64
 */

function base64UrlDecode(string) {
    let base64 =
        string
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    while (base64.length % 4) {
        base64 += "=";
    }

    return base64;
}


/*
 * Compress save
 */

async function compress(text) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(text);


    const stream =
        new Blob([data])
            .stream()
            .pipeThrough(
                new CompressionStream("gzip")
            );


    const compressed =
        new Uint8Array(
            await new Response(stream)
                .arrayBuffer()
        );


    return base64UrlEncode(
        bytesToBase64(compressed)
    );
}


/*
 * Decompress save
 */

async function decompress(encoded) {

    const compressed =
        base64ToBytes(
            base64UrlDecode(encoded)
        );


    const stream =
        new Blob([compressed])
            .stream()
            .pipeThrough(
                new DecompressionStream("gzip")
            );


    const data =
        await new Response(stream)
            .arrayBuffer();


    return new TextDecoder()
        .decode(data);
}


/*
 * Export save
 */

export async function exportSave(save) {

    const json =
        JSON.stringify(save);


    const compressed =
        await compress(json);


    return SAVE_PREFIX + compressed;
}


/*
 * Import save
 */

export async function importSave(string) {

    string =
        string.trim();


    if (!string.startsWith(SAVE_PREFIX)) {
        throw new Error(
            "Invalid KDTracker save."
        );
    }


    const encoded =
        string.slice(
            SAVE_PREFIX.length
        );


    const json =
        await decompress(encoded);


    const imported =
        JSON.parse(json);


    if (
        !imported ||
        typeof imported !== "object"
    ) {
        throw new Error(
            "Invalid save data."
        );
    }


    return {
        ...createDefaultSave(),
        ...imported
    };
}
