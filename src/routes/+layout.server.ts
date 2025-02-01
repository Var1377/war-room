import { anthropic, defaultModel } from '../hooks.server';

const models = await anthropic.models.list();

export const load = async () => {
    return { models: models.data, defaultModel: defaultModel };
}; 