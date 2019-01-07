if [ "$2" != "confirm" ] ; then
   echo "Must add 'confirm' to deploy to prod"
   exit 1
fi
if [ "$1" == "prod" ] ; then
   HOST="root@104.248.38.85"
elif [ "$1" == "dev" ] ; then
   HOST="root@207.154.244.76"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

ssh $HOST apt-get update
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -y
ssh $HOST apt-get install fail2ban -y
ssh $HOST apt-get install htop -y
ssh $HOST "curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -"
ssh $HOST apt-get install nodejs -y
ssh $HOST apt-get install build-essential -y
ssh $HOST '(mkdir /tmp/mon && cd /tmp/mon && curl -L# https://github.com/tj/mon/archive/master.tar.gz | tar zx --strip 1 && make install && rm -rf /tmp/mon)'
ssh $HOST npm install -g mongroup
ssh $HOST apt-get install vim -y
ssh $HOST wget https://raw.githubusercontent.com/fpereiro/vimrc/master/vimrc
ssh $HOST mv vimrc .vimrc
ssh $HOST apt-get install redis-server -y
ssh $HOST apt-get install imagemagick -y
ssh $HOST apt-get install nginx -y
ssh $HOST apt-get autoremove -y
ssh $HOST mkdir /root/files
ssh $HOST shutdown -r now
