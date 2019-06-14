if [ "$1" == "prod" ] ; then
   if [ "$2" != "confirm" ] && [ "$3" != "confirm" ] ; then
      echo "Must add 'confirm' to deploy to prod"
      exit 1
   fi
   HOST="root@"
elif [ "$1" == "dev" ] ; then
   HOST="root@207.154.244.76"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

FOLDER="acpic"
TAR="acpic.tar.gz"

if [ "$2" == "client" ] ; then
   scp client.js $HOST:$FOLDER
   exit 0
fi

if [ "$2" == "server" ] ; then
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "fast" ] ; then
   cd .. && tar --exclude="$FOLDER/*.swp" --exclude="$FOLDER/node_modules" --exclude="$FOLDER/.git" --exclude="$FOLDER/test" -czvf $TAR $FOLDER
else
   cd .. && tar --exclude="$FOLDER/*.swp" --exclude="$FOLDER/node_modules" -czvf $TAR $FOLDER
fi
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
# Remove after upgrading cicek
#ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST "cd $FOLDER && npm i --no-save"
scp /media/veracrypt1/now/denk/hack/cicek/cicek.js $HOST:$FOLDER/node_modules/cicek
ssh $HOST "cd $FOLDER && mg restart"
ssh $HOST rm $TAR
rm $TAR
