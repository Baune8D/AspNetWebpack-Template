using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;

namespace AspNetMvcWebpack.AssetHelpers
{
    public class AssetService : IAssetService
    {
        private readonly HttpClient _httpClient;

        private readonly bool _developmentMode;
        private readonly string _manifestPath;
        private readonly string _assetPath;

        public JObject Manifest { get; protected set; }

        public AssetService(IHostingEnvironment hostingEnvironment, IOptions<WebpackOptions> options, HttpClient httpClient)
        {
            if (options.Value == null)
                throw new ArgumentNullException(nameof(options), "Webpack option cannot be null");

            WebpackOptions webpack = options.Value;

            _developmentMode = hostingEnvironment.IsDevelopment();

            _manifestPath = _developmentMode
                ? webpack.DevServer + webpack.AssetsPublicPath + webpack.ManifestFile
                : hostingEnvironment.WebRootPath + webpack.AssetsPublicPath + webpack.ManifestFile;

            _assetPath = _developmentMode
                ? webpack.DevServer + webpack.AssetsPublicPath
                : webpack.AssetsPublicPath;

            if (_developmentMode) _httpClient = httpClient;
            else httpClient.Dispose();
        }

        public virtual async Task<HtmlString> GetAsync(string asset, FileType type, ScriptLoad load = ScriptLoad.Normal)
        {
            if (type == FileType.Css && load != ScriptLoad.Normal) throw new Exception("You can't define load type on CSS files!");

            if (string.IsNullOrEmpty(asset)) return HtmlString.Empty;

            switch (type)
            {
                case FileType.Css:
                    asset += ".css";
                    break;
                case FileType.Js:
                    asset += ".js";
                    break;
                default:
                    throw new ArgumentNullException(nameof(type));
            }

            asset = await GetFromManifestAsýnc(asset);

            return asset != null
                ? new HtmlString(GetTag(asset, type, load))
                : HtmlString.Empty;
        }

        private string GetTag(string file, FileType type, ScriptLoad load)
        {
            var path = _assetPath + file;
            var loadType = string.Empty;

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

            switch (type)
            {
                case FileType.Css:
                    return $"<link href=\"{path}\" rel=\"stylesheet\" />";
                case FileType.Js:
                    return $"<script src=\"{path}\" {loadType}></script>";
                default:
                    throw new ArgumentException($"Unknown type {type}", nameof(type));
            }
        }

        private async Task<string> GetFromManifestAsýnc(string file)
        {
            JObject manifest;

            if (Manifest == null)
            {
                var json = _developmentMode
                    ? await _httpClient.GetStringAsync(_manifestPath)
                    : File.ReadAllText(_manifestPath);

                manifest = JObject.Parse(json);
                if (!_developmentMode) Manifest = manifest;
            }
            else
            {
                manifest = Manifest;
            }

            return manifest[file]?.Value<string>();
        }
    }
}
