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
        
        .. image:: https://badge.fury.io/py/webargs.svg
            :target: http://badge.fury.io/py/webargs
        
        .. image:: https://travis-ci.org/sloria/webargs.svg?branch=pypi
            :target: https://travis-ci.org/sloria/webargs
        
        Homepage: https://webargs.readthedocs.io/
        
        webargs is a Python library for parsing HTTP request arguments, with built-in support for popular web frameworks, including Flask, Django, Bottle, Tornado, Pyramid, webapp2, Falcon, and aiohttp.
        
        .. code-block:: python
        
            from flask import Flask
            from webargs import fields
            from webargs.flaskparser import use_args
        
            app = Flask(__name__)
        
            hello_args = {
                'name': fields.Str(required=True)
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
        
        Full documentation is available at https://webargs.readthedocs.io/.
        
        Project Links
        -------------
        
        - Docs: http://webargs.readthedocs.io/
        - Changelog: http://webargs.readthedocs.io/en/latest/changelog.html
        - PyPI: https://pypi.python.org/pypi/webargs
        - Issues: https://github.com/sloria/webargs/issues
        
        
        License
        -------
        
        MIT licensed. See the `LICENSE <https://github.com/sloria/webargs/blob/dev/LICENSE>`_ file for more details.
        
Keywords: webargs,http,flask,django,bottle,tornado,aiohttp,webapp2,request,arguments,parameters,rest,api,marshmallow
Platform: UNKNOWN
Classifier: Development Status :: 5 - Production/Stable
Classifier: Intended Audience :: Developers
Classifier: License :: OSI Approved :: MIT License
Classifier: Natural Language :: English
Classifier: Programming Language :: Python :: 2
Classifier: Programming Language :: Python :: 2.6
Classifier: Programming Language :: Python :: 2.7
Classifier: Programming Language :: Python :: 3
Classifier: Programming Language :: Python :: 3.3
Classifier: Programming Language :: Python :: 3.4
Classifier: Programming Language :: Python :: 3.5
Classifier: Programming Language :: Python :: Implementation :: CPython
Classifier: Programming Language :: Python :: Implementation :: PyPy
Classifier: Topic :: Internet :: WWW/HTTP :: Dynamic Content
Classifier: Topic :: Internet :: WWW/HTTP :: WSGI :: Application
