import { prisma } from '$lib/../hooks.server';
import { analyzeScenario } from '$lib/ai';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const scenarioId = params.scenarioId;
    if (!scenarioId) {
        throw error(400, 'Invalid scenario ID');
    }

    const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: {
            stakeholders: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                    interests: true
                }
            },
        }
    });

    if (!scenario) {
        throw error(404, 'Scenario not found');
    }

    if (!scenario.title) {
        const newScenario = analyzeScenario(scenario.id, scenario.prompt, scenario.model);
        return { scenario: newScenario };
    }

    return { scenario: Promise.resolve(scenario) };
};

// http://localhost:5173/809897e6-148d-45bc-9c3c-7d799df024ea/stakeholders

export const actions = {
    default: async ({ request, params }: { request: Request; params: { scenarioId: string } }) => {
        const data = await request.formData();
        const overviewData = JSON.parse(data.get('overview')?.toString() || '{}');
        
        // First delete all relationships
        await prisma.relationship.deleteMany({
            where: { scenarioId: params.scenarioId }
        });

        // Then delete all stakeholders
        await prisma.stakeholder.deleteMany({
            where: { scenarioId: params.scenarioId }
        });

        // Update scenario and create new stakeholders
        await prisma.scenario.update({
            where: { id: params.scenarioId },
            data: {
                title: overviewData.title,
                overview: overviewData.overview,
                stakeholders: {
                    create: overviewData.stakeholders.map((s: { name: string; role: string; interests: string[] }) => ({
                        name: s.name,
                        role: s.role,
                        interests: JSON.stringify(s.interests)
                    }))
                }
            },
            include: {
                stakeholders: true
            }
        });

        throw redirect(303, `/${params.scenarioId}/relationships`);
    }
} satisfies Actions;