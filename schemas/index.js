import mongoose from 'mongoose';
// TODO: .env 파일 사용을 위해서는 여기에 패키지 import가 필요합니다.

const connect = () => {
    // mongoose.connect는 MongoDB 서버에 연결하는 메서드입니다.
    mongoose
        .connect(
            // TODO: .env 파일에 다음과 같은 정보를 추가해 사용합니다.
            // 빨간색으로 표시된 부분은 대여한 ID, Password, 주소에 맞게끔 수정해주세요!
            // MONGODB_URL='mongodb+srv://sparta-user:aaaa4321@express-mongo.uy7ttg7.mongodb.net/?retryWrites=true&w=majority'
            // MONGODB_NAME='node_beginner'
            process.env.MONGODB_URL,
            {
                dbName: process.env.MONGODB_NAME
            },
        )
        .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
        .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB 연결 에러', err);
});

export default connect;