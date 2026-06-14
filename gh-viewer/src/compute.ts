import { fetchParsedDefinitionIO } from '@selvajs/compute';

export async function fetchDefinition(definition: string | Uint8Array, serverUrl = 'http://localhost:8081/') {
    try {
        const io = await fetchParsedDefinitionIO(definition, {
            serverUrl
        });
        return io;
    } catch (e) {
        console.error('Failed to fetch definition IO via compute:', e);
        throw e;
    }
}
