import { anthropic, defaultModel } from '../hooks.server';

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

export const load = async () => {
    const models = await anthropic.models.list();
    return { 
        models: models.data, 
        defaultModel: defaultModel,
        scenarios: DEFAULT_SCENARIOS
    };
}; 