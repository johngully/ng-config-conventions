function ngRouterConfig ($routeProvider) {
  var routes = <%= JSON.stringify(routes) %>;
  routes.forEach(function(route) {
    $routeProvider.route(route);
  });
}

export default ngRouterConfig;
