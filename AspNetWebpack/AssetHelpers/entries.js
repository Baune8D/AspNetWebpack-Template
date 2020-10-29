/* eslint-disable import/no-extraneous-dependencies */

const glob = require('glob');
const path = require('path');

module.exports = (base, area = null) => {
  const entries = {};

  const addEntry = (file, name) => {
    const bundleName = area !== null ? `${area}_${name}` : name;
    entries[bundleName] = file;
  };

  // Get all predefined asset bundles
  const bundleGlob = path.resolve(base, 'Assets/**/bundles/*.js');
  const bundles = glob.sync(bundleGlob);

  bundles.forEach((bundle) => {
    const ext = path.extname(bundle);
    const name = path.basename(bundle, ext);
    addEntry(bundle, name);
  });

  // Find all views and razor pages
  let views = [];
  const findViews = (type) => {
    const viewPath = path.resolve(base, type).replace(/\\/g, '/');
    const viewGlob = path.resolve(viewPath, '**/*.cshtml');
    views = views.concat(
      glob
        .sync(viewGlob, {
          ignore: ['**/_*.cshtml'],
        })
        .map((value) => {
          return value
            .replace(/\\/g, '/')
            .replace('.cshtml', '')
            .replace(`${viewPath}/`, '');
        }),
    );
  };
  findViews('Views');
  findViews('Pages');

  // Get all asset view folders containing an index.js file
  const findAssets = (type) => {
    const assetViewPath = path.resolve(base, `Assets/${type}`);
    const assetViewGlob = path.resolve(assetViewPath, '**/index.js');
    const assetViews = glob.sync(assetViewGlob);

    const currentPath = `${assetViewPath.replace(/\\/g, '/')}/`;
    assetViews.forEach((view) => {
      const filePath = path.dirname(view).replace(currentPath, '');

      // If the folder path matches a razor view, include it as a bundle
      if (views.includes(filePath)) {
        const basename = filePath.split('/').join('_');
        addEntry(view, basename);
      }
    });
  };
  findAssets('views');
  findAssets('pages');

  return entries;
};
