using System.Threading.Tasks;
using Microsoft.AspNetCore.Html;

namespace AspNetMvcWebpack.AssetHelpers
{
    public interface IAssetService
    {
        Task<HtmlString> GetAsync(string resource, FileType type, ScriptLoad load = ScriptLoad.Normal);
    }
}
