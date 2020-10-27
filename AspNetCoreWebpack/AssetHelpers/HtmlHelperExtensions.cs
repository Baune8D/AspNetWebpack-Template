using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace AspNetCoreWebpack.AssetHelpers
{
    public static class HtmlHelperExtensions
    {
        public static string GetBundleName(this IHtmlHelper html)
        {
            var path = html.ViewContext.View.Path;
            var viewPaths = path
                .Replace(".cshtml", string.Empty, StringComparison.Ordinal)
                .Split('/')
                .ToList();
            viewPaths.Remove(string.Empty);
            viewPaths.Remove("Areas");
            viewPaths.Remove("Views");
            viewPaths.Remove("Pages");
            return string.Join("_", viewPaths);
        }
    }
}
