'use strict'
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

const routeConventions = {
  root: './',
  component: '**/*(*Controller.js|*Component.js)',
  template: '*.html'
};

let options = {};

function generateRoutes(optionsIn) {
  options = _.defaultsDeep(optionsIn || {}, routeConventions);
  const routeGlob = getGlobFromPath(options.root, options.component);
  const files = glob.sync(routeGlob);
  const routes = generateRouteConfig(files, options);
  return routes;
}

function generateRouteConfig(files) {
  // Create routes for each controller
  let routes = files.map((file) => {
    return {
      name: getNameFromFile(file),
      url: getUrlFromFile(file),
      controller: getComponentPathFromFile(file),
      template: getTemplatePathFromFile(file)
    };
  });

  // Remove any routes that have missing templates
  routes = routes.filter((route) => {
    if (!route.template) {
      console.warn(`No templates found for: "${route.name}".  The file will not be included in the routes.`);
    }
    return !!route.template;
  });

  return routes;
}

function getNameFromFile(file) {
  let url = getUrlFromFile(file);
  return _.kebabCase(url); // TODO: Use an override function from the options object
}

function getUrlFromFile(file) {
  return path.relative(options.root, path.dirname(file));
}

function getComponentPathFromFile(file) {
  return getPathRelativeToBase(file);
}

function getTemplatePathFromFile(file) {
  let templateGlob = getGlobFromFile(file, options.template);
  let files = glob.sync(templateGlob);

  if (files.length > 1) {
    let name = getNameFromFile(file);
    console.warn(`Multiple templates found for: "${name}".  By convention only a single template should be found.  Using the first match and continuing execution.`);
  }

  return files[0] ? getPathRelativeToBase(files[0]) : undefined;
}

function getGlobFromFile(file, template) {
  const dirname = addSeperator(path.dirname(file));
  return `${dirname}${template}`;
}

function getGlobFromPath(dirname, component) {
  dirname = addSeperator(dirname);
  return `${dirname}${component}`;
}

function getPathRelativeToBase(file) {
  return path.relative(options.root, file);
}

function addSeperator(segment) {
  if (segment && !_.endsWith(segment, path.sep)) {
    segment += path.sep;
  }
  return segment;
}

const ngConfigConventions = {
  generateRoutes
};

module.exports = ngConfigConventions;
