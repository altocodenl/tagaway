if [ "$1" == "prod" ] ; then
   if [ "$2" != "confirm" ] ; then
      echo "Must add 'confirm' to deploy to prod"
      exit 1
   fi
   HOST="root@104.248.38.85"
elif [ "$1" == "dev" ] ; then
   HOST="root@207.154.244.76"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

FOLDER="acpic"
TAR="acpic.tar.gz"

if [ "$2" == "client" ] ; then
   scp client.js $HOST:acpic
   exit 0
fi

rm *.log
if [ "$2" == "fast" ] ; then
   cd .. && tar --exclude="$FOLDER/*.swp" --exclude="$FOLDER/.git" --exclude="$FOLDER/test" -czvf $TAR $FOLDER
else
   cd .. && tar --exclude="$FOLDER/*.swp" -czvf $TAR $FOLDER
fi
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST rm $TAR
rm $TAR
