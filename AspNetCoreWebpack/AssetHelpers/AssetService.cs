using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace AspNetCoreWebpack.AssetHelpers
{
    /// <summary>
    /// Service for including Webpack assets in UI projects.
    /// </summary>
    public class AssetService : IAssetService
    {
        private readonly HttpClient _httpClient;
        private readonly bool _developmentMode;
        private readonly string _assetBaseFilePath;
        private readonly string _manifestPath;
        private readonly Dictionary<string, string> _inlineStyles = new Dictionary<string, string>();
        private JsonDocument _manifest;

        public AssetService(IWebHostEnvironment env, IOptions<WebpackOptions> options, IHttpClientFactory httpClientFactory)
        {
            if (options.Value == null)
            {
                throw new ArgumentNullException(nameof(options), "Webpack option cannot be null");
            }

            _developmentMode = env.IsDevelopment();

            switch (env.EnvironmentName)
            {
                case "Development":
                    _assetBaseFilePath = options.Value.InternalDevServer + options.Value.AssetsPublicPath;
                    _manifestPath = _assetBaseFilePath + options.Value.ManifestFile;
                    break;
                default:
                    _assetBaseFilePath = env.WebRootPath + options.Value.AssetsPublicPath;
                    _manifestPath = _assetBaseFilePath + options.Value.ManifestFile;
                    break;
            }

            AssetPath = _developmentMode
                ? options.Value.PublicDevServer + options.Value.AssetsPublicPath
                : options.Value.AssetsPublicPath;

            if (_developmentMode)
            {
                _httpClient = httpClientFactory.CreateClient();
            }
        }

        /// <summary>
        /// Gets web path for UI assets.
        /// </summary>
        public string AssetPath { get; }

        /// <summary>
        /// Gets a html script tag for the specified asset.
        /// </summary>
        /// <param name="resource">The name of the Webpack bundle.</param>
        /// <param name="load">Enum for modifying script load behavior.</param>
        /// <returns>An HtmlString containing the html script tag.</returns>
        public async Task<HtmlString> GetScriptAsync(string resource, ScriptLoad load = ScriptLoad.Normal)
        {
            if (string.IsNullOrEmpty(resource))
            {
                return HtmlString.Empty;
            }

            resource = await GetFromManifestAsync(resource, FileType.Js).ConfigureAwait(false);

            return resource != null
                ? new HtmlString(GetScriptTag(resource, load))
                : HtmlString.Empty;
        }

        /// <summary>
        /// Gets a html style tag for the specified asset.
        /// </summary>
        /// <param name="resource">The name of the Webpack bundle.</param>
        /// <param name="load">Enum for modifying style load behavior.</param>
        /// <returns>An HtmlString containing the html style tag.</returns>
        public async Task<HtmlString> GetStyleAsync(string resource, StyleLoad load = StyleLoad.Normal)
        {
            if (string.IsNullOrEmpty(resource))
            {
                return HtmlString.Empty;
            }

            resource = await GetFromManifestAsync(resource, FileType.Css).ConfigureAwait(false);

            return resource != null
                ? new HtmlString(await GetStyleTagAsync(resource, load).ConfigureAwait(false))
                : HtmlString.Empty;
        }

        /// <summary>
        /// Gets the asset filename from the Webpack manifest.
        /// </summary>
        /// <param name="resource">The name of the Webpack bundle.</param>
        /// <param name="type">The asset file type.</param>
        /// <returns>The asset filename.</returns>
        public async Task<string> GetFromManifestAsync(string resource, FileType type)
        {
            switch (type)
            {
                case FileType.Css:
                    resource += ".css";
                    break;
                case FileType.Js:
                    resource += ".js";
                    break;
            }

            JsonDocument manifest;

            if (_manifest == null)
            {
                var json = _developmentMode
                    ? await _httpClient.GetStringAsync(new Uri(_manifestPath)).ConfigureAwait(false)
                    : await File.ReadAllTextAsync(_manifestPath).ConfigureAwait(false);

                manifest = JsonDocument.Parse(json);
                if (!_developmentMode)
                {
                    _manifest = manifest;
                }
            }
            else
            {
                manifest = _manifest;
            }

            try
            {
                return manifest.RootElement.GetProperty(resource).GetString();
            }
            catch (KeyNotFoundException)
            {
                return null;
            }
        }

        /// <summary>
        /// Function for building a script tag.
        /// </summary>
        /// <param name="file">The filename.</param>
        /// <param name="load">Enum for modifying script load behavior.</param>
        /// <returns>The html script tag.</returns>
        private string GetScriptTag(string file, ScriptLoad load)
        {
            var crossOrigin = string.Empty;
            if (_developmentMode)
            {
                crossOrigin = "crossorigin=\"anonymous\"";
            }

            var loadType = _developmentMode ? " " : string.Empty;
            switch (load)
            {
                case ScriptLoad.Async:
                    loadType += "async";
                    break;
                case ScriptLoad.Defer:
                    loadType += "defer";
                    break;
                case ScriptLoad.AsyncDefer:
                    loadType += "async defer";
                    break;
            }

            return $"<script src=\"{AssetPath}{file}\" {crossOrigin}{loadType}></script>";
        }

        /// <summary>
        /// Function for building a style tag.
        /// </summary>
        /// <param name="file">The filename.</param>
        /// <param name="load">Enum for modifying style load behavior.</param>
        /// <returns>The html style tag.</returns>
        private async Task<string> GetStyleTagAsync(string file, StyleLoad load)
        {
            if (load == StyleLoad.Inline)
            {
                if (!_developmentMode && _inlineStyles.ContainsKey(file))
                {
                    return _inlineStyles[file];
                }

                var filename = file;
                var queryIndex = filename.IndexOf('?', StringComparison.Ordinal);
                if (queryIndex != -1)
                {
                    filename = filename.Substring(0, queryIndex);
                }

                var fullPath = $"{_assetBaseFilePath}{filename}";

                var style = _developmentMode
                    ? await _httpClient.GetStringAsync(new Uri(fullPath)).ConfigureAwait(false)
                    : await File.ReadAllTextAsync(fullPath).ConfigureAwait(false);

                var result = $"<style>{style}</style>";

                if (!_developmentMode)
                {
                    _inlineStyles.Add(file, result);
                }

                return result;
            }

            return $"<link href=\"{AssetPath}{file}\" rel=\"stylesheet\" />";
        }
    }
}
