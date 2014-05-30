Binder-JS
=========

BinderJS is an experimental rule based parsing tool for recursive scanning operations. It provides a convenient syntax for declaring rules which control recursion and collect data. The mechanism is designed with IO in mind utilizing an A+ compliant promise library to manage its asynchronous parsing process.

**Install:**

	npm install binder-js

**API overview:**

	var binder = require('binder-js');

	/**
	 * Register your own syntax definition
	 */
	var def = binder.define('my-binder-def');
	def.parser('myParser', 'optionalPreParser', function (subject, context) { return 'the data' });
	def.condition('isTrue', function (subject, context) {return !!context.true;});
	def.init(function (parserInstance) {
		// add default rules here
	});

	/**
	 * Create a parser from a syntax definition
	 */
	var parser = binder.create('my-binder-def');
	parser.parse.when(function (s, c) {return true;}).parse(function (s, c) { return "some data" });
	parser.filter(function (sbj, cxt) { cxt.subject = sbj; });

	/**
	 * Trigger recursion step
	 */
	var promise = binder.scan(subject, parentContext);
	promise.then(function (data) { data === "parsed data from subject" });

	/**
	 * Used to add rules to a sub context (advanced)
	 */
	var rule = binder.rule(context);
	rules.parse.when(function (s, c) {return true;}).parse(function (s, c) { return "some data" });

Basic Example
-----------

One use case could be to read data from the files system into memory. In the following example a folder is parsed which contains a single json file.

	var binder = require('binder-js');

	// instantiate a parser from the 'fs-reader' syntax definition
	// This comes with a special syntax and some predefined rules
	var reader = binder.create('fs-reader');

	// define a rule
	reader.parse.fileExt('.json').readUTF(function (data, cxt) {
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

	def.condition('fileExt', function (pth, cxt) {
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

Each node of the hierarchy represents exactly one matched rule with a parse handler invocation. The data returned from each node, is handled by its parent node, which in turn, chooses what to return. This is how data is channeled back to the caller.

Recursion is triggered in these parse handlers. In this case, the folder parse function.

Here is how that might be implemented:

	var def = binder.define('my-fs-reader');

	def.parser("parseFolder", function (path, cxt) {
		// collect folder data as an array of its parsed contents
		var output = [];
		fs.readdirSync(path).forEach(function (subPath) {
			var subData = binder.scan(subPath, cxt); // lets pretend scan is sync
			output.push(subData);
		});
		return output;
	});


Context Filters
-----------

As the process progresses, the context needs to be transformed at every stage. Responsibility for this lies with filter functions which get called before any rules get checked. Filters are registered on the parser and every filter get called in the order they were add at the beginning of _every_ scan. It has the opportunity to add data to the context object before the predicate functions get called. It can also return a promise if it's work is async.

Here is an example of the filter that loads info about a file before any parser read it. This info is typically used by predicates to test if a particular parse handler is applicable.

	var reader = binder.create('my-fs-reader');

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
	});

---

### And beyond

Reading from the files system is just one application, it should be capable of managing any recursive scan process. For example it could be used to step through the data and write files back to the files system.

However, at this time other applications have not yet been explored in detail. Therefore some changes to the api are likely as new requirements come along.