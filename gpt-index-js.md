---
date: 2023-03
---

# GPT Index JS

Typescript + Node.js + (Also Bun.js to be) GPT Indexation toolkit.

Goal: be able to cost-effectively and performantly reduce information to be able to answer questions or refactor knowledge about a large knowledge base, and thus overcome the limitation of maximum context size for current state of the art LLM's like GPT3 and BLOOM.

Coming soon!

Inspired by https://github.com/jerryjliu/gpt_index

All collaboration appreciated. Talk with me if you want to participate on this adventure: https://calendly.com/karsens

# TODO

Make a start with GPT Index Q&A.

**Important KPI's**:

- cost for custom LLM search (realtime per query)
- cost for creating an index with LLM's (one-time)
- which LLM can be used for which prompt

Hierarchical search seems crucial. I need to determine how to do this with LLM's.

**Levels in a knowledge base (code + data + text)**

- folder/file hierarchy
- description per folder what it contains
- description per file what it contains
- per file:
  - keywords
    - code: statement names, `WordCombination`s in comments
    - data: model names, parameter names
    - text: `WordCombination`s, GPT generated keywords
  - summary
    - code: statement names, io, what they do, purpose (indexed)
    - data: get a relevant dataset (realtime)
    - text: add comment <!-- like this --> for every paragraph on what it contains, if it's not clear enough from the title itself. Below every paragraph, have a short summary in comment

**Pruning without LLM**: Keyword pruning would let us prune a lot of the knowledge already before going through all of them with LLM's. Most important here is keyword pruning probably, but also filetype and other filters. We can remove many files and folders beforehand based on matching of indexed keywords.

**LLM prompts required**:

- Recursively walk down the folder/file hierarchy (or any other generated hierarchy) using paths, keywords, and summaries. Ask the LLM about the likelyhood for something to contain info about your prompt. If the hierarchy is too big, it should be split up into multiple queries. Variables: `minimumRequiredLikelyhood`, `maximumPromptTokenSize`, `splittingStrategy`.
- Recursively walk down further on the file-contents to answer your question. We may need to change our prompt, but in the end it is the same principle; it needs to be recursive because in `.md` files there is recursion, and in `.json` items we can also use a dataset. In code the hierarchy is more flat, but it is still there: type->parameter, function name -> summary -> code, etc.
- Per obtained relevant node, create the relevant information (key details) that answer the question directly or help to answer part of it. Store this in the `GptNode[]`

**Key variables**:

- `minimumRequiredLikelyhood` is important because it may become a big difference for speed. If we can somehow keep searching but do depth first on high likelyhood places, that would maybe be best. In this case we may need a variable like `maximumTokenCost`
- `maximumPromptTokenSize` maximum size we want the prompt to be. May have big implications on quality of the result. The smaller the better. It's an important balance to find.
- `splittingStrategy`: The smaller we make our queries, the better the results might be. However, speed might go down because it would require more steps. Also, the price will go up because more tokens will be used if we create multiple smaller steps. Therefore we should be able to decide this as a variable. Especially in the early stage.

After the keyword pruning step and the LLM hierarchical step, we have gathered all pieces of information (Nodes) that are able to help us answer our prompt. Every node has a source. We can then ask the LLM to answer the question based on the Nodelist (can also be split up).

`GptNode` can look something like this:

```ts
type GptNode = {
  sourceAbsoluteFilePath: string;
  rawContent: string;
  relevantContent: string;
};
```
