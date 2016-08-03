<% importStatements.forEach((statement) => { %>import <%= statement.variable %> from '<%= statement.path %>';
<% }); %>

function registerRouterComponents(module) {
  <% importStatements.forEach((statement) => { %>module.controller('<%= statement.variable %>Controller', <%= statement.variable %>);
  <% }); %>
}

export default registerRouterComponents;
