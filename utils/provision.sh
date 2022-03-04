if [ "$2" != "confirm" ] ; then
   echo "Must add 'confirm'"
   exit 1
fi
if [ "$1" == "prod" ] ; then
   HOST="root@136.243.174.166"
elif [ "$1" == "dev" ] ; then
   HOST="root@95.216.118.115"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

ssh $HOST apt-get update
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get install -y systemd
ssh $HOST timedatectl set-timezone UTC
ssh $HOST apt-get install -y fail2ban
ssh $HOST apt-get install -y htop sysstat vim curl wget unzip
ssh $HOST "curl -sL https://deb.nodesource.com/setup_16.x | bash -"
ssh $HOST apt-get install -y nodejs
ssh $HOST apt-get install -y build-essential git
ssh $HOST '(mkdir /tmp/mon && cd /tmp/mon && curl -L# https://github.com/tj/mon/archive/master.tar.gz | tar zx --strip 1 && make install && rm -rf /tmp/mon)'
ssh $HOST npm install -g mongroup
ssh $HOST wget https://raw.githubusercontent.com/fpereiro/vimrc/master/vimrc -O .vimrc
ssh $HOST apt-get install -y redis-server

# The two commands immediately below are only for servers receiving outside traffic
ssh $HOST apt-get install -y nginx
ssh $HOST apt-get install -y certbot python3-certbot-nginx

# Image processing tools
ssh $HOST apt-get install -y libimage-exiftool-perl
ssh $HOST apt-get install -y ffmpeg
ssh $HOST apt-get install -y libde265-dev libheif-dev libjpeg-dev libraw-dev libtiff-dev libwebp-dev autotools-dev automake pkg-config libtool
ssh $HOST cd /root && git clone https://github.com/strukturag/libde265
ssh $HOST cd /root/libde265 && ./autogen.sh
ssh $HOST cd /root/libde265 && ./configure
ssh $HOST cd /root/libde265 && make -j 8
ssh $HOST cd /root/libde265 && make install
ssh $HOST rm -rf /root/libde265
ssh $HOST cd /root && git clone https://github.com/strukturag/libheif
ssh $HOST cd /root/libheif && ./autogen.sh
ssh $HOST cd /root/libheif && ./configure
ssh $HOST cd /root/libheif && make -j 8
ssh $HOST cd /root/libheif && make install
ssh $HOST rm -rf /root/libheif
ssh $HOST apt-get install -y imagemagick
ssh $HOST ldconfig /usr/local/lib

ssh $HOST apt-get autoremove -y
ssh $HOST apt-get clean
ssh $HOST mkdir /root/files
ssh $HOST git clone https://github.com/altocodenl/acpic
ssh $HOST cd acpic && npm i --no-save --production
ssh $HOST shutdown -r now

# Manual steps:
# /etc/sysctl.conf -> net.core.somaxconn=1024
# /etc/sysctl.conf -> vm.overcommit_memory = 1
# disable THP echo never > /sys/kernel/mm/transparent_hugepage/enabled

# change limits in /etc/ImageMagick-7/policy.xml:
  #<policy domain="resource" name="width" value="100KP"/>
  #<policy domain="resource" name="height" value="100KP"/>

# Place refresh.sh and start.sh
# Put cron entries for refresh.sh and start.sh
