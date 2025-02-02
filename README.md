# War Room
RAG techniques are useful in integrating up-to-date information and enhancing response quality, particularly in specialised domains
 
In our exploration, we have specifically applied this within the context of a war room simulation. Every node represents a constituent country, and the edges forward a particular decision choice. The instantiation of the simulation enables aggregating multiple new instances of chain of decisions from the source node to all active world participants, this therefore lists all outcomes on its fringes. We additionally use qualitive metrics such as an evaluative function, a factual verifier to realign the prompts and alongside using historical data to capture the semantic processes.
 
- The evaluation function is used as it propagates the sequential prompts from a user’s particular decision choice, and its cascading consequences – (confidence interval?)
- We innovated upon the primitive RAG actions of both the querying and retrieval to act as a feedback mechanism, whereby the model leverages the naturally produced contextual trail of what decisions were made at some route in the timeline, this necessarily facilitates in the generation of rational decisions from our prompt engineering methodologies
- Lastly, as LLM’s are prone to producing outdated information or fabricating facts, a large cumulative error that could grow exponentially is misinformation, hence we verify the prompts against the google search engine to minimise this negative side effect.

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
