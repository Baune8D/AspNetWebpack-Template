using System.Threading.Tasks;

namespace AspNetMvcWebpack.AssetHelpers
{
    /// <summary>
    /// HttpClient to deal with webpack dev server
    /// </summary>
    public interface IAssetsHttpClient
    {
        /// <summary>
        /// Gets the content of the manifest file on the webpack dev server.
        /// </summary>
        /// <returns>The manifest content as json string.</returns>
        Task<string> GetManifestContent();
    }
}
