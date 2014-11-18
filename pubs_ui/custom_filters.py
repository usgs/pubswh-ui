'''
Created on Nov 10, 2014

@author: ayan
'''
from werkzeug.routing import BuildError
try:
    from werkzeug.urls import url_quote
except ImportError:
    from urlparse import quote as url_quote
from flask.globals import _app_ctx_stack, _request_ctx_stack, request
from pubs_ui import app


# unused fix for flask-images showing up on dev, qa, and production servers
def url_for_images(endpoint, **values):
    """Generates a URL to the given endpoint with the method provided.

    Variable arguments that are unknown to the target endpoint are appended
    to the generated URL as query arguments.  If the value of a query argument
    is `None`, the whole pair is skipped.  In case blueprints are active
    you can shortcut references to the same blueprint by prefixing the
    local endpoint with a dot (``.``).

    This will reference the index function local to the current blueprint::

        url_for('.index')

    For more information, head over to the :ref:`Quickstart <url-building>`.

    To integrate applications, :class:`Flask` has a hook to intercept URL build
    errors through :attr:`Flask.build_error_handler`.  The `url_for` function
    results in a :exc:`~werkzeug.routing.BuildError` when the current app does
    not have a URL for the given endpoint and values.  When it does, the
    :data:`~flask.current_app` calls its :attr:`~Flask.build_error_handler` if
    it is not `None`, which can return a string to use as the result of
    `url_for` (instead of `url_for`'s default to raise the
    :exc:`~werkzeug.routing.BuildError` exception) or re-raise the exception.
    An example::

        def external_url_handler(error, endpoint, **values):
            "Looks up an external URL when `url_for` cannot build a URL."
            # This is an example of hooking the build_error_handler.
            # Here, lookup_url is some utility function you've built
            # which looks up the endpoint in some external URL registry.
            url = lookup_url(endpoint, **values)
            if url is None:
                # External lookup did not have a URL.
                # Re-raise the BuildError, in context of original traceback.
                exc_type, exc_value, tb = sys.exc_info()
                if exc_value is error:
                    raise exc_type, exc_value, tb
                else:
                    raise error
            # url_for will use this result, instead of raising BuildError.
            return url

        app.build_error_handler = external_url_handler

    Here, `error` is the instance of :exc:`~werkzeug.routing.BuildError`, and
    `endpoint` and `**values` are the arguments passed into `url_for`.  Note
    that this is for building URLs outside the current application, and not for
    handling 404 NotFound errors.

    .. versionadded:: 0.10
       The `_scheme` parameter was added.

    .. versionadded:: 0.9
       The `_anchor` and `_method` parameters were added.

    .. versionadded:: 0.9
       Calls :meth:`Flask.handle_build_error` on
       :exc:`~werkzeug.routing.BuildError`.

    :param endpoint: the endpoint of the URL (name of the function)
    :param values: the variable arguments of the URL rule
    :param _external: if set to `True`, an absolute URL is generated. Server
      address can be changed via `SERVER_NAME` configuration variable which
      defaults to `localhost`.
    :param _scheme: a string specifying the desired URL scheme. The `_external`
      parameter must be set to `True` or a `ValueError` is raised.
    :param _anchor: if provided this is added as anchor to the URL.
    :param _method: if provided this explicitly specifies an HTTP method.
    """
    appctx = _app_ctx_stack.top
    reqctx = _request_ctx_stack.top
    if appctx is None:
        raise RuntimeError('Attempted to generate a URL without the '
                           'application context being pushed. This has to be '
                           'executed when application context is available.')

    # If request specific information is available we have some extra
    # features that support "relative" urls.
    if reqctx is not None:
        url_adapter = reqctx.url_adapter
        blueprint_name = request.blueprint
        if not reqctx.request._is_old_module:
            if endpoint[:1] == '.':
                if blueprint_name is not None:
                    endpoint = blueprint_name + endpoint
                else:
                    endpoint = endpoint[1:]
        else:
            # TODO: get rid of this deprecated functionality in 1.0
            if '.' not in endpoint:
                if blueprint_name is not None:
                    endpoint = blueprint_name + '.' + endpoint
            elif endpoint.startswith('.'):
                endpoint = endpoint[1:]
        external = values.pop('_external', False)

    # Otherwise go with the url adapter from the appctx and make
    # the urls external by default.
    else:
        url_adapter = appctx.url_adapter
        if url_adapter is None:
            raise RuntimeError('Application was not able to create a URL '
                               'adapter for request independent URL generation. '
                               'You might be able to fix this by setting '
                               'the SERVER_NAME config variable.')
        external = values.pop('_external', True)

    anchor = values.pop('_anchor', None)
    method = values.pop('_method', None)
    scheme = values.pop('_scheme', None)
    appctx.app.inject_url_defaults(endpoint, values)

    if scheme is not None:
        if not external:
            raise ValueError('When specifying _scheme, _external must be True')
        url_adapter.url_scheme = scheme

    try:
        rv = url_adapter.build(endpoint, values, method=method,
                               force_external=external)
    except BuildError as error:
        # We need to inject the values again so that the app callback can
        # deal with that sort of stuff.
        values['_external'] = external
        values['_anchor'] = anchor
        values['_method'] = method
        return appctx.app.handle_url_build_error(error, endpoint, values)

    if anchor is not None:
        rv += '#' + url_quote(anchor)
    return app.config['WSGI_STR'] + rv


def display_publication_info(json_content):
    publication_year = json_content['publicationYear']
    series_title_text = json_content['seriesTitle']['text']
    if json_content.get('seriesTitle', None) and json_content.get('seriesNumber', None):
        series_number = json_content['seriesNumber']
        chapter = json_content.get('chapter', None)
        subchapter = json_content.get('subChapter', None)
        if chapter and subchapter:
            pub_info = '{publication_year}, {title} {series_number} {chapter} {subchapter}'.format(publication_year=publication_year,
                                                                                                   title=series_title_text,
                                                                                                   series_number=series_number,
                                                                                                   chapter=chapter,
                                                                                                   subchapter=subchapter
                                                                                                   )
        elif chapter and not subchapter:
            pub_info = '{publication_year}, {title} {series_number} {chapter}'.format(publication_year=publication_year,
                                                                                      title=series_title_text,
                                                                                      series_number=series_number,
                                                                                      chapter=chapter
                                                                                      )
        else:
            pub_info = '{publication_year}, {title} {series_number}'.format(publication_year=publication_year,
                                                                            title=series_title_text,
                                                                            series_number=series_number
                                                                            )
        full_pub_info = pub_info           
    elif json_content.get('seriesTitle', None) and json_content.get('publicationType', None).get('text', None) == 'Article':
        start_page = json_content.get('startPage', None)
        end_page = json_content.get('endPage', None)
        try:
            volume = json_content['volume']
            pub_info = '{publication_year}, {title} ({volume}) {start_page}'.format(publication_year=publication_year,
                                                                                    title=series_title_text,
                                                                                    volume=volume,
                                                                                    start_page=start_page
                                                                                    )
        except KeyError:
            volume = None
            pub_info = '{publication_year}, {title} {start_page}'.format(publication_year=publication_year,
                                                                         title=series_title_text,
                                                                         start_page=start_page
                                                                         )
        if end_page:
            full_pub_info = '{pub_info}-{end_page}'.format(pub_info=pub_info, end_page=end_page)
        else:
            full_pub_info = pub_info
    else:
        pass
    return full_pub_info
        