Floor 34 - The evil IT Department from the "Wool" series of spooky apocalypse books
===================================================================================


Overview:
---------
floor34 is built on Node.js [1] with the expressjs [2] and jade [3] modules (which you'll need to install if you're cloning this). An HTTP service is setup
listening on 8080/tcp, with a very simple layout. In the WOOL series the IT Department is pretty sketchy,
and has a secret access hatch to a "35th" floor of the silo, which our challenger will need to gain access to.

This was the first time I've created a CTF challenge and I'd really love feedback or write-ups from anyone who participated. The easiest way to reach me would be via twitter: @cji


Challenge Goals:
----------------
There are a couple of small challenges to overcome. After clicking around and not finding much, the intention
is to look for a robots.txt file to see if they can discover more content. There they will find that we've
disallowed crawler access to /35.

From there, they will most likely be hit with an access denied message when browsing to /35. Access to the
secret hatch should only be coming from the local machine. The vulnerability here is similar to the bug
that allowed access to the StackOverflow administration functions, namely, an X-Forwarded-For
header set to 127.0.0.1 [4]. 

The bug exists because we've turned on the expressjs feature 'trust proxy',
which is supposed to be enabled when Node is being run behind a reverse proxy (Varnish, Nginx, etc.). Once
enabled, the X-Forwarded-For's IP will populate the request.ip/request.ips values [5]. Since we're not
behind a reverse-proxy, that means whatever X-Forwarded-For header the challenger sends (manually inserted,
or automatically inserted from a caching proxy like Squid), will be accepted. If they submit 127.0.0.1, they
will gain access to the page.

One last hurdle remains, guessing the "entrance code" for the access hatch. There's some obfuscated javascript
in the public/x.js file which is loaded by the page at /35. Running it through something like js-beautify [6]
should reveal all they need to know.


Operational Considerations / Notes:
-----------------------------------
floor34 was developed and hosted on an Ubuntu 12.04 VM. The code was stored in /home/bernard/floor34 with the following directories and files:

	/home/bernard/floor34/: main directory
	/home/bernard/floor34/app.js: the main Node.js application
	/home/bernard/floor34/node_modules/: supporting modules like expressjs and jade
	/home/bernard/floor34/public/: static content (css, js, robots.txt)
	/home/bernard/floor34/views/: jade templates for content
	/home/bernard/floor34/access.log: log of all requests

floor34 is configured as an upstart service (/etc/init/floor34.conf) to startup at boot. It can be controlled (stop/start/restart/status) via:
`sudo (status|stop|start) floor34`

It is setuid/setgid to the user 'bernard'.

eth0 is configured to be bridged and to obtain an IP address through DHCP.

iptables is configured (via ufw) to allow in port 8080 only.

No SSH service is installed or configured.


References:
-----------
* [1] - http://nodejs.org
* [2] - http://expressjs.com/
* [3] - http://jade-lang.com/
* [4] - http://blog.ircmaxell.com/2012/11/anatomy-of-attack-how-i-hacked.html
* [5] - http://expressjs.com/guide.html#proxies
* [6] - http://jsbeautifier.org/
