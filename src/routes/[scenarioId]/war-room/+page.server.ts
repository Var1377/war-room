import { prisma } from "$lib/../hooks.server";
import { error } from "@sveltejs/kit";

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

    return { scenario };
};