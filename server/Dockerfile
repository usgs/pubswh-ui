# Build the static assets in the node.js container.
FROM pubswh_assets as assets

RUN npm run build


# Base off the community Python image
FROM usgswma/python:debian-slim-buster-python-3.7-4117b859d9051a96f5d9729198769d2205424c99

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR $HOME/application

COPY requirements.txt .
COPY requirements-dev.txt .
ARG pip_install_args
RUN pip install $pip_install_args --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Add source files and pre-compile them
COPY . $HOME/application

RUN python -m compileall -f
RUN python -m compileall -f .

# Copy static files from the assets image to this one.
COPY --from=assets /assets/dist $HOME/assets
# Use environment variables for application configuration rather than an
# instance/config.py module.
ENV NO_INSTANCE_CONFIG=1
ENV STATIC_ASSET_PATH=$HOME/assets
ENV ASSET_MANIFEST_PATH=$HOME/assets/rev-manifest.json

USER $USER

EXPOSE 5050

CMD ["gunicorn", "--config", "gunicorn.conf", "pubs_ui:app"]