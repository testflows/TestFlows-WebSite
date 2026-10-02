<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Testing Documentation

Use [testflows.texts] module to help you write auto verified software documentation
by combining your text with the verification procedure for the described functionality,
in the same source file while leveraging the power and flexibility of **{% testflows %}**.

By convention the `.tfd` extension is used for source files for auto verified documentation
and are written using Markdown. Therefore, all `.tfd` files are valid
Markdown files. However, `.tfd` files are only the source files for your documentation
that must be executed using `tfs document run` command to produce the final
Markdown documentation files.

```bash
tfs document run --input my_document.tfd --output my_document.md
```
## Installing `testflows.texts`

You can install [testflows.texts] using `pip3` command:

```bash
pip3 install --upgrade testflows.texts
```

After installing [testflows.texts] you will also have `tfs` command available in your environment.

## Writing Auto Verified Docs

Follow the example Markdown document to get to know how you can write auto verified docs yourself.

````markdown
    ## This is a heading

    This file is written using Markdown where you can have any number
    of `python:testflows` code blocks that contain executable Python code.

    ```python:testflows
    # This is Python code that will be executed when .tfd document is run.

    msg = "Hello TestFlows Texts"
    ```

    The scope is shared between all the code blocks in the same document.

    ```python:testflows
    # so `msg` variable defined above can also be accessed in this
    # `python:testflows` code block

    new_msg = msg + " Thanks for making verifying docs so easy!"
    ```

    The output of executing `.tfd` document using `tfs document run`
    is the final `.md` file with all the `python:testflows` code blocks
    removed and replaced with the text added to the document using
    the `text()` function.

    ```python:testflows
    # Let's use `text()` function to add some text to our document
    # dynamically in our Python code

    text("add this line to the final Markdown document")
    ```

    Any text outside the `python:testflows` code blocks are treated as Python
    f-strings. This allows you to specify expressions for substitutions.
    See [Python formatted string literals](https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals)
    for more details.

    Here is an example where we will substitute the value of `msg` variable next {msg}.
    But with Python f-strings you can specify even complex expressions. For example, we can
    convert our string in `msg` to title case as follows {msg.title()}.

    You can double your curly brackets to escape them when substitution expression is not needed
    using `{{` or `}}`.

    By the way, your document can't contain any triple quotes. If you need them then you have to
    add them using `{triple_quotes}` expression. For example,

    ```markdown
    This text has {triple_quotes} triple quotes.
    ```

    Well, this is pretty much it. With `testflows.texts` you have full power of full featured
    test framework and Python language at your disposal to make sure your documentation always
    stays up to date.
````

Now, if you want to give it a try, then save the above Markdown into `test.tfd` file, but make sure
to remove the indentation.

Then you can run it as

```bash
tfs document run -i test.tfd -o -
```

and you should get the output of the final Markdown document printed to the stdout.

```bash
tfs document run -i test.tfd -o -
## This is a heading

This file is written using Markdown where you can have any number
of `python:testflows` code blocks that contain executable Python code.
...
```

## Testing Documentation Tutorial

Here a simple tutorial to introduce you to using [testflows.texts].

````markdown
    # TestFlows Texts Tutorial

    Let's see `testflows.texts` in action by writing auto verified
    documentation for the `-a` option of the `ls` command.

    The man page for the `ls` utility says the following:

    ```
    NAME
           ls - list directory contents

    SYNOPSIS
           ls [OPTION]... [FILE]...

    DESCRIPTION
           List  information  about  the FILEs (the current directory by default).
           Sort entries alphabetically if none of -cftuvSUX nor --sort  is  speci‐
           fied.

           Mandatory  arguments  to  long  options are mandatory for short options
           too.

           -a, --all
                  do not ignore entries starting with .
    ```

    Let's see how `-a` option works.

    First, create a file that starts with `.` using the `touch` command
    ```python:testflows
    from subprocess import run

    command = "touch .hidden_file"
    ```

    ```bash
    {command}
    ```
    ```python:testflows
    run(command, shell=True, check=True)
    # add clean up at the end of our document generation
    cleanup(run, "rm -rf .hidden_file", shell=True, check=True)
    ```

    Let's now run
    ```python:testflows

    ls_a_command = "ls -a | grep .hidden_file"

    cmd = run(ls_a_command, shell=True, capture_output=True, text=True)

    assert cmd.returncode == 0, "returncode {cmd.returncode} is not 0"
    assert ".hidden_file" in cmd.stdout, "hidden file '.hidden_file' is not in the output"
    ```

    ```bash
    {ls_a_command}
    ```

    and you should see our `.hidden_file` listed

    ```bash
    {cmd.stdout.strip()}
    ```

    Voilà, `ls -a` does indeed show hidden files!
