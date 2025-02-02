import { json } from '@sveltejs/kit';
import { generateStakeholderEvents } from '$lib/ai';

export async function POST({ request }) {
    const { scenarioId, stakeholderId, eventPath } = await request.json();

    if (!scenarioId || !stakeholderId || !eventPath) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const events = await generateStakeholderEvents(scenarioId, stakeholderId, eventPath);
        return json(events);
    } catch (error) {
        console.error('Error generating events:', error);
        return json({ error: 'Failed to generate events' }, { status: 500 });
    }
}