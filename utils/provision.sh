if [ "$2" != "confirm" ] ; then
   echo "Must add 'confirm'"
   exit 1
fi
if [ "$1" == "dev" ] ; then
   HOST="root@136.243.174.166"
   HOSTNAME="ac-dev"
elif [ "$1" == "prod" ] ; then
   HOST="root@95.216.118.115"
   HOSTNAME="ac-prod"
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
ssh $HOST 'curl -sL https://deb.nodesource.com/setup_16.x | bash -'
ssh $HOST apt-get install -y nodejs
ssh $HOST apt-get install -y build-essential git
ssh $HOST 'mkdir /tmp/mon && cd /tmp/mon && curl -L# https://github.com/tj/mon/archive/master.tar.gz | tar zx --strip 1 && make install && rm -rf /tmp/mon'
ssh $HOST npm install -g mongroup
ssh $HOST wget https://raw.githubusercontent.com/fpereiro/vimrc/master/vimrc -O .vimrc
ssh $HOST apt-get install -y redis-server

# The two commands immediately below are only for servers receiving outside traffic
ssh $HOST apt-get install -y nginx
ssh $HOST apt-get install -y certbot python3-certbot-nginx

# Image processing tools
ssh $HOST apt-get install -y exiv2 libimage-exiftool-perl
ssh $HOST apt-get install -y ffmpeg
ssh $HOST apt-get install -y libde265-dev libx265-dev libheif-dev libavcodec-dev libavutil-dev libavformat-dev libswscale-dev libavresample-dev libbrotli-dev libjpeg-dev libpng-dev libraw-dev libtiff-dev libwebp-dev autotools-dev automake cmake pkg-config libtool qtbase5-dev
ssh $HOST 'cd /root && git clone https://github.com/strukturag/libde265'
ssh $HOST 'cd /root/libde265 && ./autogen.sh'
ssh $HOST 'cd /root/libde265 && ./configure'
ssh $HOST 'cd /root/libde265 && make -j $(getconf _NPROCESSORS_ONLN)'
ssh $HOST 'cd /root/libde265 && make install'
ssh $HOST rm -rf /root/libde265
ssh $HOST 'cd /root && git clone https://github.com/strukturag/libheif'
ssh $HOST 'mkdir /root/libheif/build'
ssh $HOST 'cd /root/libheif/build && cmake ..'
ssh $HOST 'cd /root/libheif/build && make'
ssh $HOST 'cd /root/libheif/build && make install'
ssh $HOST rm -rf /root/libheif
# The build-dep command is required for png support in ImageMagick
ssh $HOST 'cd /root && git clone https://github.com/imagemagick/imagemagick'
ssh $HOST 'cd /root/imagemagick && ./configure --with-webp=yes'
ssh $HOST 'cd /root/imagemagick && make -j $(getconf _NPROCESSORS_ONLN)'
ssh $HOST 'cd /root/imagemagick && make install'
ssh $HOST rm -rf /root/imagemagick
ssh $HOST ldconfig /usr/local/lib
# Allow ImageMagick to process pivs of up to 100k pixels of width & height
ssh $HOST 'find /usr/local/etc/ImageMagick-*/policy.xml -type f -exec sed -i '\''/name="width"/c\  <policy domain="resource" name="width" value="100KP"\/>'\'' {} \;'
ssh $HOST 'find /usr/local/etc/ImageMagick-*/policy.xml -type f -exec sed -i '\''/name="height"/c\  <policy domain="resource" name="height" value="100KP"\/>'\'' {} \;'

ssh $HOST mkdir /root/files
ssh $HOST mkdir /root/files/acpic
ssh $HOST mkdir /root/files/acpic/invalid
# Note: this command is for using ac;log, but can ignored in a standalone ac;pic server
ssh $HOST mkdir /root/files/aclog

ssh $HOST git clone https://github.com/altocodenl/acpic
# Note: this command is for using ac;web, but can ignored in a standalone ac;pic server
ssh $HOST git clone https://github.com/altocodenl/acweb

# Allow up to 1024 simultaneous connection requests
ssh $HOST 'echo "net.core.somaxconn=1024" >> /etc/sysctl.conf'
# Allow overcommit_memory for Redis
ssh $HOST 'echo "vm.overcommit_memory=1"  >> /etc/sysctl.conf'

# Place start.sh script
# Many thanks to https://thornelabs.net/posts/remotely-execute-multi-line-commands-with-ssh.html
# Note: also includes commands for using ac;log and ac;web, but these can be ignored in a standalone ac;pic server
ssh $HOST -T << EOF
cat << "EOT" >> ~/start.sh
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
# Configure THP (required by Redis)
echo madvise > /sys/kernel/mm/transparent_hugepage/enabled
service redis-server restart
# Wait 5 seconds until DNS can be properly resolved
sleep 5
cd /root/aclog && mg restart
sleep 2
cd /root/acpic && mg restart
cd /root/acweb && mg restart
EOT
EOF
ssh $HOST chmod 777 /root/start.sh

# Place refresh.sh script
# Note: also includes commands for using ac;log and ac;web, but these can be ignored in a standalone ac;pic server.
ssh $HOST -T << EOF
cat << "EOT" >> ~/refresh.sh
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
apt-get update && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
apt-get autoremove -y && apt-get clean
cd /root/acpic && mg stop
cd /root/acweb && mg stop
cd /root/aclog && mg stop
service redis-server stop
shutdown -r now
EOT
EOF
ssh $HOST chmod 777 /root/refresh.sh

# Add crontab entries (change the second entry's time as needed)
ssh $HOST '(crontab -l ; echo "@reboot ~/start.sh") | sort - | uniq - | crontab -'
ssh $HOST '(crontab -l ; echo "15 5 * * 1 /root/refresh.sh") | sort - | uniq - | crontab -'

ssh $HOST 'echo "'$HOSTNAME'" > /etc/hostname'

ssh $HOST apt-get autoremove -y
ssh $HOST apt-get clean
ssh $HOST shutdown -r now
