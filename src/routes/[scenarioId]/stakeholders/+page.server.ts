import { prisma } from '../../../hooks.server';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    const { scenario } = await parent();
    return { scenario };
};

export const actions = {
    default: async ({ request, params }: { request: Request; params: { scenarioId: string } }) => {
        const data = await request.formData();
        const overviewData = JSON.parse(data.get('overview')?.toString() || '{}');
        
        await prisma.$transaction(async (tx) => {
            // Delete all relationships first
            await tx.relationship.deleteMany({
                where: { scenarioId: params.scenarioId }
            });

            // Delete all stakeholders
            await tx.stakeholder.deleteMany({
                where: { scenarioId: params.scenarioId }
            });

            // Update scenario and create new stakeholders
            const updatedScenario = await tx.scenario.update({
                where: { id: params.scenarioId },
                data: {
                    title: overviewData.title,
                    overview: overviewData.overview,
                    stakeholders: {
                        create: overviewData.stakeholders.map((s: { name: string; role: string; interests: string[] }) => ({
                            name: s.name,
                            role: s.role,
                            interests: s.interests.join('\n')
                        }))
                    }
                },
                include: {
                    stakeholders: true
                }
            });

            // Create an empty relationship if there are at least 2 stakeholders
            if (updatedScenario.stakeholders.length >= 2) {
                await tx.relationship.create({
                    data: {
                        scenarioId: params.scenarioId,
                        stakeholder1Id: updatedScenario.stakeholders[0].id,
                        stakeholder2Id: updatedScenario.stakeholders[1].id,
                        description: "Describe the relationship between these stakeholders..."
                    }
                });
            }
        });

        throw redirect(303, `/${params.scenarioId}/relationships`);
    }
} satisfies Actions;