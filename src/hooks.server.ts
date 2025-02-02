import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from '$env/static/private';
import { PrismaClient } from '@prisma/client';

export const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});

export const defaultModel = "claude-3-5-haiku-20241022";

export const prisma = new PrismaClient(); 

export const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});
