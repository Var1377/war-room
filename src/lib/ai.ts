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

export const analyzeRelationships = async (id: string, model: string = defaultModel) => {
    const scenario = await prisma.scenario.findUnique({
        where: { id },
        include: { stakeholders: true }
    });

    if (!scenario) throw new Error('Scenario not found');

    const prompt = `We're in the process of analyzing the following scenario: ${scenario.overview}. The following are the stakeholders in this scenario: ${JSON.stringify(scenario.stakeholders)}. Analyze the relationships between the stakeholders and return the relationships in the following JSON format: [{"stakeholder1Id":"id", "stakeholder2Id":"id", "description":"description"}]. We're looking for relationships that shape the decisions of the stakeholders.`;
    const prefix = `[{"stakeholder1Id":`;
    const response = await anthropic.messages.create({
        messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: prefix },
        ],
        model,
        max_tokens: 2048,
    });

    const relationships = JSON.parse((`${prefix}${(response.content[0] as TextBlock).text}`));

    return await prisma.scenario.update({
        where: { id },
        data: {
            relationships: {
                deleteMany: {
                    scenarioId: scenario.id
                },
                createMany: {
                    data: relationships
                }
            }
        },
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
};