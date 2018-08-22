using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace AspNetMvcWebpack.AssetHelpers
{
    public static class HtmlHelperExtensions
    {
        public static string GetBundleName(this IHtmlHelper<dynamic> html)
        {
            var path = html.ViewContext.View.Path;
            var controller = Path.GetDirectoryName(path)?.Split('\\').Last();
            var view = Path.GetFileNameWithoutExtension(path);
            if (string.IsNullOrEmpty(controller) || string.IsNullOrEmpty(view)) return null;
            return controller + "_" + view;
        }
    }
}
