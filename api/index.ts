export const json = (data: any) => {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
/**
// Example usage:
const urls = [
  "http:/example.com",
  "https:/example.com",
  "http://example.com",
  "https://example.com",
  "http:/subdomain.example.com",
  "https:/subdomain.example.com",
];

urls.forEach((url) => {
  console.log(`Original: ${url}, Modified: ${addSlashToUrl(url)}`);
});

*/
function addSlashToUrl(url: string): string {
  // Regular expression to match http(s):/{anything}
  const regex = /(https?):\/(\/?.*)/g;
  // Replace with http(s)://{anything}
  return url.replace(regex, "$1://$2");
}

export const mergeObjectsArray = <T extends { [key: string]: any }>(
  objectsArray: T[],
): T => {
  const result = objectsArray.reduce((previous, current) => {
    return { ...previous, ...current };
  }, {} as T);

  return result;
};

export const GET = async (request: Request) => {
  const url = new URL(request.url);

  /**
   * filter sections. if given, will respond only with the sections that you selected here.
   *
   * Comma-separate the sections, then dot-separate the nested sections.
   *
   * Example: `1.0.1,2.0,5` would correspond to 3 sections: 1.0.1, 2.0, and 5. 1.0.1 means the 2nd section of the first section of the second section.
   */
  const sections = url.searchParams.get("sections")?.split(",");

  /**
   * model name. Must be one of our integrated model/provider pairs
   */
  const model = url.searchParams.get("model");

  /**
   * API key for the model
   */
  const key = url.searchParams.get("key");

  /**
   * can be provided to alter maxChunkSize, which is chunked using a recursive chunking strategy.
   */
  const maxChunkSize = url.searchParams.get("maxChunkSize") || 4096;

  /**
   * Can be provided to change the summarisation prompt
   *
   * If changed, result will not be cached.
   */
  const summarisationPrompt =
    url.searchParams.get("summarisationPrompt") ||
    "Please summarize the following section:";

  const websiteUrl = addSlashToUrl(request.url.slice(url.origin.length + 1));

  const prefixes = ["https://", "http://"];

  if (!prefixes.find((prefix) => websiteUrl.startsWith(prefix))) {
    return new Response("Please add a website URL into your path", {
      status: 400,
    });
  }

  const isJson = request.headers.get("accept") === "application/json";

  // To be later replaced with my own serverless hosted version of this
  const jinaUrl = `https://r.jina.ai/${websiteUrl}`;
  const response = await fetch(jinaUrl);

  if (!response.ok || !response.body) {
    return new Response("Failed to fetch repository", {
      status: response.status,
    });
  }

  const text = await response.text();

  //  if (!isJson) {
  return new Response(text, {
    headers: { "Content-Type": "text/markdown" },
    status: 200,
  });
  //}

  // parse markdown into this format. I have this code somewhere already
  type MdSection = {
    title: string;
    /**
     * This can be generated with generative AI starting at deepest sections first, using the summaries of children when calculating parents.
     *
     * Only to be done when provided a model + key
     */
    summary?: string;
    content?: string;
    embeds?: { alt?: string; url: string }[];
    links?: { alt?: string; url: string }[];
    children?: MdSection[];
  };

  type Md = {
    tokenCount: number;
    url: string;
    domain: string;
  } & MdSection;

  // get token size
  // get outline

  // We can now strip the content and title, which allows us to have a great index of any size of text that fits in any llm. Based on the goal, the LLM can now find the relevant sections

  // We should allow you to prune the URL by providing the sections you want to scrape. Now we have the content we wanted, in much less tokens!

  // If we cache the results, follow up queries will be super fast, and we are creating a knowledge base. Besides building my own kv-store, maybe look into adding a centralised caching layer in cloudflare. Ofc, I also want the data, so this is probably not the better solution, but it would be cheaper.

  // We can use this function recursively to gather the bigger context by also scraping all figures and/or hyperlinks, based on settings.

  // put this thing on https://github.com/CodeFromAnywhere/gpt-index-js and https://web.actionschema.com

  // let's include a list of ideas:
  // - a browser plugin to send my public website browsing history here. we'd now have a summary of browsing every day.
  // - apply the same idea for file-hierarchies. in particular the github one

  return new Response("NOTYET");
};
