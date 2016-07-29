Author: Huy Pham (hpham@funnelback.com)
====
This extension will pretty-print JSON data.

Only works on Chrome at the moment.

===
Follow these steps to install this extension to your Chrome:

1) Go to "chrome://extensions/" on Chrome

2) Click "Load unpacked extension..."

3) Choose this directory

4) Disable any other JSON extension you might have, since they might conflict with this one

5) Then you are all set. Start using the extension by either dragging a json file into your Chrome, or going to a page that returns a json.

==
IMPORTANT NOTES: 
It contains many hacky & ugly looking codes, due to time pressure in hack day. 
And we prefer native JS (no external library) when it comes to browser extension, to improve performance.
Can consider using SystemJS to modularise our codes better, to make easier to collaborate and more extensible
