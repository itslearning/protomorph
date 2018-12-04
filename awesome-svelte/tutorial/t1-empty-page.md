# Tutorial 1. Create a new empty page

[Back to readme](/readme.md)

Lets start to do a new area page, f.ex. page with `Index` name into `Examples` area.

## Preparations

Lets start with starting a VSCode for `Frontend` folder and starting VS2017 with `Itslearning.Web` project.

 - Execute following command to install required components
```shell
yarn install --force
```
 - Create a new folders at Frontend project `Examples/Index`
 - Create a new folder at `Itslearning.Web` project `Areas/Examples`
   - Create `Controllers` folder
   - Create `Models` folder
   - Create `Views` folder

## Frontend. Create an empty page

 - Create at `Examples/Index` a new file `view.json` and put empty js object `{}`
 - Create a new folder `Examples/Index/components`
 - Create an entry svelte component `main.svelte`
 - Put following content for a quick start:

```html
<h1>Hello world!</h1>
<p>
    This is a my first page.
</p>

<script>
export default {

}
</script>
```

 - Compile your test page with following command
```shell
yarn build --env.page=Examples/Index
```

## Backend. Register your area
 - Create a new `ExamplesAreaRegistration: ` at `Itslearning.Web` project `Areas/Examples` folder
```cs
using System.Web.Mvc;

namespace Itsolutions.Itslearning.Web.Areas.Examples
{
    public class ExamplesAreaRegistration : AreaRegistration
    {
        public const string AreaConst = "Examples";
        public override string AreaName => AreaConst;

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Examples_default",
                "Examples/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
```
 - Open `CommonSettings.cs` at `Itslearning.Web` project `Utils` folder
 - Add the following lines in `InitWebAppRootFoldersAndShares` method
```cs 
// Enables correct routing of Web/Areas/Examples
directories.Add(ExamplesAreaRegistration.AreaConst.ToLowerInvariant());
```
 - Create new `web.config` at `Areas\Examples\View` folder
```xml
<?xml version="1.0"?>

<configuration>
  <configSections>
    <sectionGroup name="system.web.webPages.razor" type="System.Web.WebPages.Razor.Configuration.RazorWebSectionGroup, System.Web.WebPages.Razor, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35">
      <section name="host" type="System.Web.WebPages.Razor.Configuration.HostSection, System.Web.WebPages.Razor, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" />
      <section name="pages" type="System.Web.WebPages.Razor.Configuration.RazorPagesSection, System.Web.WebPages.Razor, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" />
    </sectionGroup>
  </configSections>

  <system.web.webPages.razor>
    <host factoryType="System.Web.Mvc.MvcWebRazorHostFactory, System.Web.Mvc, Version=5.2.3.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" />
    <pages pageBaseType="Itsolutions.Itslearning.Web.Mvc.Views.ItslRazorViewBase">
      <namespaces>
        <add namespace="System.Web.Mvc" />
        <add namespace="System.Web.Mvc.Ajax" />
        <add namespace="System.Web.Mvc.Html" />
        <add namespace="System.Web.Routing" />
        <add namespace="Itslearning.Web.UI.Controls.Common.Utils" />
        <add namespace="Itslearning.Web.UI.Controls.Mvc" />
        <add namespace="Itsolutions.Itslearning.Web" />
        <add namespace="Itsolutions.Itslearning.Web.Utils" />
      </namespaces>
    </pages>
  </system.web.webPages.razor>

  <appSettings>
    <add key="webpages:Enabled" value="false" />
  </appSettings>

  <system.webServer>
    <handlers>
      <remove name="BlockViewHandler"/>
      <add name="BlockViewHandler" path="*" verb="*" preCondition="integratedMode" type="System.Web.HttpNotFoundHandler" />
    </handlers>
  </system.webServer>
</configuration>
```

## Backend. Create a controller

 - Create a new `ExamplesController: BaseController` controller at `Itslearning.Web` project `Areas/Examples/Controllers` folder
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
            return View();
        }
    }
}
```
 - Compile web application
 - Test your page in browser at `https://site.itsl.localhost/Examples/Examples/Index`
