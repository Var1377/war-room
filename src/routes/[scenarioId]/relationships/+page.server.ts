import { prisma } from '$lib/../hooks.server';
import { analyzeRelationships, storeRelationsInVectorDB } from '$lib/ai';
import type { Actions } from './$types';
import type { Relationship } from '@prisma/client';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const scenarioId = params.scenarioId;
    if (!scenarioId) {
        throw error(400, 'Invalid scenario ID');
    }

    const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: {
            stakeholders: true,
            relationships: {
                include: {
                    stakeholder1: true,
                    stakeholder2: true
                }
            }
        }
    });

    if (!scenario) {
        throw error(404, 'Scenario not found');
    }

    if (!scenario.relationships.length) {
        const newRelationships = analyzeRelationships(scenario.id);
        return { scenario: newRelationships };
    }

    return { scenario: Promise.resolve(scenario) };
};

export const actions = {
    default: async ({ request, params }: { request: Request; params: { scenarioId: string } }) => {
        const data = await request.formData();
        const relationships = JSON.parse(data.get('relationships')?.toString() || '[]') as Pick<Relationship, 'id' | 'stakeholder1Id' | 'stakeholder2Id' | 'description'>[];

        // First delete all existing relationships
        await prisma.relationship.deleteMany({
            where: { scenarioId: params.scenarioId }
        });

        // Create new relationships
        await prisma.relationship.createMany({
            data: relationships.map((r) => ({
                id: r.id,
                scenarioId: params.scenarioId,
                stakeholder1Id: r.stakeholder1Id,
                stakeholder2Id: r.stakeholder2Id,
                description: r.description
            }))
        });

        console.log("RELATIONSHIPSSSSS:")
        console.log(relationships);
        console.log("\n\n\n\n");

        await storeRelationsInVectorDB(relationships);

        throw redirect(303, `/${params.scenarioId}/war-room`);
    }
} satisfies Actions;