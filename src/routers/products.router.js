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
const createdProductSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/** 상품등록 API */
router.post('/products', async (req, res, next) => {
  try {
    // 1. 클라이언트로부터 받아온 value 데이터를 가져온다

    const validation = await createdProductSchema.validateAsync(req.body);

    const { value } = validation;

    // 1.5 만약, 클라이언트가 value 데이터를 전달하지 않았을때 클라이언트에게 에러메세지를 전달한다.
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야상품 데이터가 존재하지 않습니다' });
    }

    //2. 해당하는 마지막 order데이터를 조회한다.
    // findOne 1개의 데이터만 조회
    // sort = 정렬한다 -> 어떤컬럼을?
    const productMaxOrder = await Product.findOne().sort('-order').exec();

    //3 . 만약 존재한다면 현재 상품을 +1하고 order 데이터가 존재하지 않는다면 1로 할당한다.
    const order = productMaxOrder ? productMaxOrder.order + 1 : 1;

    //4 해야상품 등록
    const product = new Product({ value, order });
    await product.save();

    //5 상품을 클라이언트에 반환한다.
    return res.status(201).json({ product: product });
  } catch (error) {
    // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
  }
});

/** 상품 목록 조회 API */
router.get('/products', async (req, res, next) => {
  //1. 상품 목록 조회
  const products = await Product.find().sort('-order').exec();

  //2 상품 목록 조회결과를 클라이언트에게 반환한다.
  return res.status(200).json({ products });
});

/*** 상품 순서 변경, 완료, /해제 내용 변경 API */
router.patch('/products/:id', async (req, res, next) => {
  const { id } = req.params;
  const { order, done, value } = req.body;

  // 현재 나의 order가 무엇인지 알아야한다.
  const currentProduct = await Product.findById(id).exec();
  if (!currentProduct) {
    return res.status(404).json({ errorMessage: '존재하지 않는 상품 입니다.' });
  }

  if (order) {
    const targetProduct = await Product.findOne({ order: order }).exec();
    if (targetProduct) {
      targetProduct.order = currentProduct.order;
      await targetProduct.save();
    }

    currentProduct.order = order;
  }
  if (done !== undefined) {
    currentProduct.doneAt = done ? new Date() : null;
  }
  if (value) {
    currentProduct.value = value;
  }

  await currentProduct.save();

  return res.status(200).json({});
});
/**상품 삭제 API */
router.delete('/products/:id', async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id).exec();
  if (!product) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 상품 정보입니다.' });
  }

  await Product.deleteOne({ _id: id });

  return res.status(200).json({});
});

export default router;
