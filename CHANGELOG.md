# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
-   Using OAuth2 rather than a home rolled authentication.
-   Using wdfn-viz rather than using USWDS directly. Note that this also means we are using USWDS version 2.x.x.
-   Updated jasmine dependency to 3.4.0
-   Updated MathJax config to support MathML (in addition to the original LaTeX)
-   Updated MathJax dependency to 3.0.0
-   Updated USGS ci/cd configuration to reflect trivial upstream changes.
-   Removed client side login dialog. Instead show a descriptive message if the service call fails with status 401
-   Updated to latest wdfn-viz (1.5) which uses USWDS 2.6

### Added
-   Dockerfile and docker-compose scripts to build a pubswh-ui. This includes Jenkinsfile.build used to build the image
-   Added a link to the google analytics metrics page on the publication page in the Additional Details table.
-   Added additional available search parameters to the manager app's search form.
-   Added support for sending logs to a Graylog server.
-   Added USGS ci/cd configuration and Dockerfile-ci for building.
-   Added Pull From SIPP button on the manager application

### Fixed
-   Tokens are refreshed are proxy service calls.
-   publication view on pubswh now propertly returns a 404 page on non-existent publication
-   Deletes in the manager now pass the accept headers correctly.
-   Fixed the browse publications feature
[Unreleased]: https://github.com/NWQMC/WQP_UI/master