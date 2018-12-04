# Tutorial 2. Provide initial values

[Back to readme](/readme.md)

This tutorial based on **[Tutorial 1](t1-empty-page.md)**.

## Frontend. Extend your page with data values

 - Open entry component `main.svelte` from Tuttorial 1 and add `data` section
 - Extend data model of component and describe fields, f.ex. add `lines` string array and render it on a page
 ```html
 ...
 <div>
    <div>Total lines count: {lines.length}</div>
    {#each lines as line}
        <div>{line}</div>
    {/each}
 </div>

 <script>
 export default {
     data() {
         return {
             /**
              * The user-provided lines.
              * @type {Array<string>}
              */
             lines: []
         }
     }
 }
 </script>
 ```
- Run page build
```shell
yarn build --env.page=Examples/Index
```
- New file `IndexViewModel` should be created in `Itslearning.Web` project at `Areas/Examples/Models` folder

## Backend. Provide view model for page

 - View model for your page should be automatically generated and included into `Itslearning.Web` VS project
 - Change controller action at `ExamplesController.Index()`
```cs
[HttpGet]
[AuthorizationRequired()]
public virtual ViewResult Index() {
    var viewModel = new IndexViewModel {
        lines = new [] {
            "Hello",
            "World",
            "Lines"
        }
    }

    return View(viewModel);
}
```
 - Compile web application and test page in browser