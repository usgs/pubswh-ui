# Build the static assets in the node.js container.
FROM wqp_assets as assets

RUN npm run build


# Base off the community Python image
FROM usgswma/python:debian-slim-stretch-python-3.7-24e21a7a7fc0ecea73ebfd36da71c320c3fb803d

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR $HOME/application

COPY requirements.txt .
COPY requirements-dev.txt .
ARG pip_install_args
RUN echo $pip_install_args
RUN pip install $pip_install_args --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Add source files and pre-compile them
COPY . $HOME/application

RUN python -m compileall -f
RUN python -m compileall -f .

# Copy static files from the assets image to this one.
COPY --from=assets /assets/dist $HOME/assets

ENV ASSET_MANIFEST_PATH=$HOME/assets/rev-manifest.json

USER $USER

EXPOSE 5050

CMD ["gunicorn", "--config", "gunicorn.conf", "wqp:app"]