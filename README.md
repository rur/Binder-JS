Binder-JS
=========

Library for compiling file system data into memory. This library provides a syntax for defining a set of rules which control how the file system is traversed, how file data is read into memory and what transformations that data should go through. These rules govern how a single file or folder will be reduced to a data object for use in your application or script.

#Basic Usage#

Binder comes with a small set of default rules for parsing txt files and traversing folders. It ignores any files it doesn't recognize (Null Parser).

Using default only binder:

	var binderJs = require("binder-js");
	var binder = binderJs.create();
	// n.b. binder#compile returns a promise
	binder.compile("path/to/some/folder")
		.then(function (result) {}, function (error) {});

If all goes well it will generate a hash containing folder and utf data read from any .txt files encountered. Similar to the following:

	{
		"test.txt": "files content",
		"subDir": {
			"subDirFile.txt": "sub dir file content"
		}
	}

Neat but not terribly useful. The library is setup to make it easy to declare your own parsing rules with minimal boilerplate.

#Create Rule#

Once you have created your binder you can add your own rules in a declarative style. For example, lets parse .json file data.

	var binderJs = require("binder-js");
	var binder = binderJs.create();

	binder.parse.fileExt(".json").readUTF(function (data) {
		return JSON.parse(data);
	});

	binder.compile("some/path");

This is a basic example, more is possible. All parse handlers can delay resolving their value if the operation they perform needs to be asynchronous.

For example,

	binder.parse.fileExt(".json").readUTF(function (data) {
		var response = this;
		someAsyncMethod(data, function (err, finalData) {
			if (err) {
				response.reject(err);
				return;
			}
			response.resove(finalData);
		});
		return this.promise;
	});

#Define Syntax#

In the examples above, ```fileExt``` and ```readUTF``` might stand out to you as being mysterious. The implementation of these are part of a definition, in this case the 'default' definition which is always present.

You can define your own custom syntax in terms of 'conditions' and 'parse handlers' with a name and function associated with each.

A parser rule is made up of a combination of one or more conditions and exactly one parse handler. Although a parse handler can be chained to another.

*More detail soon...*