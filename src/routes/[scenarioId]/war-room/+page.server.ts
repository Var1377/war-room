import { prisma } from "$lib/../hooks.server";
import { error } from "@sveltejs/kit";
import { generateStakeholderEvents } from "$lib/ai";

export const load = async ({ params }: { params: { scenarioId: string } }) => {
    const scenario = await prisma.scenario.findUnique({
        where: { id: params.scenarioId },
        include: {
            stakeholders: true,
            relationships: true
        }
    });

    if (!scenario) {
        throw error(404, 'Scenario not found');
    }

    return { scenario: scenario };
};

export const actions = {
    getEvents: async ({ request, params }) => {
        const data = await request.formData();
        const stakeholderId = data.get('stakeholderId')?.toString();
        const eventPath = JSON.parse(data.get('eventPath')?.toString() || '[]');
        
        if (!stakeholderId) throw error(400, 'Stakeholder ID is required');
        
        const events = await generateStakeholderEvents(
            params.scenarioId,
            stakeholderId,
            eventPath
        );

        // Map the events to include actorId
        const eventsWithActor = events.map(event => ({
            ...event,
            actorId: stakeholderId
        }));

        return { events: eventsWithActor };
    }
};
