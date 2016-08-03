# ng-config-conventions
Automatically configures Angular applications by convention

# Feature Roadmap:
1. Generate routes file based upon convention
1. Support manual route definition (override convention)
1. Support configurable conventions for routes
1. Generate script imports based upon convention
1. Support excluding certain files from import
1. Support configurable conventions for imports

# Fixes
1. Add the ability to import and register additional angular items (services, directives, etc.)
1. Allow name conventions to be overridden with a function supplied to the options
1. Investigate modifying conventions to match url base or changing the root in the test application

# Completed
* Add './' to import paths
* Rename route key "template" to "templateUrl"
* Change controller from path to name using "controller as"
* Start url with leading "/"
* Move from kebab to camel case
* Allow url base configuration