````

Now save this source file as `tutorial.tfd` and execute it to produce the final Markdown
file `tutorial.md` that we can use on our documentation site.

```
tfs document run -i tutorial.tfd -o tutorial.md
```

We know that the instructions in this article are correct as [testflows.texts] has executed them during the
writing of `tutorial.md` just like a technical writer would execute the commands
as part of the process of writing a technical article.

Moreover, we can rerun our documentation any time a new version of `ls` utility is ready
to be shipped to make sure our documentation is still valid and the software still behaves as described.

By the way, here is the final Markdown we get

````markdown
    # TestFlows Texts Tutorial

    Let's see `testflows.texts` in action by writing auto verified
    documentation for the `-a` option of the `ls` command.

    The man page for the `ls` utility says the following:

    ```
    NAME
           ls - list directory contents

    SYNOPSIS
           ls [OPTION]... [FILE]...

    DESCRIPTION
           List  information  about  the FILEs (the current directory by default).
           Sort entries alphabetically if none of -cftuvSUX nor --sort  is  speci‐
           fied.

           Mandatory  arguments  to  long  options are mandatory for short options
           too.

           -a, --all
                  do not ignore entries starting with .
    ```

    Let's see how `-a` option works.

    First, create a file that starts with `.` using the `touch` command

    ```bash
    touch .hidden_file
    ```

    Let's now run

    ```bash
    ls -a | grep .hidden_file
    ```

    and you should see our `.hidden_file` listed

    ```bash
    .hidden_file
    ```

    Voilà, `ls -a` does indeed show hidden files!
````

## Passing Arguments

Execution of any `.tfd` file using `tfs document run` command results in execution of a document writer program.
This is comparable to the test programs you write with **{% testflows %}**.

You can control different aspects of writer program's execution by passing arguments as follows.

```bash
tfs document run -t test.tfd -o test.md -- <writer program arguments>
```

For example, to see all the arguments your document writer program can take pass `-h/--help` argument

```bash
tfs document run -- --help
```

## Controlling Output Format

By passing `-o/--output` argument to your writer program, you can control output format

For example,

```bash
tfs document run -i test.tfd -o test.md -- --output classic
```

See `-h/--help` for other formats.

## Debugging Errors

Here are some common errors that you might run into while writing your `.tfd` source files.

All exceptions will point to the line number indicating where the error occurred.

### Unescaped Curly Brackets

If you forget to double your curly brackets when you are not using f-string expression
then you will see an error.

For example,

```markdown
Hello there

Oh, I forgot to double {quote} my curly brackets.
```

when executed will result in the `NameError`.

```bash
                10ms   ⟥⟤ Error test.tfd, /test.tfd, NameError
                         Traceback (most recent call last):
                           File "/tmp/tmp_ckk4f3m.py", line 1, in <module>
                             text(fr"""Oh, I forgot to double {quote} my curly brackets.
                         NameError: name 'quote' is not defined

                         Error occurred in the following text:

                           3|> Oops I forgot to double {quote} my curly brackets.
```

### Syntax Errors

If you have a syntax error in the `python:testflows` block, you will get an error.

For example,

```markdown
    Hello there

    ```python:testflows
    x = 1
    y = 2 boo
    ```
```

