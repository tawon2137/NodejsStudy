/*
node-mysql
https://github.com/felixge/node-mysql

npm install mysql

커넥션 수행
mysql.createConnection(DataBASE-CONFIG);

host,port : DBMS 주소와 포트(기본 3306)
user,password : DBMS 사용자 계정과 암호.
database : 데이터베이스 이름
multipleStatements : 동시에 여러 SQL 실행. 보안에 주의
connectTimeout : DBMS 연결타임 아웃 시간. 기본은 10,000ms

예제

var mysql = require("mysql")

var dbConfig = {
  host : "localhost",
  user : "root",
  password : "1234",
  database : "moviest"
};

var connection = mysql.createConnection(dbConfig);

connection 객체의 함수
connection.connect() DB에 연결;
connection.end() 연결 종료;
connection.query() sql문 실행;


connection pool
-다수의 커넥션 관리 기법
-풀에서 커넥션 얻어서 사용하고 풀에 반납

waitForConnections : 풀에 여유 커넥션이 없는 경우 대기 여부
connectionLimit : 최대 커넥션 개수, 기본 10개

var pool = mysql.createPool({
  host : "localhost",
  user : "root",
  password : "1234",
  database : "moviest"
  connectionLimit : 50 // 커넥션 갯수
});

풀에서 커넥션 얻기
pool.getConnection(function (err , connection) {
    if(!err){
      //연결 코드
      connection.release(); //커넥션 반환
  }
})
풀 닫기 - pool.end()


DB 커넥션 모듈을 별도로 분리하는게좋음


sql실행
connection.query(sql(String) , allback(error , results, fields){});


sql PlaceHolder 를 이용하는방법

var sql = "INSERT INTO movies(title,director,year) values(?,?,?);";
connection.query(sql, ["인터스텔라","크리스토퍼놀란", 2015],function(err, results){
    //에러 결과처리
});

insert의 경우
SET 을 이용한 insert 방법
var data = {
  title : "메멘토",
  director : "크리스토퍼 놀란",
  year : 2000
};

var sql = "INSERT INTO MOVIE SET ?";
connection.query(sql , data , function(err , results){
    //에러처리
    //결과사용
    affectedRow : 영향을 받은 열의 갯수
    results.insertID : 새로추가한 경우 Primary Key
    changedRow : 변경된 열의 수
    connection.release();



})
sql 인젝션 방지를 위해 PlaceHolder를 사용할 것을 권장

트랜젝션

conn.beginTransaction(CB);
CB : err를 파라미터로 하는 콜백 함수
conn.commit() : 트랜잭션 내 변경확정
conn.rollback() : 트랜젝션 내 변경 되돌리기

conn.beginTransation(function(err){
    conn.query(sql, function(err, results){
        if(err){
          //에러
          conn.rollback();
          return;
        }
        //코드작성
    })
    conn.query(sql2, function(err, results){
        if(err){
          //에러
          conn.rollback();
          return;
        }
        //코드작성

        //성공시
        conn.commit()
    })

});
위와 같이 콜백이 중첩될시에는 async모듈이나 promise 객체를 생성하여 사용하자

2.Sequelize  사용해보기
ORM : 객체와 모델의 매핑
지원 데이터베이스 : PostgreSQL, MySQL, MariaDB, SQLite, MSSQL
Promise 기반
ORM
SQL 직접 다루기 : SQL 작성 실행
ORM : 모델을 이용한 값 저장과 변경
설치 npm install sequelize

sequelize 사용하기
데이터베이스 연결 설정
모델 설정
모델을 이용하여 데이터 저장
모델에서 데이터 얻어오기
모델을 이용해서 데이터 수정/삭제

데이터베이스 연결설정
new Sequelize(uri , [options={}]);
new Sequelize(database , [username=null] , [password=null], [options={}])

dialect : 데이터베이스 종류, 예 ) dialect="mysql"
host, port : 데이터 베이스 서버 주소, 포트
poll : 커넥션 풀 설정

로컬 기본 연결 코드
var Sequelize = require("sequelize");
var sequelize = new Sequelize("moviest", "USER","PASSWORD");
원격 호스트와 커넥션 풀
var sequelize2 = new SEquelize("moviest", "USER","PASSWORD"{
  dialect:"mysql",
  host:"RDB_ADDRESS.rds.amazonaws.com",
  port:3306,

  pool:{
    max:10,
    min:0,
    idle:100000
  },
});
sequelize 모델
-sql구문 작성대신 모델을 이용

sequelize.define("name", [attributes], {options});

모델에서 실제 데이터베이스의 테이블 생성/삭제
sync() -> Promise.<this>
drop([options]) -> Promise
동작 결과 : Promise 반환
Promise.then(resolved , rejected);

Sequelize 데이터 타입

Sequelize.STRING //VARCHAR(255)
Sequelize.STRING(1234) //VARCHAR(1234)
Sequelize.TEXT // TEXT
Sequelize.INTEGER
Sequelize.FLOAT
Sequelize.DATE //DATETIME for mysql
Sequelize.BOOLEAN

모델 정의 , 테이블 생성 코드

var Movie = sequelize.define("movie" , {
    title : { type : Sequelize.STRING},
    director : {type:Sequelize.STRING},
    year : {type:SEquelize.INTEGER},
    synopsis : {type: Sequelize.STRING(1024)}
});

Movie.sync().then(resolved, rejected)

데이터 저장
create(values , [options]) -> Promise.<Instance>

->예제 코드
Movie.create({
  title:"아바타",
  directo:"제임스 카메론",
  year : 2010,
}).then(resolved, rejected);
//sql insert 에 해당

데이터 찾기 (select 문에 해당)
필드 : attribute
조건 : where
Model.findAll({
  attribute : [attr1 , attr2 , attr3],
  where : {
    attr1 : value1,
    attr2 : value2
  }
})

오퍼레이터
$gte : >= ,$gt : >,$lte : <= , $lt : <
$ne, $in , $not : 부정
$and : and , $or : or
예제코드

Movie.findAll({
  attributes : ["title", "director"]
});


Movie.findAll({
  where:{
    director : "제임스 카메론",
    year:[$gt:2000]
  }
});

findAll 메소드의 결과 = then 사용

findAll(optionsObject).then(function(results){

},
function(err){

});


수정(Model) -- Options의 where 절은 필수
update(values, options) -> promise.<Array.<affectedCount, affectedRows>>
upsert : insert or Update
upsert(values , [options]) -> Promise.<created> // insert or update

예제코드

Movie.update({
  synopsis:"시놉시스"
},{
  where :{}
}).then(resolved , rejected);

*/
