<% importStatements.forEach((statement) => { %>import <%= statement.variable %> from '<%= statement.path %>';
<% }); %>
