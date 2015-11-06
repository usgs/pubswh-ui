Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
Description: =======
        webargs
        =======
        
        .. image:: https://badge.fury.io/py/webargs.png
            :target: http://badge.fury.io/py/webargs
        
        .. image:: https://travis-ci.org/sloria/webargs.png?branch=master
            :target: https://travis-ci.org/sloria/webargs
        
        Homepage: https://webargs.readthedocs.org/
        
        webargs is a Python utility library for parsing HTTP request arguments, with built-in support for popular web frameworks, including Flask, Django, Bottle, Tornado, and Pyramid.
        
        .. code-block:: python
        
            from flask import Flask
            from webargs import Arg
            from webargs.flaskparser import use_args
        
            app = Flask(__name__)
        
            hello_args = {
                'name': Arg(str, required=True)
            }
        
            @app.route('/')
            @use_args(hello_args)
            def index(args):
                return 'Hello ' + args['name']
        
            if __name__ == '__main__':
                app.run()
        
            # curl http://localhost:5000/\?name\='World'
            # Hello World
        
        Install
        -------
        
        ::
        
            pip install -U webargs
        
        webargs supports Python >= 2.6 or >= 3.3.
        
        
        Documentation
        -------------
        
        Full documentation is available at https://webargs.readthedocs.org/.
        
        
        License
        -------
        
        MIT licensed. See the `LICENSE <https://github.com/sloria/webargs/blob/master/LICENSE>`_ file for more details.
        
        
        Changelog
        ---------
        
        0.9.1 (2014-12-11)
        ******************
        
        - Fix behavior of ``multiple=True`` when nesting Args. Thanks Derrick Gilland for reporting.
        
        0.9.0 (2014-12-08)
        ******************
        
        * Pyramid support thanks to @philtay.
        * User-friendly error messages when ``Arg`` type conversion/validation fails. Thanks Andriy Yurchuk.
        * Allow ``use`` argument to be a list of functions.
        * Allow ``Args`` to be nested within each other, e.g. for nested dict validation. Thanks @saritasa for the suggestion.
        * *Backwards-incompatible*: Parser will only pass ``ValidationErrors`` to its error handler function, rather than catching all generic Exceptions.
        * *Backwards-incompatible*: Rename ``Parser.TARGET_MAP`` to ``Parser.__target_map__``.
        * Add a short-lived cache to the ``Parser`` class that can be used to store processed request data for reuse.
        * Docs: Add example usage with Flask-RESTful.
        
        0.8.1 (2014-10-28)
        ******************
        
        * Fix bug in ``TornadoParser`` that raised an error when request body is not a string (e.g when it is a ``Future``). Thanks Josh Carp.
        
        0.8.0 (2014-10-26)
        ******************
        
        * Fix ``Parser.use_kwargs`` behavior when an ``Arg`` is allowed missing. The ``allow_missing`` attribute is ignored when ``use_kwargs`` is called.
        * ``default`` may be a callable.
        * Allow ``ValidationError`` to specify a HTTP status code for the error response.
        * Improved error logging.
        * Add ``'query'`` as a valid target name.
        * Allow a list of validators to be passed to an ``Arg`` or ``Parser.parse``.
        * A more useful ``__repr__`` for ``Arg``.
        * Add examples and updated docs.
        
        0.7.0 (2014-10-18)
        ******************
        
        * Add ``source`` parameter to ``Arg`` constructor. Allows renaming of keys in the parsed arguments dictionary. Thanks Josh Carp.
        * ``FlaskParser's`` ``handle_error`` method attaches the string representation of validation errors on ``err.data['message']``. The raised exception is stored on ``err.data['exc']``.
        * Additional keyword arguments passed to ``Arg`` are stored as metadata.
        
        0.6.2 (2014-10-05)
        ******************
        
        * Fix bug in ``TornadoParser's`` ``handle_error`` method. Thanks Josh Carp.
        * Add ``error`` parameter to ``Parser`` constructor that allows a custom error message to be used if schema-level validation fails.
        * Fix bug that raised a ``UnicodeEncodeError`` on Python 2 when an Arg's validator function received non-ASCII input.
        
        0.6.1 (2014-09-28)
        ******************
        
        * Fix regression with parsing an ``Arg`` with both ``default`` and ``target`` set (see issue #11).
        
        0.6.0 (2014-09-23)
        ******************
        
        * Add ``validate`` parameter to ``Parser.parse`` and ``Parser.use_args``. Allows validation of the full parsed output.
        * If ``allow_missing`` is ``True`` on an ``Arg`` for which ``None`` is explicitly passed, the value will still be present in the parsed arguments dictionary.
        * *Backwards-incompatible*: ``Parser's`` ``parse_*`` methods return ``webargs.core.Missing`` if the value cannot be found on the request. NOTE: ``webargs.core.Missing`` will *not* show up in the final output of ``Parser.parse``.
        * Fix bug with parsing empty request bodies with ``TornadoParser``.
        
        0.5.1 (2014-08-30)
        ******************
        
        * Fix behavior of ``Arg's`` ``allow_missing`` parameter when ``multiple=True``.
        * Fix bug in tornadoparser that caused parsing JSON arguments to fail.
        
        0.5.0 (2014-07-27)
        ******************
        
        * Fix JSON parsing in Flask parser when Content-Type header contains more than just `application/json`. Thanks Samir Uppaluru for reporting.
        * *Backwards-incompatible*: The ``use`` parameter to ``Arg`` is called before type conversion occurs. Thanks Eric Wang for the suggestion.
        * Tested on Tornado>=4.0.
        
        0.4.0 (2014-05-04)
        ******************
        
        * Custom target handlers can be defined using the ``Parser.target_handler`` decorator.
        * Error handler can be specified using the ``Parser.error_handler`` decorator.
        * ``Args`` can define their request target by passing in a ``target`` argument.
        * *Backwards-incompatible*: ``DEFAULT_TARGETS`` is now a class member of ``Parser``. This allows subclasses to override it.
        
        0.3.4 (2014-04-27)
        ******************
        
        * Fix bug that caused ``use_args`` to fail on class-based views in Flask.
        * Add ``allow_missing`` parameter to ``Arg``.
        
        0.3.3 (2014-03-20)
        ******************
        
        * Awesome contributions from the open-source community!
        * Add ``use_kwargs`` decorator. Thanks @venuatu.
        * Tornado support thanks to @jvrsantacruz.
        * Tested on Python 3.4.
        
        
        0.3.2 (2014-03-04)
        ******************
        
        * Fix bug with parsing JSON in Flask and Bottle.
        
        0.3.1 (2014-03-03)
        ******************
        
        * Remove print statements in core.py. Oops.
        
        0.3.0 (2014-03-02)
        ******************
        
        * Add support for repeated parameters (#1).
        * *Backwards-incompatible*: All `parse_*` methods take `arg` as their fourth argument.
        * Add ``error_handler`` param to ``Parser``.
        
        0.2.0 (2014-02-26)
        ******************
        
        * Bottle support.
        * Add ``targets`` param to ``Parser``. Allows setting default targets.
        * Add ``files`` target.
        
        0.1.0 (2014-02-16)
        ******************
        
        * First release.
        * Parses JSON, querystring, forms, headers, and cookies.
        * Support for Flask and Django.
        
        
Keywords: webargs,http,flask,django,bottle,tornado,request,arguments,parameters,rest,api
Platform: UNKNOWN
Classifier: Development Status :: 4 - Beta
Classifier: Intended Audience :: Developers
Classifier: License :: OSI Approved :: MIT License
Classifier: Natural Language :: English
Classifier: Programming Language :: Python :: 2
Classifier: Programming Language :: Python :: 2.6
Classifier: Programming Language :: Python :: 2.7
Classifier: Programming Language :: Python :: 3
Classifier: Programming Language :: Python :: 3.3
Classifier: Programming Language :: Python :: 3.4
Classifier: Programming Language :: Python :: Implementation :: CPython
Classifier: Programming Language :: Python :: Implementation :: PyPy
Classifier: Topic :: Internet :: WWW/HTTP :: Dynamic Content
Classifier: Topic :: Internet :: WWW/HTTP :: WSGI :: Application