when executed will result in the SyntaxError.

```bash
11ms   ⟥⟤ Error test.tfd, /test.tfd, SyntaxError
         Traceback (most recent call last):
           File "/home/user/.local/lib/python3.8/site-packages/testflows/texts/executable.py", line 87, in execute
             exec(compile(source_code, source_name, 'exec'),
         SyntaxError: invalid syntax (tmp7e6op1y_.py, line 2)

         Syntax Error occured in the following text:

           3|  ```python:testflows
           4|  x = 1
           5|> y = 2 boo
           6|  ```
```

### Triple Quotes

If your text has triple quotes, like `"""` it will result in an error.

For example,

```markdown
Hello There

This text has """ triple quotes.
```

when executed will result in `SyntaxError`.

```bash
9ms   ⟥⟤ Error test.tfd, /test.tfd, SyntaxError
       Traceback (most recent call last):
         File "/home/user/.local/lib/python3.8/site-packages/testflows/texts/executable.py", line 87, in execute
           exec(compile(source_code, source_name, 'exec'),
       SyntaxError: invalid syntax (tmph44nbvgo.py, line 1)

       Syntax Error occurred in the following text:

         3|> This test has """ triple quotes.
```

The workaround is to use `{triple_quotes}` expression to output `"""`.

For example,

```markdown
    Hello There

    This text has {triple_quotes} triple quotes.
```

where `triple_quotes` is provided by default by [testflows.texts] module. This is equivalent to the following.

````markdown
    ```python:testflows
    triple_quotes = '"""'
    ```
    Hello There

    This text has {triple_quotes} triple quotes.
````

## Using `tfs document run`

```bash
tfs document run -h
```
````raw
usage: tfs document run [-h] [-i path [path ...]] [-o [path]] [-f]

  ---- o o o ----
 |   o       o   |
 | 1 o 10010 o 0 |
 |   o       o   |    TestFlows.com Open-Source Software Testing Framework v1.7.211208.1222904
  ---  o o oxx --
 /           xx   \
/  ^^^        xx   \
 ------------------

Run executable document.

Executable documents are Markdown documents that
contain `python:testflows` code blocks, which may contain
any Python code that will be run during document execution.

All text within an executable document except for the
`python:testflows` code blocks are treated as Python f-strings.
Therefore, you must escape any `{`, `}` characters by doubling
them, for example: `{{` or `}}`, otherwise they will be treated
as f-string expressions.

Text must not contain triple quotes `"""`. If you need them
then you must use either `text()` function within `python:testflows` code block
to explicitly add them to the text or use `{triple_quotes}` expression.

For example:
    ```python:testflows
    text('adding triple quotes """ to text')
    ```
    or

    {triple_quotes}


Specify '--' at the end of the command line options to pass
options to the executable document writer program itself.

For example:
   tfs document run -i <path>--o <path> -- --help

You must set PYTHONPATH when modules needed by the executable
document are not in the default path.

For example:
   PYTHONPATH=<path/to/module> tfs document run -i <path> -o <path>

The `--input` can take multiple files, and in such a case, if `--output`
is specified, it is treated as directory name.

For example,
   tfs document run -i `find $(pwd) -name "*.tfd"` -o . -f
or
   tfs document run -i `find $(pwd) -name "*.tfd"` -o /path/to/output/dir -f

If input is '-' (stdin) and output is '.' then output file is 'document.md'
which is created in the current working directory.

optional arguments:
  -h, --help                                   show this help message and exit
  -i path [path ...], --input path [path ...]  input file, use '-' for stdin, default: stdin
  -o [path], --output [path]                   output file or directory if multiple input files are
                                               passed, default: '.' or if input is stdin then '-'.
                                               The '.' means to create output file in the same
                                               directory as the input file having .md extension and
                                               the '-' means output to stdout.
  -f, --force                                  force to override existing output file if it already
                                               exists

TestFlows.com Open-Source Software Testing Framework. Copyright 2021 Katteli Inc.
````
