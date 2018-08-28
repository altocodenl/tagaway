HOST="root@207.154.244.76"
FOLDER="acpic"
TAR="acpic.tar.gz"

rm *.log
cd .. && tar czvf $TAR $FOLDER
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
ssh $HOST "cd $FOLDER && npm i && mg restart"
ssh $HOST rm $TAR
rm $TAR
