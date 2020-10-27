#nullable disable
using System.Linq;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace AspNetCoreWebpack.AssetHelpers
{
    public static class ViewDataExtensions
    {
        /// <summary>
        /// Check the ViewData for a Webpack bundle name.
        /// </summary>
        /// <param name="viewData">The view data.</param>
        /// <returns>The name of the Webpack bundle.</returns>
        public static string GetBundleName(this ViewDataDictionary viewData)
        {
            if (!viewData.ContainsKey("Bundle") || !(viewData["Bundle"] is string))
            {
                return null;
            }

            var bundle = (string)viewData["Bundle"];
            if (!bundle.StartsWith('/'))
            {
                return bundle;
            }

            // Use Razor Page logic to resolve bundle. E.g. /Some/Bundle = Some_Bundle
            var viewPaths = bundle
                .Split('/')
                .ToList();
            viewPaths.Remove(string.Empty);
            return string.Join("_", viewPaths);
        }
    }
}
