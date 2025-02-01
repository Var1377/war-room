import { Anthropic } from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { PrismaClient } from '@prisma/client';

export const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});

export const defaultModel = "claude-3-5-haiku-20241022";

export const prisma = new PrismaClient(); 