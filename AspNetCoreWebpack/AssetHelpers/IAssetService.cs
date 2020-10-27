#nullable disable
using System.Threading.Tasks;
using Microsoft.AspNetCore.Html;

namespace AspNetCoreWebpack.AssetHelpers
{
    public interface IAssetService
    {
        string AssetPath { get; }

        Task<HtmlString> GetScriptAsync(string resource, ScriptLoad load = ScriptLoad.Normal);

        Task<HtmlString> GetStyleAsync(string resource, StyleLoad load = StyleLoad.Normal);

        Task<string> GetFromManifestAsync(string resource, FileType type);
    }
}
