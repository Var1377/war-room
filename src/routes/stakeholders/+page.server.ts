import { error } from '@sveltejs/kit';
import { anthropic } from '../../hooks.server.js';
import type { TextBlock } from '@anthropic-ai/sdk/resources/index.mjs';

export type Stakeholder = {
    name: string;
    role: string;
    interests: string[];
}

export type Overview = {
    title: string;
    overview: string;
    stakeholders: Stakeholder[];
}

export const load = async ({ url }) => {
    const model = url.searchParams.get('model');
    const prompt = url.searchParams.get('prompt');

    if (!prompt) {
        return error(400, 'No prompt provided');
    }

    if (!model) {
        return error(400, 'No model specified');
    }

    const prefix = `{"title":"`;

    const response = anthropic.messages.create({
        messages: [
            { role: "user", content: `What do you think about the following scenario: ${prompt}. Answer in the following JSON format: {"title":string, "overview":string, "stakeholders":[{"name":string, "role":string, "interests":string[]}]}` },
            { role: "assistant", content: prefix },
        ],
        model: model,
        max_tokens: 512,
    });

    const overview = response.then(message => JSON.parse((`${prefix}${(message.content[0] as TextBlock).text}`))) satisfies Promise<Overview> as Promise<Overview>;

    return {
        overview,
    };
};