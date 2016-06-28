'use strict';
const rewire = require('rewire');
const _ = require('lodash');
const ngConfigConventions = rewire('../index.js');

describe('ngConfigConventions', () => {
  it('should initialize', () => {
    expect(ngConfigConventions).toEqual(jasmine.any(Object));
    expect(ngConfigConventions.generateRoutes).toEqual(jasmine.any(Function));
  });

  describe('Route creation', () => {
    let root = './tests/fixtures';
    let options;
    let actualRoutes;

    beforeEach(() => {
      spyOn(console, 'warn');
      options = { root: root };
      actualRoutes = ngConfigConventions.generateRoutes(options);
    });

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
});
