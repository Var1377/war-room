import { openai, defaultModel, prisma } from '../hooks.server';

const model = 'gpt-4o-mini';

const ScenarioAnalysis = {
	type: 'object',
	additionalProperties: false,
	required: ['title', 'overview', 'stakeholders'],
	properties: {
		title: { type: 'string' },
		overview: { type: 'string' },
		stakeholders: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'role', 'interests'],
				properties: {
					name: { type: 'string' },
					role: { type: 'string' },
					interests: { type: 'array', items: { type: 'string' } }
				}
			}
		}
	}
};

const RelationshipAnalysis = {
	type: 'object',
	additionalProperties: false,
	required: ['relationships'],
	properties: {
		relationships: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['stakeholder1Id', 'stakeholder2Id', 'description'],
				properties: {
					stakeholder1Id: { type: 'string' },
					stakeholder2Id: { type: 'string' },
					description: { type: 'string' }
				}
			}
		}
	}
};

const StakeholderEvent = {
	type: 'object',
	additionalProperties: false,
	required: ['events'],
	properties: {
		events: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'description', 'reasoning', 'implications', 'satisfaction'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					reasoning: { type: 'string' },
					implications: { type: 'string' },
					satisfaction: { type: 'number', minimum: -1, maximum: 1 }
				}
			}
		}
	}
};

export const analyzeScenario = async (id: string, prompt: string) => {
	const response = await openai.chat.completions.create({
		model,
		messages: [
			{ role: 'user', content: `What do you think about the following scenario: ${prompt}` }
		],
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'ScenarioAnalysis',
				schema: ScenarioAnalysis
			}
		},
		max_tokens: 2048
	});

	const overview = JSON.parse(response.choices[0].message.content!);

	const scenario = await prisma.scenario.update({
		where: { id },
		data: {
			title: overview.title,
			overview: overview.overview,
			stakeholders: {
				create: overview.stakeholders.map(
					(s: { name: string; role: string; interests: string[] }) => ({
						name: s.name,
						role: s.role,
						interests: JSON.stringify(s.interests)
					})
				)
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
					description: true
				}
			}
		}
	});

	return scenario;
};

export const analyzeRelationships = async (id: string) => {
	const scenario = await prisma.scenario.findUnique({
		where: { id },
		include: { stakeholders: true }
	});

	if (!scenario) throw new Error('Scenario not found');

	const prompt = `We're in the process of analyzing the following scenario: ${scenario.overview}. The following are the stakeholders in this scenario: ${JSON.stringify(scenario.stakeholders)}. Analyze the relationships between the stakeholders. We're looking for relationships that shape the decisions of the stakeholders.`;

	const response = await openai.chat.completions.create({
		messages: [{ role: 'user', content: prompt }],
		model,
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'RelationshipAnalysis',
				schema: RelationshipAnalysis
			}
		},
		max_tokens: 2048
	});

	const { relationships } = JSON.parse(response.choices[0].message.content!);

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

export const storeRelationsInVectorDB = async (
	relationships: Array<{
		id: string;
		stakeholder1Id: string;
		stakeholder2Id: string;
		description: string;
	}>
) => {
	try {
		// Format relationships for vector DB storage
		const formattedRelations = relationships.map((rel) => ({
			id: rel.id,
			text: rel.description,
			metadata: {
				stakeholder1Id: rel.stakeholder1Id,
				stakeholder2Id: rel.stakeholder2Id
			}
		}));

		console.log(formattedRelations);

		const response = await fetch('http://localhost:5000/put_relations_in_db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formattedRelations)
		});

		if (!response.ok) {
			throw new Error('Failed to store relations in vector database');
		}

		return await response.json();
	} catch (error) {
		console.error('Error storing relations in vector DB:', error);
		throw error;
	}
};

export const queryVectorDB = async (query: string) => {
	try {
		const response = await fetch('http://localhost:5000/get_from_db', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query })
		});

		if (!response.ok) {
			throw new Error('Failed to query vector database');
		}

		return await response.json();
	} catch (error) {
		console.error('Error querying vector DB:', error);
		return { results: [] };
	}
};

export interface GeneratedEvent {
	name: string;
	description: string;
	reasoning: string; // Strategic reasoning behind the choice
	implications: string; // Expected consequences and impact
	satisfaction: number;
}

export const generateStakeholderEvents = async (
	scenarioId: string,
	stakeholderId: string,
	eventPath: Array<{
		name: string;
		description: string;
		actor: string;
		reasoning?: string;
		implications?: string;
	}>
): Promise<GeneratedEvent[]> => {
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

	const stakeholder = scenario.stakeholders.find((s) => s.id === stakeholderId);
	if (!stakeholder) throw new Error('Stakeholder not found');

	const relationships = scenario.relationships.filter(
		(r) => r.stakeholder1Id === stakeholderId || r.stakeholder2Id === stakeholderId
	);

	// Query the vector DB for relevant historical relationship data
	const vectorDbQuery = `Find relevant information about relationships between ${stakeholder.name} and ${relationships
		.map((r) => (r.stakeholder1Id === stakeholderId ? r.stakeholder2.name : r.stakeholder1.name))
		.join(', ')}`;

	const vectorDbResults = await queryVectorDB(vectorDbQuery);
	const historicalContext = vectorDbResults.results.join('\n');

	// Build the prompt for event generation
	const prompt = `Given the following scenario and sequence of events, generate 3-4 distinct and well-detailed possible next actions for the stakeholder.
Scenario Overview: ${scenario.overview}

Historical Context:
${historicalContext}

Timeline of Events:
${eventPath
	.map(
		(event, index) =>
			`${index + 1}. ${event.name} (by ${event.actor})
    Description: ${event.description}
    ${event.reasoning ? `Reasoning: ${event.reasoning}` : ''}
    ${event.implications ? `Implications: ${event.implications}` : ''}`
	)
	.join('\n\n')}

Acting Stakeholder: ${stakeholder.name}
Stakeholder Role: ${stakeholder.role}
Stakeholder Interests: ${stakeholder.interests}

Related Relationships:
${relationships.map((r) => `- ${r.description}`).join('\n')}

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
- A meaningful choice with significant strategic implications`;

	const response = await openai.chat.completions.create({
		messages: [{ role: 'user', content: prompt }],
		model,
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'StakeholderEvent',
				schema: StakeholderEvent
			}
		},
		max_tokens: 4096,
		temperature: 0.7
	});

	const { events } = JSON.parse(response.choices[0].message.content!);
	return events;
};
