# Tutorial 3. Use WebAPI on frontend

[Back to readme](/readme.md)

This tutorial based on **[Tutorial 1](t1-empty-page.md)**.

## Backend. Create a new WebApi controller

 - Create a new `ExamplesApiController: ApiController`
 - Mark controller with `[FrontEndApi]` attribute
 - Dont forget about `[AuthApiUser]` to correct autorization and `[ApiExplorerSettings(IgnoreApi = true)]` to hide this controller from API auto-gen documentation
 - Create example action `GetLines` and return some string array
 - Dont forget about `[RoutePrefix(..)]` and `[Route(...)]` attribtues
```cs
using System.Web.Http;
using System.Web.Http.Description;
using Itsolutions.Itslearning.Web.Controllers;
using Itsolutions.Itslearning.Web.RestApi.Internal;

namespace Itsolutions.Itslearning.Web.Areas.Examples.Controllers
{

    [ApiExplorerSettings(IgnoreApi = true)]
    [RoutePrefix("restapi/examples")]
    [AuthApiUser]
    [FrontEndApi]
    public class ExamplesApiController : ApiController
    {
        [Route("lines/v1")]
        public string[] GetLines()
        {
            return new[]
            {
                "line1",
                "line2",
                "line3"
            };
        }
    }
}
```
 - Run `WebApi.tt` to generate web api client for frontend side
 - Compile web application
 - New file should be created at `Frontend/Examples/Api`

## Frontend. Immidiate download

 - Open your `main.svelte` component
 - Import generated API method into component
```js
import { GetLines } from '../../Api/ExamplesApi';
```
 - Add private data item, as a promise result
```js
data() {
    return {
        /**
         * Promise to extracting lines from WebApi.
         * @private
         */
        linesPromise: GetLines()
    }
}
```
 - Use following statements into component template markup to display promise object on page
```js
{#await linesPromise}
    Loading...
{:then lines}
    {#each lines as line}
        <div>{line}</div>
    {/each}
{/await}
```
 - Compile your page and test, data should be loaded and displayed immediately

## Frontend. Download data on demand

 - Open your `main.svelte` component
 - Import generated API method into component
```js
import { GetLines } from '../../Api/ExamplesApi';
```
 - Add private data item, as a promise variable
```js
data() {
        return {
            /**
             * Promise to extracting lines from WebApi.
             * @private
             */
            linesPromise: Promise.resolve()
        }
    }
```
 - Add button handler
```js
methods: {
    handleRefreshButtonClick() {
        this.set({
            linesPromise: GetLines()
        });
    }
}
```
 - Use following statements into component template markup to display promise object on page
```js
{#await linesPromise}
    Loading...
{:then lines}
    {#each lines as line}
        <div>{line}</div>
    {/each}
{/await}
```
 - Add refresh button to upload data from API
```html
<button on:click="handleRefreshButtonClick()">
    Refresh data
</button>
```
 - Compile your page and test, data should be loaded from API when user are clicked on a button