function uiRouterStateConfig ($stateProvider) {
  var routes = <%= JSON.stringify(routes) %>;
  routes.forEach(function(state) {
    $stateProvider.state(state);
  });
}

export default uiRouterStateConfig;
