import { error } from '@sveltejs/kit';
import { prisma } from '../../../hooks.server';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params}) => {
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

    return { scenario };
};

export const actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        const relationships = JSON.parse(data.get('relationships')?.toString() || '[]');
        
        // Update all relationships for this scenario
        await prisma.relationship.deleteMany({
            where: { scenarioId: params.scenarioId }
        });

        if (relationships.length > 0) {
            await prisma.relationship.createMany({
                data: relationships.map((r: { stakeholder1Id: string; stakeholder2Id: string; description: string }) => ({
                    scenarioId: params.scenarioId,
                    stakeholder1Id: r.stakeholder1Id,
                    stakeholder2Id: r.stakeholder2Id,
                    description: r.description
                }))
            });
        }

        return { success: true };
    }
} satisfies Actions; 