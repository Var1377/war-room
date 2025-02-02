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
        max_tokens: 2048,
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
export interface GeneratedEvent {
    name: string;
    description: string;
    reasoning: string;    // Strategic reasoning behind the choice
    implications: string; // Expected consequences and impact
    satisfaction: number;
}

export const generateStakeholderEvents = async (
    scenarioId: string,
    stakeholderId: string,
    eventPath: Array<{ name: string; description: string; actor: string; reasoning?: string; implications?: string }>,
    model: string = defaultModel
): Promise<GeneratedEvent[]> => {
    // Get the full scenario context
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

    if (!scenario) throw new Error('Scenario not found');

    const stakeholder = scenario.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) throw new Error('Stakeholder not found');

    const prefix = '[{"name":';
    // Build the prompt for event generation
    const prompt = `Given the following scenario and sequence of events, generate 3-4 distinct and well-detailed possible next actions for the stakeholder.
Scenario Overview: ${scenario.overview}

Timeline of Events:
${eventPath.map((event, index) => 
    `${index + 1}. ${event.name} (by ${event.actor})
    Description: ${event.description}
    ${event.reasoning ? `Reasoning: ${event.reasoning}` : ''}
    ${event.implications ? `Implications: ${event.implications}` : ''}`
).join('\n\n')}

Acting Stakeholder: ${stakeholder.name}
Stakeholder Role: ${stakeholder.role}
Stakeholder Interests: ${stakeholder.interests}

Related Relationships:
${scenario.relationships
    .filter(r => r.stakeholder1Id === stakeholderId || r.stakeholder2Id === stakeholderId)
    .map(r => `- ${r.description}`)
    .join('\n')}

Generate 3-4 significantly different strategic options. For each option, provide:
1. A clear, concise action title
2. A detailed description of the concrete actions and steps involved
3. Strategic reasoning that explains:
   - Why this option makes sense given the context
   - How it aligns with the stakeholder's interests
   - How it responds to previous events
   - The strategic advantages of this approach
4. Strategic implications including:
   - Expected immediate consequences
   - Potential long-term impacts
   - Risks and opportunities
   - Effects on relationships with other stakeholders

Each option must be:
- A distinct strategic approach (not variations of the same strategy)
- Realistic and plausible within the context
- Clearly influenced by the sequence of previous events
- A meaningful choice with significant strategic implications

Answer in the following JSON format: [{"name":"Brief action title", "description":"Detailed description of actions", "reasoning":"Strategic reasoning and justification", "implications":"Expected consequences and impacts", "satisfaction":number from -1 to 1}]`;

    const response = await anthropic.messages.create({
        messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: prefix }
        ],
        model,
        max_tokens: 4096,  // Keep high token limit for detailed descriptions
        temperature: 0.7
    });

    const content = (response.content[0] as { text: string }).text;
    return JSON.parse(`${prefix}${content}`);
};