import type { TextBlock } from '@anthropic-ai/sdk/src/resources/messages/messages.js';
import { anthropic, defaultModel, prisma } from '../hooks.server';

export const analyzeScenario = async (id: string,prompt: string, model: string = defaultModel) => {
    const prefix = `{"title":"`;
    const response = await anthropic.messages.create({
        messages: [
            { role: "user", content: `What do you think about the following scenario: ${prompt}. Answer in the following JSON format: {"title":string, "overview":string, "stakeholders":[{"name":string, "role":string, "interests":string[]}]}` },
            { role: "assistant", content: prefix },
        ],
        model,
        max_tokens: 512,
    });

    const overview = JSON.parse((`${prefix}${(response.content[0] as TextBlock).text}`));
    
    const scenario = await prisma.scenario.update({
        where: { id },
        data: {
            title: overview.title,
            overview: overview.overview,
            stakeholders: {
                create: overview.stakeholders.map((s: { name: string, role: string, interests: string[] }) => ({
                    name: s.name,
                    role: s.role,
                    interests: JSON.stringify(s.interests),
                }))
            }
        },
        include: {
            stakeholders: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                    interests: true
                }
            },
            relationships: {
                select: {
                    id: true,
                    description: true,
                }
            }
        }
    });

    return scenario;
};

export const analyzeRelationships = async (id: string) => {
    const scenario = await prisma.scenario.findUnique({
        where: { id },
        include: {
            stakeholders: true,
            relationships: {
                select: {
                    id: true,
                    description: true,
                    stakeholder1: true,
                    stakeholder2: true
                }
            }
        }
    });

    if (!scenario) throw new Error('Scenario not found');

    // delete all relationships
    await prisma.relationship.deleteMany({
        where: { scenarioId: id }
    });

    // create new relationships
    await prisma.relationship.createMany({
        data: scenario.stakeholders.flatMap((s1) => 
            scenario.stakeholders.map((s2) => ({
                scenarioId: id,
                stakeholder1Id: s1.id,
                stakeholder2Id: s2.id,
                description: `The relationship between ${s1.name} and ${s2.name}`
            }))
        )
    });

    return scenario;
};