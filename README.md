Binder-JS
=========

BinderJS is an experimental rule based parsing tool for recursive parsing operations. It provides a convenient syntax for declaring rules which control recursion, transforms and collect data. The mechanism is designed with IO in mind minimizing the overhead of an asynchronous process.

The objective is to simplify parsing scripts by providing developers with a convention for composing a procedure from generalized commands which they can define and extend.

**Install:**

	npm install binder-js

**API overview:**

	var binder = require('binder-js');

	/**
	 * Register your own syntax definition
	 */
	var def = binder.define('my-binder-def');
	def.condition('isTrue', function (subject, context) {return context.subjectType === 'string;});
	def.parser('myParser', function (subject, context) { return 'the data' });
	def.init(function (parserInstance) {
		// add default rules here
	});

	/**
	 * Create a parser from a syntax definition
	 */
	var parser = binder(def);
	parser.filter(function (sbj, cxt) {
		cxt.subjectType = typeof sbj;
	});
	parser.parse.isTrue().myParser(function (d, c) { return d + " and more!" });

	/**
	 * Trigger parsing process
	 */
	var promise = parser.compile(subject);
	promise.then(function (data) { data.should.eql("the data and more!"); });

	/**
	 * Recursion
	 *
	 * where subject = 'some/folder'
	 */
	def.parser("parseFolder", function (subject, cxt) {
		// returns promise
		return binder(cxt).compile(subject + "/test.txt").then(function (fileData) {
			return {"test.txt": fileData};
		})
	})


Basic Example
-----------

One use case could be to read data from the file system into memory. In the following example a folder is parsed which contains a single json file.

	var binder = require('binder-js');
	var def = binder.loadDef("fs-reader");

	// instantiate a parser from the 'fs-reader' syntax definition
	// This comes with a special syntax and some predefined rules
	var reader = binder(def);

	// define a rule
	reader.parse.fileExt('.json').readUTF(function (data, cxt) {
		// 'data' here is the result of the 'readUTF' subprogram
		return JSON.parse(data);
	});

	// trigger the process
	reader.compile('/some/folder/with/a/json/file/')
		.then(function (data) {
			data.should.eql({
				'example.json': '"the file contents"'
			});
		});


Syntax Definitions
-----------

Parsers are created from syntax definitions which define predicate functions and parse handlers. 'fs-reader' in the previous example implements 'fileExt' and 'readUTF' used in the parse rule expression. BinderJS also provides you with an api for defining your own syntax.

The following example is a pseudo version of readUTF parser and fileExt predicate

	var def = binder.define('my-fs-reader');

	def.condition('fileExt', function (pth, cxt, ext) {
		return ext === cxt.file.ext;
	})

	def.parser("readUTF", function (pth, cxt) {
	  return fs.readFileSync(pth, "utf-8");
	});

In our first example we invoked readUTF with an additional handler which served as a hook for JSON.parse. Internally that function is queued to handle the value returned/resolved from the defined parser. Hence you can see how data can be piped and remapped.

We could improve our example version of readUTF by returning a promise instead of calling *fs.readFileSync* which blocks on IO.


Data Flow
-----------

If you think of the recursive parsing process in terms of a tree structure, context flows from the root down through the nodes and data flows back.

Using the file parsing example again:


	        [root/]
	         /  \
	'file.txt'  [subFolder/]
	                 |
	            'subFile.txt'

Each node of the hierarchy represents exactly one matched rule with a parse handler invocation. The data returned from each node is handled by its parent node, which in turn, chooses what to return. This is how data is channeled back to the caller.

Recursion is triggered in these parse handlers. In this case, the folder parse function.

Here is pseudocode for that implementation:

	var def = binder.define('my-fs-reader');

	def.parser("parseFolder", function (path, cxt) {
		// collect folder data as an array of its parsed contents
		var output = {};
		fs.readdirSync(path).forEach(function (fileName) {
			// lets pretend .compile(...) is sync
			var subData = binder(cxt).compile(path + "/" + fileName, fileName);
			output[fileName] = subData;
		});
		return output;
	});


Context Filters
-----------

As the process progresses, the context needs to be transformed at every stage. For the most part responsibility for this lies with filter functions which get called before any rules get checked. Filters are registered on the parser and every filter get called in the order they were added at the beginning of _every_ step. It has the opportunity to add data to the context object before the predicate functions get called. It can also return a promise if it's work is async.

Here is an example of the filter that loads info about a file before any parser handles it. This info is typically used by predicates to test if a particular parse rule is applicable.


	var reader = binder(def); // def from 'my-fs-reader' above

	reader.filter(function (pth, cxt) {
		var stats = fs.statSync(pth);
		// add file info to the context object
		cxt.file = {
			isDir: stats.isDirectory(),
			ext: path.extname(pth),
			name: path.basename(pth),
			path: path.resolve(pth),
			size: stats.size
		}
		// if this was an asyc operation a promise would be returned
	});

---

### In conclusion

Reading from the file system is just one application, it should be capable of managing any recursive scan process. For example it could be used to crawl web links or parse an XML document.