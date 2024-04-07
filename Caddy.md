sudo apu update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt install caddy

```
azureuser@backend:~$ sudo apt install caddy
Reading package lists... Done
Building dependency tree       
Reading state information... Done
The following NEW packages will be installed:
  caddy
0 upgraded, 1 newly installed, 0 to remove and 13 not upgraded.
Need to get 14.7 MB of archives.
After this operation, 41.1 MB of additional disk space will be used.
Get:1 https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version/main amd64 caddy amd64 2.7.6 [14.7 MB]
Fetched 14.7 MB in 2s (8621 kB/s)
Selecting previously unselected package caddy.
(Reading database ... 58973 files and directories currently installed.)
Preparing to unpack .../archives/caddy_2.7.6_amd64.deb ...
Unpacking caddy (2.7.6) ...
Setting up caddy (2.7.6) ...
Created symlink /etc/systemd/system/multi-user.target.wants/caddy.service → /lib
/systemd/system/caddy.service.
Processing triggers for man-db (2.9.1-1) ...
azureuser@backend:~$ 
```


Add Caddyfile
sudo nano Caddyfile
```
api2.sayantanmishra.com

reverse_proxy :8080
```

sudo caddy run
// It will run caddy with present directory's Caddyfile.

// Verify if it's working.

Use systemd to run it in background:
If you prefer a more integrated and managed approach, you can create a systemd service for Caddy. Here are the steps:

a. Create a systemd service file for Caddy:

bash
Copy code
```
sudo nano /etc/systemd/system/caddy.service
```
b. Add the following content to the caddy.service file:

makefile
Copy code
```
[Unit]
Description=Caddy HTTP/2 web server
Documentation=https://caddyserver.com/docs/
After=network.target

[Service]
User=sayantan
Group=admin
ExecStart=/usr/local/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/caddy/Caddyfile
Restart=always
LimitNOFILE=1048576
LimitNPROC=512

[Install]
WantedBy=multi-user.target
```
Replace your_username and your_group with your actual username and group.

c. Reload systemd to load the new service file:

bash
Copy code
sudo systemctl daemon-reload
d. Start and enable the Caddy service:

bash
Copy code
sudo systemctl start caddy
sudo systemctl enable caddy
Now, Caddy will run as a background service managed by systemd, and it will automatically start on system boot.

Choose the method that best fits your needs and system setup. Both methods will allow Caddy to run in the background.





Add user and group

sayantan@sayantan-laptop:~/Documents/pem-files$ sudo groupadd --system caddy
sayantan@sayantan-laptop:~/Documents/pem-files$ sudo useradd --system \
    --gid caddy \
    --create-home \
    --home-dir /var/lib/caddy \
    --shell /usr/sbin/nologin \
    --comment "Caddy web server" \
    caddy
sayantan@sayantan-laptop:~/Documents/pem-files$ getent passwd caddy
caddy:x:998:997:Caddy web server:/var/lib/caddy:/usr/sbin/nologin
sayantan@sayantan-laptop:~/Documents/pem-files$ getent group caddy
caddy:x:997:



sudo chown caddy:caddy /usr/local/bin/caddy


azureuser@backend:~$ caddy fmt --overwrite Caddyfile 
Error: overwriting formatted file: open Caddyfile: permission denied
azureuser@backend:~$ sudo caddy fmt --overwrite Caddyfile 
azureuser@backend:~$ sudo caddy fmt --overwrite /etc/caddy/Caddyfile
azureuser@backend:~$ sudo systemctl daemon-reload
azureuser@backend:~$ sudo systemctl restart caddy
azureuser@backend:~$ systemctl status caddy
● caddy.service - Caddy HTTP/2 web server
     Loaded: loaded (/etc/systemd/system/caddy.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2024-04-07 07:37:17 UTC; 11s ago
       Docs: https://caddyserver.com/docs/
   Main PID: 21506 (caddy)
      Tasks: 6 (limit: 1002)
     Memory: 10.8M
     CGroup: /system.slice/caddy.service
             └─21506 /usr/bin/caddy run --environ --config /etc/caddy/Caddyfile

Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.0723505,"logger":"http","msg":"served key authentication","i>
Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.1999836,"logger":"http","msg":"served key authentication","i>
Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.22791,"logger":"http","msg":"served key authentication","ide>
Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.2351024,"logger":"http","msg":"served key authentication","i>
Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.3693426,"logger":"http","msg":"served key authentication","i>
Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.9895966,"logger":"http.acme_client","msg":"authorization fin>
Apr 07 07:37:20 backend caddy[21506]: {"level":"info","ts":1712475440.9899473,"logger":"http.acme_client","msg":"validations succe>
Apr 07 07:37:21 backend caddy[21506]: {"level":"info","ts":1712475441.979378,"logger":"http.acme_client","msg":"successfully downl>
Apr 07 07:37:21 backend caddy[21506]: {"level":"info","ts":1712475441.9803693,"logger":"tls.obtain","msg":"certificate obtained su>
Apr 07 07:37:21 backend caddy[21506]: {"level":"info","ts":1712475441.9806392,"logger":"tls.obtain","msg":"releasing lock","identi>
lines 1-20/20 (END)
^C
azureuser@backend:~$ 

