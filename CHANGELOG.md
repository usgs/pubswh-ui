# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Using OAuth2 rather than a home rolled authentication.
- Using wdfn-viz rather than using USWDS directly. Note that this also means we are using USWDS version 2.x.x.

### Added
- Dockerfile and docker-compose scripts to build a pubswh-ui. This includes Jenkinsfile.build used to build the image

[Unreleased]: https://github.com/NWQMC/WQP_UI/master