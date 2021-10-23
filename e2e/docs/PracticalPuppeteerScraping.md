# Practical functional patterns for async flow control with Puppeteer

## Organizing Page Interactions

Below is a function that accepts a Puppeteer [Browser](https://pptr.dev/#?product=Puppeteer&version=v1.13.0&show=api-class-browser) object and a string url.  It creates a [Page](https://pptr.dev/#?product=Puppeteer&version=v1.13.0&show=api-class-page) object, and then scrapes an Array of string tags from that page.  Note that Puppeteer may [not be the ideal tool](https://medium.com/@gajus/it-is-a-really-silly-idea-to-use-puppeteer-to-scrape-the-web-da62a9f3de7e) for every web scraping project (but you could use this to organize other Page methods, too):

```typescript
const async scrapePage = (browser: Browser, url: string) => {
  const page = browser.newPage()
  const tags = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.tags'))
      .map(el => el.innerHTML)
      .map(s => s.toLowerCase());
  });
  page.close();
  return tags;
}
```

This looks okay, but imagine that you want scrape more data.  Say, `n` more fields.  Then `scrapePage` has many responsibilities– it creates and disposes a page + performs `n` page interactions.  The `scrapePage` method could easily grow to 100+ lines with only a few interactions. Let's extract the `page.evaluate` invocation to a new function and scrape some more fields:

```typescript
const scrapeTags = (page: Page) => {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('.tags'))
      .map(el => el.innerHTML)
      .map(s => s.toLowerCase());
  });
});

const scrapePage = async (browser: Browser, url: string) => {
  const page = browser.newPage()
  const tags = await scrapeTags(page);
  const title = await scrapeTitle(page);
  const author = await scrapeAuthor(page);
  page.close();
  return { tags, title, author };
}
```

Great.  Now the `page.evaluate` is wrapped in a descriptive, self-documenting function.  `scrapePage` looks much cleaner, too.  Its concerns are 1) creating and disposing the page object, and 2) aggregating the results of the Page interactions.  This is fine for now.

