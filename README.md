# AspNetMvcWebpack

This project shows the default MVC template but using Webpack for the front-end.

This template implements the following front-end technologies:
* ES6/7/8 (Babel)
* SCSS (Extracted to seperate files)
* CSS Modules (By using ```.module.scss``` suffix)
* Autoprefixer
* Code splitting (Using dynamic imports ```import()```)
* Sourcemaps
* Dev server (No physical files are written in development)
* Hot Module Replacement
* Cache busting (When compiling for production)
* Linting (Airbnb)
* Auto formatting (Prettier)
* Editorconfig

The template is setup to always include 3 bundles:
* ```Vendor``` Include all globally used vendor modules.
* ```Layout``` Include all global layout code.
* ```<View>``` Bundle including view specific code.

The root of all front-end code is the ```Assets``` folder.  
The following folders exists here:
* ```bundles``` use this folder to manually generate bundles.
* ```components``` for building components that can consist of multiple files.
* ```images``` for storing images for use in Webpack compiled files.
* ```json``` for storing shared JSON files.
* ```modules``` for storing single JS files that exports code.
* ```scripts``` for storing single JS files that do NOT export any code.
* ```styles``` for all shared SCSS files.
* ```vendor``` for keeping 3rd party files not available on npm.¨
* ```views``` for JS and SCSS specific to MVC views. (Non-partial views are auto generated as bundles)

All folders has Webpack aliases specified. See source for a better understanding.

package.json contains 4 scripts:
* ```build``` will compile production ready files to ```wwwroot/dist```.
* ```dev``` will start a development server.
* ```lint``` will lint all files using ```eslint``` and ```stylelint```.
* ```format``` will format all files using ```prettier-eslint```.
* ```stats``` will run Webpack build with bundle analyzer.

Included is a C# service called ```AssetService```, this service can be used through DI in views.  
It contains 1 function ```GetAsync``` which should be used to include bundles.
```csharp
Task<HtmlString> GetAsync(string resource, FileType type, ScriptLoad load = ScriptLoad.Normal);
```

Non partial views will default to loading the view specific bundle if it exists.  
To override this behaviour, a bundle can be specified manually with ```ViewData["Bundle"]```
