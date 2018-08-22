using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace AspNetMvcWebpack.AssetHelpers
{
    public static class ViewDataExtensions
    {
        public static string GetBundleName(this ViewDataDictionary<dynamic> viewData)
        {
            if (viewData.ContainsKey("__Bundle"))
            {
                return (string)viewData["__Bundle"];
            }
            return null;
        }
    }
}
