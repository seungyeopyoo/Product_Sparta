import express from 'express';
import joi from 'joi';
import Product from '../schemas/product.schema.js';

const router = express.Router();

/**
 * 1. `value` 데이터는 **필수적으로 존재**해야한다.
2. `value` 데이터는 **문자열 타입**이어야한다.
3. `value` 데이터는 **최소 1글자 이상**이어야한다.
4. `value` 데이터는 **최대 50글자 이하**여야한다.
5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
 */
// const createdProductSchema = joi.object({
//     value: joi.string().min(1).max(50).required(),
// });

/** 상품생성 API */
router.post('/products', async (req, res, next) => {
    try {
        //     // 클라이언트로부터 받아온 value 데이터를 가져온다

        //     const validation = await ProductSchema.validateAsync(req.body);

        //     const { name, description, manager, password } = validation;
        const { name, description, manager, password } = req.body;

        // 만약, 클라이언트가 value 데이터를 전달하지 않았을때 클라이언트에게 에러메세지를 전달한다.
        if (!name || !description || !manager || !password) {
            return res
                .status(400)
                .json({ errorMessage: '데이터가 존재하지 않습니다' });
        }

        //상품 생성
        const product = new Product({ name, description, manager, password });
        await product.save();

        //상품을 클라이언트에 반환한다.
        return res.status(201).json({ product: product });
    } catch (error) {
        // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
        next(error);
    }
});

/** 상품 목록 조회 API */
router.get('/products', async (req, res, next) => {
    //1. 상품 목록 조회
    const products = await Product.find().sort('-createdAt').exec();

    //2 상품 목록 조회결과를 클라이언트에게 반환한다.
    return res.status(200).json({ products });
});

/** 상품 상세 조회 API */
router.get('/products/:Id', async (req, res, next) => {
    // 요청 파라미터에서 상품 ID를 추출합니다.
    const product = await Product.findOne({
        _id: req.params.Id,
    }).select('name, description, manager, status, createdAt, updatedAt');

    // 조회된 상품이 없는 경우, 404 상태 코드와 함께 에러 메시지를 반환합니다.
    if (!product) {
        return res.status(404).json({ message: '상품 조회에 실패하였습니다.', });
    }

    // 상품 정보를 클라이언트에 반환합니다.
    res.status(200).json({
        data: product,
    });
});


/*** 상품 수정 API */
router.put('/products/:id', async (req, res, next) => {
    // 요청 바디에서 필요한 상품 정보를 추출합니다.
    const { name, description, manager, status, password } = req.body;

    // 요청 바디에서 빠진 필수 정보가 있는지 확인합니다.
    if (!name || !description || !manager || !status || !password) {
        // 필수 정보 중 하나라도 빠진 경우 400 상태 코드와 함께 에러 메시지를 반환합니다.
        return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }

    // 상품을 데이터베이스에서 조회합니다.
    const product = await Product.findOne({
        _id: req.params.productId,
    });

    // 조회된 상품이 없는 경우 404 상태 코드와 함께 에러 메시지를 반환합니다.
    if (!product) {
        return res.status(404).json({ message: '상품 조회에 실패하였습니다.' });
    }

    // 상품의 비밀번호를 확인하여 수정 권한이 있는지 확인합니다.
    if (product.password !== Number(password)) {
        // 비밀번호가 일치하지 않는 경우 401 상태 코드와 함께 에러 메시지를 반환합니다.
        return res.status(401).json({
            message: '상품을 수정할 권한이 존재하지 않습니다.',
        });
    }

    // 상품 정보를 업데이트합니다.
    await Product.updateOne(
        { _id: req.params.productId },
        { $set: { name, description, manager, status, password } },
    );

    // 상품 정보가 성공적으로 수정되었음을 알리는 성공 메시지를 반환합니다.
    res.status(200).json({ message: '상품 정보가 성공적으로 수정되었습니다.' });
});

/**상품 삭제 API */
router.delete('/products/:id', async (req, res, next) => {
    // 요청 파라미터에서 상품 ID를 추출합니다.
    const { id } = req.params;

    // 데이터베이스에서 해당 ID를 가진 상품을 조회합니다.
    const product = await Product.findById(id).exec();
    if (!product) {
        // 상품이 존재하지 않는 경우 404 상태 코드와 함께 에러 메시지를 반환합니다.
        return res
            .status(404)
            .json({ errorMessage: '존재하지 않는 상품 정보입니다.' });
    }

    // 데이터베이스에서 해당 ID를 가진 상품을 삭제합니다.
    await Product.deleteOne({ _id: id });

    // 상품 삭제가 성공한 경우, 빈 객체와 함께 200 상태 코드를 반환합니다.
    return res.status(200).json({});
});

export default router;
