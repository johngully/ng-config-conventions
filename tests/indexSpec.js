'use strict';
const rewire = require('rewire');
const _ = require('lodash');
const ngConfigConventions = rewire('../index.js');
const root = './tests/fixtures';
let fs = require('fs');
let options;

describe('ngConfigConventions', () => {
  beforeEach(() => {
    spyOn(console, 'warn');
    mockWrite();
    options = { root: root };
  });

  it('should initialize', () => {
    expect(ngConfigConventions).toEqual(jasmine.any(Object));
    expect(ngConfigConventions.generate).toEqual(jasmine.any(Function));
    expect(ngConfigConventions.generateRoutes).toEqual(jasmine.any(Function));
  });

  describe('Generate', () => {
    it('should default the option values', () => testSetOptions(ngConfigConventions.generate));

    it('should generate both the import and router configs', () => {
      spyOn(ngConfigConventions, 'generateImportConfig');
      spyOn(ngConfigConventions, 'generateRouterConfig');
      ngConfigConventions.generate();
      expect(ngConfigConventions.generateImportConfig).toHaveBeenCalled();
      expect(ngConfigConventions.generateRouterConfig).toHaveBeenCalled();
    });
  });

  describe('Import file generation', () => {
    it('should default the option values', () => testSetOptions(ngConfigConventions.generateImports));

    it('should generate a file that imports route scripts', () => {
      mockRead();
      const expectedPath = './templates/importConfigES2015.js';
      ngConfigConventions.generateImports();
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Route file generation', () => {
    it('should default the option values', () => testSetOptions(ngConfigConventions.generateRouterConfig));

    it('should generate a file with the configured routes', () => {
      const expectedPath = 'tests/fixtures/routerConfigUiRouter.js';
      ngConfigConventions.generateRouterConfig(options);
      expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, jasmine.anything());
    });

    it('should generate a router config for UI Router when the routerType is "uiRouter"', () => {
      mockRead();
      const expectedPath = './templates/routerConfigUiRouter.js';
      options.routerType = 'uiRouter';
      ngConfigConventions.generateRouterConfig(options);
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should generate a router config for the Angular router when routerType is "ngRouter"', () => {
      mockRead();
      const expectedPath = './templates/routerConfigNgRouter.js';
      options.routerType = 'ngRouter';
      ngConfigConventions.generateRouterConfig(options);
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Route creation', () => {
    let actualRoutes;

    beforeEach(() => {
      actualRoutes = ngConfigConventions.generateRoutes(options);
    });

    it('should provide default option values', () => testSetOptions(ngConfigConventions.generateRoutes));

    it('should generate routes for controllers found by convention', () => {
      const expectedRoutes = require('./indexExpectedRoutes.json');
      expect(actualRoutes).toEqual(expectedRoutes);
    });

    it('should not generate a route if a template is missing', () => {
      const name = 'feature-2';
      const actualRoute = getRoute(name);
      const routesMissingTemplate = _.includes(actualRoutes, route => route.template.length < 1);
      expect(routesMissingTemplate).toBeFalsy();
      expect(actualRoute).toBeFalsy();
      expect(console.warn).toHaveBeenCalledWith(`No templates found for: "${name}".  The file will not be included in the routes.`);
    });

    it('should use the first template if multiple are found', () => {
      const name = 'feature-3';
      const routesWithMultipleTemplates = getRoute('feature-3');
      expect(routesWithMultipleTemplates.template).toContain('feature3Template.html');
      expect(console.warn).toHaveBeenCalledWith(`Multiple templates found for: "${name}".  By convention only a single template should be found.  Using the first match and continuing execution.`);
    });

    it('should set the "name" using kebabCase', () => {
      const expectedName = _.kebabCase('feature1');
      const actualName = actualRoutes[0].name;
      expect(actualName).toBe(expectedName);
    });

    it('should not include the root path in the url, or file paths', () => {
      const actualRoute = getRoute('feature-1');
      expect(actualRoute.url).not.toContain(root);
      expect(actualRoute.template).not.toContain(root);
      expect(actualRoute.controller).not.toContain(root);
      expect(actualRoute.component).not.toContain(root);
    });

    function getRoute(name) {
      return _.find(actualRoutes, route => route.name === name);
    }
  });

  function testSetOptions(act) {
    const expectedOptions = {};
    const setOptions = jasmine.createSpy().and.callFake(ngConfigConventions.__get__('setOptions'));
    ngConfigConventions.__set__('setOptions', setOptions);
    act(expectedOptions);
    expect(setOptions).toHaveBeenCalledWith(expectedOptions);
  }
  function mockRead() {
    spyOn(fs, 'readFileSync');
    ngConfigConventions.__set__('fs', fs);
    ngConfigConventions.generate(options);
  }

  function mockWrite() {
    spyOn(fs, 'writeFileSync');
    ngConfigConventions.__set__('fs', fs)
  }
});
