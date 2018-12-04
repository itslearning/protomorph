# Before start

- Install VSCode
- Install following plugins to VSCode:
  - ESLint
  - Svelte
- Open `/Itslearning/Frontend` folder as a workspace in VSCode
- Open terminal **View -> Terminal** <kbd>CTRL</kbd>+<kbd>`</kbd>
- Execute command to install required components
```shell 
yarn install
```
- Open VSCode preferences **File -> Preferences** <kbd>CTRL</kbd>+<kbd>,</kbd>
  - Find setting `svelte.language-server.runtime` and set it value to specific path of `node.exe` file
- Reload VSCode
- Enjoy!

# Tutorials

Tutorials are available at `tutorial` folder:

- [Tutorial 1. Create a new empty page](/tutorial/t1-empty-page.md)
- [Tutorial 2. Provide initial values](/tutorial/t2-provide-initial-values.md)
- [Tutorial 3. Use WebAPI on frontend](/tutorial/t3-use-webapi.md)

# View configuration

Create a new `view.json` file into your specific page folder and put following settings:

## Frontend configuration

- **[Optionally]** `entry` - Relative path to main svelte component. *Default:* `./components/main.svelte`;
- **[Optionally]** `appSelector` - selector for target element to bind app with. *Default:* `document.getElementsByClassName('c-svelte-${entrypointName}')[0]`;
- **[Optionally]** `useStore` - Flag, indicates that `Store` should be used for current instance of svelte application. *Default:* `false`;
- **[Optionally]** `storeFactory` - JavaScript string to initialize a new `Store` class for svelte application. *Default:* `new Store()`;
- **[Optionally]** `extraImports` - List of additional imports that should be included into result bundle:
  - `scss` - List of additional style include files

## Backend configuration

- **[Optionally]** `layout` - Path to base cshtml layout. *Default:* `~/Views/Shared/_SvelteLayout.cshtml`;
- **[Optionally]** `id` - Identifier of svelte HTML placeholder element on the resulting `.cshtml` page.

## Empty configuration

If you are right to use default settings, just create an empty `view.json` file.

# Build

Before building of your code require to install all dependencies and build all areas with following command in your console:

```
yarn install --force
yarn build
```

After that you can build only required scope to development. You can use following arguments in build:

- **[Optionally]** `--env.area` - specify area to build. *Default:* `*` *(build all areas)*;
- **[Optionally]** `--env.page` - specify page to build, use `/` to specify area and page names (see examples below). *Default:* `*` *(build all pages)*.

## Examples

Build all areas and pages

```shell
yarn build
```

Build only specified area

```shell
yarn build --env.area=StudentPlan
```

Build only specified page in area

```shell
yarn build --env.page=StudentPlan/Overview
yarn build --env.area=StudentPlan --env.page=Overview
```

Watch all areas and pages - automatically build on any change

```shell
yarn dev
```

Watch only specified area

```shell
yarn dev --env.area=StudentPlan
```

Watch only specified page in area

```shell
yarn dev --env.page=StudentPlan/Overview
yarn dev --env.area=StudentPlan --env.page=Overview
```

# Localization features

Our awesomizable infrastructure provide some kind of cool features like localization syntax. 

- `$$lang.Your_Localization_Term` - put a reference to specified localization term;
- `$$lang.__('Some text to debug')` - put your text as it is, but make a warning message in compile time;
- `$$lang.Your_Localization_Term_With_Placeholders(replacement1, replacement2)` - put a reference to specified localization term and apply placeholder replacement;
- `$$lang.__('Some text with {0}')('placeholder')` - put your text as it is and apply placeholder replacement, but make a warning message in compile time.

This syntax works fine in HTML markup in `<script>` block of `.svelte` files: just use `this.$$lang.`.

## Examples & Details

Just use following syntax in your `.svelte` files:

```html
<div>
    <b>{$$lang.Hello_world_language_term}</b>
</div>
<div>
    <button on:click="handleButtonClick(event)">
        {$$lang.Hello_button_title_language_term}
    </button>
</div>

<script>
    export default {
        methods: {
            handleButtonClick: (event) => {
                alert(this.$$lang.Say_hello_message_language_term);
            }
        }
    }
</script>
```

### Debug language term

If you want just place text, but don't forget about creating a localization term, you can use special debug term syntax - `$$lang.__('This is a debug text string')`, and after compile you can see in your page plain text. Keep simple to find missed language term with warning on complitation time. If you use debug language term in compile output you can see following warning:

```shell
WARNING! Debug language term with text 'This is a debug text string' are found in "....\components\test.svelte"
```

### Replacement placeholders

If your language term contains placeholders you can use this term as a function and just put required parameters to it for replacement. All placeholders like `{0}` replaced to proper parameter of function. The same logic as C# `String.Format` function, but without formatting features.

For example, you have term `HomePage_WelcomeDearUser` with following value `Welcome, {0}!`:

```html
<div>
    <h1>{$$lang.HomePage_WelcomeDearUser($CurrentUserName)}</h1>
