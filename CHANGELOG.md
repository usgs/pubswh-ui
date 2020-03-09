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

### Added
-   Dockerfile and docker-compose scripts to build a pubswh-ui. This includes Jenkinsfile.build used to build the image
-   Added a link to the google analytics metrics page on the publication page in the Additional Details table.
-   Added additional available search parameters to the manager app's search form.
-   Added support for sending logs to a Graylog server.
-   Added USGS ci/cd configuration and Dockerfile-ci for building.

[Unreleased]: https://github.com/NWQMC/WQP_UI/master