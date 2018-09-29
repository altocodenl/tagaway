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

rm *.log
cd .. && tar czvf $TAR $FOLDER
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST rm $TAR
rm $TAR