One point of improvement is the nested `return` in the `scrapeTags` method.  We are returning `page.evaluate`, which is then returning a mapped array.  We can use the [implicit return](https://stackoverflow.com/a/28889451/10230843) of an arrow function to more tersely express this, while also eliminating some nesting:

```typescript
const scrapeTags = (page: Page) => page.evaluate(() => {
  return Array.from(document.querySelectorAll('.tags'))
    .map(el => el.innerHTML)
    .map(s => s.toLowerCase());
});

const scrapePage = async (browser: Browser, url: string) => {
  const page = browser.newPage()
  const tags = await scrapeTags(page);
  const title = await scrapeTitle(page);
  const author = await scrapeAuthor(page);
  page.close();
  return { tags, title, author };
}
```

Done.  Now our page interactions are organized into a handful of pure, easy-to-understand functions, and we can easily add more.  They are also easy to order and arrange.  Bonus: Typescript infers the return type of `scrapeTags` without explicitly specifying.

## A note on using `async` `await` with `Page`

When `await` is used one after another, each await is resolved in blocking sequential order.  Sometimes this is what you want (e.g. retrieve 1 record to then use that to retrieve a second record).  However, given many [I/O bound tasks](https://en.wikipedia.org/wiki/I/O_bound) that don't depend on each other, over-using `await` can be costly.

In the `scrapePage` method, `scrapeTitle` is not invoked until `tags` is resolved because of `await`. However, in this scenario it actually doesn't cost much. The `Page` object **can only execute 1 `evaluate` at a time**, and thus `scrapeTags`, `scrapeTitle`, and `scrapeAuthor` will be executed in blocking sequential order no matter what.

I want to note that it's possible to kick off all the `Promise` returning functions at once, and then wait for all of them to resolve together.  [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) + [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) + [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976) can be useful and expressive with `await`:

```typescript
const scrapePage = async (browser: Browser, url: string) => {
  const page = browser.newPage();
  const [tags, title, author] = await Promise.all([
    scrapeTags(page),
    scrapeTitle(page),
    scrapeAuthor(page)
  ]);
  page.close();
  return { tags, title, author };
}
```

I benchmarked this for my use case and did not detect a measurable improvement in performance.  However, [here](https://github.com/agaricide/puppeteer-functional-patterns/blob/master/examples/promise-all-test.js) is a simple example that illustrates the performance benefits of `Promise.all` in I/O bound contexts.

## Multi-Page async flow control

At this point we have a `scrapePage` function:

```typescript
const scrapePage = async (browser: Browser, url: string) => {
  const page = browser.newPage()
  const tags = await scrapeTags(page);
  const title = await scrapeTitle(page);
  const author = await scrapeAuthor(page);
  page.close();
  return { tags, title, author };
}
```

**But now we have to scrape 5,000 pages.**  How do we do it?  Here is simple first pass:

```typescript
const scrapePages = async (browser: Browser, urls: string[]) => {
  const results = [];
  for (const url of urls) {
    const page = await scrapePage(browser, url);
    results.push(page);
  }
  return results;
}
```

Reasonable attempt.  But remember that each await is resolved in sequential blocking order?  In the function above, we will always be scraping 1 page at a time.  The `await`ed `scrapePage` resolves, then is `push`ed into the results, and then the loop repeats.  This is fine for a few hundred pages, but could it be improved given 5,000+ web pages?  Can we make it better, faster, and more functional?  Loading web pages is asynchronous I/O.  We could open many pages at once to improve CPU utilization as we wait for other page requests to resolve:

```typescript
const scrapePages = (browser: Browser, urls: string[]) => {
  const promises = urls.map(url => scrapePage(browser, url));
  const result: any[] = Promise.all(promises);
  return result;
}
```

This is a naive attempt at opening many pages in parallel.  It attempts to open up 5,000 headless Chrome windows at once, and it's awful.  It will crash Node.  It will also nuke the website that is being scraped.  If your trying to scrape data from a website and that is against the TOS, this might get you in trouble.  Likewise if the website has API limits.  Opening 5,000 Chrome windows at once is an accident under most circumstances.

How to improve, then? Conceptually, you can think of Puppeteer's headless Chrome browser as a [shared resource.](https://pdfs.semanticscholar.org/ba17/4c6f41a24a54726eaf81c187a8dd7907766c.pdf)  In this scenario, we want to throttle the amount of pages that are spawned by the shared resource as we map over our list of page urls.  We can model this with the npm package [generic-pool](https://github.com/coopernurse/node-pool#readme) to make a shared [pool](https://github.com/coopernurse/node-pool#createpool) of Puppeteer Pages.  We will pull `browser.newPage()` out of `scrapePage`, and then make a simple `pageFactory` to specify how our pool will `create` and `destroy` pages:

```typescript
import * as pool from 'generic-pool';

const pageFactory = (browser: Browser) => {
  return {
    create: () => browser.newPage(),
    destroy: (page: Page) => page.close()
  };
};

const scrapePage = async (page: Page, url: string) => {
  const tags = await scrapeTags(page);
  const title = await scrapeTitle(page);
  const author = await scrapeAuthor(page);
  return { tags, title, author };
};

const scapePages = async (browser: Browser, urls: string[]) => {
  const pagePool = pool.createPool(pageFactory(browser), { max: 5 });
  const tasks = urls.map(async (url) => {
    const page = await pagePool.acquire();
    const data = await scrapePage(page, url);
    pagePool.release(page);
    return data;
  });
  return Promise.all(tasks);
}
```

Each concurrent async function that is invoked as we `map` over the `urls` array calls `pagePool.acquire`.  We set `{ max: 5 }`, so the first 5 functions immediately acquire puppeteer Pages.  The remaining functions are paused until one of the first 5 functions invokes `pagePool.release`, then `pagePool` disposes of that Page, and then `acquire()` resolves with a `create`d Page.

We can now specify the max number of Pages open concurrently.  This throttling solves the Node crashing, website nuking, and TOS violating problems.  It also removes Page creating responsibilities from `scrapePage`, which now _only_ aggregates page interactions (thus better separating concerns).  The factory abstraction also paves the way for more interesting optimizations, e.g. [recycling Page objects.](https://unity3d.com/learn/tutorials/topics/2d-game-creation/recycling-obstacles-object-pooling) Despite these benefits, it admittedly also adds non-trivial [conceptual complexity](http://reviewthecode.blogspot.com/2016/01/wtf-per-minute-actual-measurement-for.html) to our `scapePages` implementation.

In the next blog post, we will use our scrapePages to build streaming abstractions to scrape 500,000 pages. Thank you!
