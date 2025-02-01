import { prisma } from "$lib/../hooks.server";

export const load = async ({ params }: { params: { scenarioId: string } }) => {
    const scenario = await prisma.scenario.findUnique({
        where: { id: params.scenarioId },
        include: {
            stakeholders: true,
            relationships: true
        }
    });
    return { scenario };
};