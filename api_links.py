#!/usr/bin/env python3
import sys
import inspect
import testflows.core
from testflows._core import __repository__, __commit__


github_root = f"{__repository__.rsplit('.git',1)[0]}/blob/{__commit__}"


def make_link(obj):
    """Make a link to a line of code in the github repository
    for a given object.
    """
    return f"{github_root}/testflows{inspect.getsourcefile(obj).split('/testflows', 1)[-1]}#L{inspect.getsourcelines(obj)[1]}"


def generate(obj, writer, prefix=""):
    """Generate API links to GitHub code.
    """
    try:
       if not inspect.getmodule(obj).__name__.startswith("testflows"):
          return

       members = inspect.getmembers(obj)

       for member in members:
           name, obj = member

           if name.startswith("_"):
               continue

           if inspect.isfunction(obj):
               writer.write(f"[{prefix}{name}() function]: {make_link(obj)}\n")

           if inspect.isclass(obj):
               writer.write(f"[{prefix}{name} class]: {make_link(obj)}\n")
               generate(obj, prefix=f"{prefix}{name}.", writer=writer)

           if inspect.ismethod(obj):
               writer.write(f"[{prefix}{name}() method]: {make_link(obj)}\n")

           if inspect.isgenerator(obj):
               writer.write(f"[{prefix}{name}() generator]: {make_link(obj)}\n")

    except BaseException:
        pass

# generate API links
writer = sys.stdout
try:
    generate(obj=testflows.core, writer=writer)
finally:
    writer.flush()
