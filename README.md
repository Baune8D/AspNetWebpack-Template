# AspNetWebpack-Template

This project is a minimal template for using ASP.NET Core with Webpack.  
It is built upon the original MVC template and can be customized any way you want.

Additional related repos:
* [AspNetWebpack](https://github.com/Baune8D/AspNetWebpack) - C# code for working with the generated assets.
* [aspnet-webpack](https://github.com/Baune8D/aspnet-webpack) - NPM package that helps with Webpack configuration.

The webpack configuration is configured to split all `node_modules` code into a reusable `Vendor.js` bundle.

The project also creates a view specific bundle (e.g. `Home_Index.js`) for each view or Razor Page in a corresponding folder structure.
Alternatively bundles can be manually created by adding files to the `bundles` folder.

Start development server using `npm start` in project folder.  
Build production files using `npm run build` in project folder.  

Bundles will be built for folders under `pages` and `views` that matches a corresponding MVC view or Razor page.  
Bundles will not be built for partial MVC views and Razor pages (files starting with a underscore).