</div>
```

This syntax also works fine with debug language term:

```html
<div>
    <h1>{$$lang.__('Hello, {0}!')($CurrentUserName)}</h1>
</div>
```

In both cases you see following result:
```html
<div>
    <h1>Welcome, FirstTestUser!</h1>
</div>
```

# Server-side context features

Our awesomizable infrastructure also provide possibility to quick pass server-side static variables like current user name, cdn path, etc.

Use `$$context.ContextPath` syntax to reference to required configuration value.

## Supported context items

 - `CurrentUserFirstName` - The current user authorized user first name
 - `CurrentUserName` - The current authorized user username
 - `CurrentUserPictureUrl` - The current authorized user profile picture URL
 - `CdnPath` - The base path to static content service

# Integration with PROMETHEUS

This infrastructure closelly integrated with prometheus components presented here: https://gitlab.itsbuild.net/frontend-guild/prometheus

With this infrastructure you need just to import required component and use it. You should not think about importing additional dependent styles to support markup or required theme. **Just import it!**

```html
<div>
    Counter: {counter}
</div>
<div>
    <Button type=primary text={$$lang.__('Increment')__} on:click="set({ counter: get().counter + 1})" ></Button>
    <Button type=destructive text={$$lang.__('Decrement')} on:click="set({ counter: get().counter - 1})"></Button>
</div>

<script>
export default {
    components: {
        Button: '@itslearning/prometheus/assets/inputs/Button/v1/Button.svelte'
    },
    data(): {
        return { 
            counter: 0
        };
    }
}
</script>
```

# SASS support

You can use SASS or plain CSS into svelte files. Just specify `type` attribute with `text/scss` value.

```html
...
<style type="text/scss">
    # Use any valid SASS expressions
    $size = 10px;
    $color = #A0A0AA;

    .box {
        display: block;
        width: $size;
        height: $size;
        background: $color;
    }
</style>
...
```

When you use SASS language syntax for inner styling of svelte component, our compiler automatically provide references to following files with global styling variables from `./Styles/Common.cscc`.

# TypeScript files support

You can free to create your own separate files with TypeScript syntax and then just import it in plain JS code of svelte component and **it works PERFECTLY!!!**

```html
<script>
    import { someHelperFunction } from './helpers.ts';

    export default {
        helpers: {
            someHelperFunction
        }
    }
</script>
```

# Service-side page view model

## View model generation

When your are define in your entry component `data` model structure, this framework automatically generates a view model class, that should be used as a model when page rendered.

View model structure pass into entry component data, when it created you should pass all required data to child components or handle it by required way.

You can specify **jsDoc** comments to improve threatments of your type.

View model generator use following steps to identify C# type that should be used for model property:

 - Check `@private` or `@protected` attributes, to ignore this property from view model
 - Looks at `@cstype` attribute and extract this value to determite specific C# type with fullqulified name, f.ex. `@cstype {System.Guid}` threated as `System.Guid` type
 - Check `@type` attribute and map TypeScript type to C# analog, or use `object` C# type as a fallback (see above about type mappings)
 - Try to recognize C# type from default value of property. Supported following types:
   - Strings converted to `string`
   - Numbers converted to `int`
   - Objects converted to `object`
   - Arrays converted to `System.Collections.IEnumerable`

### Type mappings (TypeScript -> C#)

| TypeScript Type | C# Type |
| --------------- | ------- |
| `number` | `int` |
| `string` | `string` |
| `boolean` | `boolean` |
| `bool` | `boolean` |
| `Array<T>` | `System.Collections.Generic.IEnumerable<T>` |
| `any` | `object` |

## Render as page

When you compile your page, all required files appeared into `Itslearning.Web` folder, you just need to add new method to controller and render page

```cs
namespace Itsolutions.Itslearning.Web.Areas.Examples.Controllers
{
    /// <summary>
    /// Controls student plan actions.
    /// </summary>
    [SessionState(SessionStateBehavior.ReadOnly)]
    public partial class ExamplesController : BaseController
    {
        [HttpGet]
        [AuthorizationRequired()]
        public virtual ViewResults Index() {
            var viewModel = new IndexViewModel {
                lines = new [] {
                    "Hello",
                    "World",
                    "Lines"
                }
            }

            return View(viewModel);
        }
    }
}
```

## Render as a control (MVC5)

If you want to render your svelte page as a control (part of existing MVC page) you can use following syntax:

```c#
Html.RenderControl(ItslWebMvc.Examples.Shared.Views.Index, Model.IndexControlModel)
```

## Render as a control (WebForms)

If you want to render your svelte page as a control (part of existing WebForm page) you can use following syntax:

```c#
RazorViewRenderer.RenderControl(ItslWebMvc.Examples.Shared.Views.Index, Model.IndexControlModel)
```