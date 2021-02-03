if [ "$2" != "confirm" ] ; then
   echo "Must add 'confirm'"
   exit 1
fi
if [ "$1" == "prod" ] ; then
   HOST="root@95.216.118.115"
elif [ "$1" == "dev" ] ; then
   HOST="root@116.203.118.26"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

ssh $HOST apt-get update
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
ssh $HOST timedatectl set-timezone UTC
ssh $HOST apt-get install fail2ban -y
ssh $HOST apt-get install htop sysstat vim -y
ssh $HOST "curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -"
ssh $HOST apt-get install nodejs -y
ssh $HOST apt-get install build-essential -y
ssh $HOST apt-get install git -y
ssh $HOST '(mkdir /tmp/mon && cd /tmp/mon && curl -L# https://github.com/tj/mon/archive/master.tar.gz | tar zx --strip 1 && make install && rm -rf /tmp/mon)'
ssh $HOST npm install -g mongroup
ssh $HOST wget https://raw.githubusercontent.com/fpereiro/vimrc/master/vimrc -O .vimrc
ssh $HOST apt-get install redis-server -y
# The two commands immediately below are only for servers receiving outside traffic
ssh $HOST apt-get install nginx -y
ssh $HOST apt-get install -y certbot python3-certbot-nginx
ssh $HOST apt-get install imagemagick -y
ssh $HOST apt-get install libimage-exiftool-perl -y
ssh $HOST apt-get install ffmpeg -y
ssh $HOST apt-get install -y libheif-examples
ssh $HOST apt-get autoremove -y
ssh $HOST apt-get clean
ssh $HOST mkdir /root/files
ssh $HOST shutdown -r now

# /etc/sysctl.conf -> net.core.somaxconn=1024
# /etc/sysctl.conf -> vm.overcommit_memory = 1
# disable THP echo never > /sys/kernel/mm/transparent_hugepage/enabled

# place refresh.sh and start.sh
