'use strict'
const _ = require('lodash');
let fs = require('fs');
const glob = require('glob');
const path = require('path');

const routeConventions = {
  root: './',
  urlBase: '/tests/fixtures/',
  component: '**/*(*Controller.js|*Component.js)',
  template: '*.html',
  routerType: 'uiRouter',
  routerConfigDest: './routerConfigUiRouter.js',
  importDest: './routerImports.js'
};

let options = {};

function generate(optionsIn) {
  setOptions(optionsIn);
  ngConfigConventions.generateImportConfig(optionsIn);
  ngConfigConventions.generateRouterConfig(optionsIn);
}

function generateImportConfig(optionsIn) {
  setOptions(optionsIn);
  const renderedTemplate = generateImports(optionsIn);
  fs.writeFileSync(path.join(options.root, options.importDest), renderedTemplate);
}

function generateImports(optionsIn) {
  setOptions(optionsIn);
  const routeGlob = getGlobFromPath(options.root, options.component);
  const files = glob.sync(routeGlob);
  const importStatements = generateImportStatementsFromFiles(files)
  // const routes = generateRoutes(optionsIn);
  // const importStatements = getImportStatmentsFromRoutes(routes);
  const templateData = { importStatements };
  const templatePath = path.join(__dirname, './templates/importConfigES2015.js');
  const renderedTemplate = generateTemplate(templatePath, templateData);
  return renderedTemplate;
}

function generateImportStatementsFromFiles(files) {
  let statements = files.map(file => {
    return {
      variable: getNameFromFile(file),
      path: '/' + getComponentPathFromFile(file)
    };
  });

  // console.log(statements);
  return statements;
}

function getImportStatmentsFromRoutes(routes) {
  return routes.map(route => {
    return {
      variable: route.name,
      path: '/' + route.controllerUrl || route.componentUrl
    };
  });
}

function generateRouterConfig(optionsIn) {
  setOptions(optionsIn);
  const routes = generateRoutes(optionsIn);
  const templateData = { routes };
  const templatePath = getRouterConfigTemplate(options.routerType);
  const renderedTemplate = generateTemplate(templatePath, templateData);
  fs.writeFileSync(path.join(options.root, options.routerConfigDest), renderedTemplate);
}

function generateTemplate(templatePath, data) {
  const file = fs.readFileSync(templatePath);
  const template = _.template(file);
  return template(data);
}

function generateRoutes(optionsIn) {
  setOptions(optionsIn);
  const routeGlob = getGlobFromPath(options.root, options.component);
  const files = glob.sync(routeGlob);
  const routes = generateRoutesFromFiles(files, options);
  return routes;
}

function generateRoutesFromFiles(files) {
  // Create routes for each controller
  let routes = files.map((file) => {
    return {
      name: getNameFromFile(file),
      url: getUrlFromFile(file),
      controller: getControllerFromFile(file),
      templateUrl: getTemplatePathFromFile(file)
    };
  });

  // Remove any routes that have missing templates
  routes = routes.filter((route) => {
    if (!route.templateUrl) {
      console.warn(`No templates found for: "${route.name}".  The file will not be included in the routes.`);
    }
    return !!route.templateUrl;
  });

  return routes;
}

function getRouterConfigTemplate(routerType) {
  let templatePath;
  switch (routerType) {
    case 'uiRouter':
      templatePath = './templates/routerConfigUiRouter.js';
      break;
    case 'ngRouter':
      templatePath = './templates/routerConfigNgRouter.js';
      break;
  }
  return path.join(__dirname, templatePath);
}

function getNameFromFile(file) {
  let url = path.relative(options.root, path.dirname(file));;
  let name = _.camelCase(url);

  // If no name is found then call back to the file name
  if (!name) {
    name = path.basename(file, path.extname(file)).replace(/(Component|Controller)/, '');
  }
  return name; // TODO: Use an override function from the options object
}

function getUrlFromFile(file) {
  let url = '/' + path.relative(options.root, path.dirname(file));
  if (options.urlBase && _.startsWith(url, options.urlBase)) {
    url = '/' + path.relative(options.urlBase, url);
  }
  return url;
}

function getControllerFromFile(file) {
  var name = getNameFromFile(file);
  return `${name}Controller as ${name}Controller`;
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

function setOptions(optionsIn) {
  options = _.defaultsDeep(optionsIn || {}, routeConventions);
}

const ngConfigConventions = {
  generate,
  generateImports,
  generateImportConfig,
  generateRoutes,
  generateRouterConfig
};

module.exports = ngConfigConventions;
