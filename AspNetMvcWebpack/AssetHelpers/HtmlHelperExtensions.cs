using Microsoft.AspNetCore.Mvc.Rendering;

namespace AspNetMvcWebpack.AssetHelpers
{
    public static class HtmlHelperExtensions
    {
        public static string GetBundleName(this IHtmlHelper html)
        {
            var path = html.ViewContext.View.Path;
            var viewPaths = path
                .Replace("/Views/", string.Empty)
                .Replace(".cshtml", string.Empty)
                .Split("/");
            return string.Join('_', viewPaths);
        }
    }
}
