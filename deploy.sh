if [ "$1" == "prod" ] ; then
   if [ "$2" != "confirm" ] && [ "$3" != "confirm" ] ; then
      echo "Must add 'confirm' to deploy to prod"
      exit 1
   fi
   HOST="root@95.216.118.115"
elif [ "$1" == "dev" ] ; then
   HOST="root@136.243.174.166"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

FOLDER="acpic"

if [ "$2" == "client" ] ; then
   scp client.js $HOST:$FOLDER
   exit 0
fi

if [ "$2" == "client2" ] ; then
   scp client.js $HOST:$FOLDER/client2.js
   exit 0
fi
\
if [ "$2" == "testclient" ] ; then
   scp testclient.js $HOST:$FOLDER
   exit 0
fi

if [ "$2" == "admin" ] ; then
   scp admin.js $HOST:$FOLDER
   exit 0
fi

if [ "$2" == "home" ] ; then
   scp -r home/* $HOST:$FOLDER/home
   exit 0
fi

if [ "$2" == "gotoB" ] ; then
   scp assets/gotoB.min.js $HOST:$FOLDER/assets
   exit 0
fi

if [ "$2" == "server" ] ; then
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "makeConsistent" ] ; then
   ssh $HOST "cd $FOLDER && mg stop"
   ssh $HOST "cd $FOLDER && node server $1 makeConsistent"
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "checkConsistency" ] ; then
   ssh $HOST "cd $FOLDER && node server $1 checkConsistency"
   exit 0
fi

if [ "$2" == "script" ] ; then
   scp $3 $HOST:$FOLDER/$3
   ssh $HOST "cd $FOLDER && node server $1 script $3"
   exit 0
fi

if [ "$2" == "test" ] ; then
   rsync -av . $HOST:$FOLDER
   ssh $HOST chown -R root /root/$FOLDER
   echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
   ssh $HOST "cd $FOLDER && node testserver $3 $4 $5"
   exit 0
fi

rsync -av . $HOST:$FOLDER
ssh $HOST chown -R root /root/$FOLDER
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save --omit=dev && mg restart"
