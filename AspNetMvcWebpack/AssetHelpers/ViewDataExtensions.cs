using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace AspNetMvcWebpack.AssetHelpers
{
    public static class ViewDataExtensions
    {
        public static string GetBundleName(this ViewDataDictionary viewData)
        {
            if (viewData.ContainsKey("Bundle"))
            {
                return (string)viewData["Bundle"];
            }
            return null;
        }
    }
}
