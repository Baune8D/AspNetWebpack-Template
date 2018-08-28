using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AspNetMvcWebpack.AssetHelpers
{
    /// <summary>
    /// HttpClient to deal with webpack dev server
    /// </summary>
    public sealed class AssetsHttpClient : IAssetsHttpClient
    {
        /// <summary>
        /// Dotnet internal http client
        /// </summary>
        private readonly HttpClient _httpClient;

        /// <summary>
        /// Webpack options
        /// </summary>
        private readonly WebpackOptions _options;

        /// <summary>
        /// Our logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:AspNetMvcWebpack.AssetHelpers.AssetsHttpClient"/> class.
        /// </summary>
        /// <param name="httpClient">Dotnet internal http client</param>
        /// <param name="options">Webpack options</param>
        /// <param name="logger">Our logger</param>
        public AssetsHttpClient(HttpClient httpClient, IOptions<WebpackOptions> options, ILogger<AssetsHttpClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _options = options.Value;
        }

        /// <summary>
        /// Gets the content of the manifest file on the webpack dev server.
        /// </summary>
        /// <returns>The manifest content as json string.</returns>
        public async Task<string> GetManifestContent()
        {
            _logger.LogInformation("Getting manifest content on dev server");

            try
            {
                string result = await _httpClient.GetStringAsync($"/{_options.AssetsPublicPath.Trim('/')}/{_options.ManifestFile.TrimStart('/')}");

                _logger.LogInformation("Retreived manifest content on dev server");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cannot retreive manifest file content on dev server");
                throw ex;
            }
        }
    }
}
