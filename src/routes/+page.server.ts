import { anthropic, defaultModel, prisma } from '$lib/../hooks.server';
import { error, redirect } from '@sveltejs/kit';

const DEFAULT_SCENARIOS = [
    {
        title: "South China Sea Tensions",
        prompt: "Analyze the current situation regarding territorial disputes and military presence in the South China Sea, focusing on the interactions between China, neighboring Southeast Asian nations, and the United States."
    },
    {
        title: "Middle East Peace Process",
        prompt: "Examine the ongoing developments in Middle East peace negotiations, particularly focusing on regional stability, diplomatic relations, and the role of international mediators."
    },
    {
        title: "Arctic Resource Competition",
        prompt: "Evaluate the increasing competition for Arctic resources and shipping routes between Russia, Canada, the United States, and other Arctic Council nations."
    },
    {
        title: "Cybersecurity Warfare",
        prompt: "Assess the growing threat of state-sponsored cyber attacks and their impact on international relations, focusing on major cyber powers and defensive alliances."
    }
];

export const load = (async () => {
    const models = await anthropic.models.list();
    return { 
        models: models.data, 
        defaultModel: defaultModel,
        scenarios: DEFAULT_SCENARIOS
    };
});

export const actions = {
    analyze: async ({ request }: { request: Request }) => {
        const data = await request.formData();
        const prompt = data.get('prompt')?.toString();
        const model = data.get('model')?.toString();

        if (!prompt || !model) {
            throw error(400, 'Missing required fields');
        }
        
        const scenario = await prisma.scenario.create({
            data: {
                prompt,
                model,
                title: "",
                overview: "",
            }
        });

        throw redirect(303, `/${scenario.id}/stakeholders`);
    }
}; 