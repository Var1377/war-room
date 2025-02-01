import { prisma } from '$lib/../hooks.server';
import { error } from '@sveltejs/kit';

export const load = async ({ params}) => {
    const scenarioId = params.scenarioId;
    if (!scenarioId) {
        throw error(400, 'Invalid scenario ID');
    }

    const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: {
            stakeholders: true,
            relationships: true
        }
    });

    if (!scenario) {
        throw error(404, 'Scenario not found');
    }

    return { scenario };
};
