# AspNetMvcWebpack

This project shows the default MVC template but using Webpack for the front-end.

This template implements the following front-end technologies:
* ES6 (Babel)
* SCSS (Extracted to seperate files)
* CSS Modules - By using ```.module.scss``` suffix
* Code splitting - Using dynamic imports ```import()```
* Sourcemaps
* Dev server (Webpack-serve)
* HMR
* Linting (Airbnb)
* Auto formatting (Prettier)

The template is setup to always include 3 bundles:
* ```Vendor``` Include all globally used vendor modules.
* ```Layout``` Include all global layout code.
* ```<View>``` Bundle including view specific code.

The root of all front-end code is ```Assets```.  
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

Included is a C# service called ```AssetService``` this service can be used through DI in views.  
It contains 1 function ```GetAsync``` which should be used to include bundles.
