// schemas/todo.schema.js

import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // value 필드는 필수 요소입니다.
  },
  description: {
    type: String,
    required: true, // value 필드는 필수 요소입니다.
  },
  manager: {
    type: String,
    required: true, // value 필드는 필수 요소입니다.
  },
  password: {
    type: String,
    required: true, // value 필드는 필수 요소입니다.
  },
  status: {
    type: String,
    required: false, // value 필드는 필수 요소입니다.
  },
  createdAt: {
    type: Date,
    required: false, // value 필드는 필수 요소입니다.
  },
  updatedAt: {
    type: Date,
    required: false, // value 필드는 필수 요소입니다.
  },
});

// 프론트엔드 서빙을 위한 코드입니다. 모르셔도 괜찮아요!
ProductSchema.virtual('productId').get(function () {
  return this._id.toHexString();
});
ProductSchema.set('toJSON', {
  virtuals: true,
});

// ProductSchema를 바탕으로 Todo모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model('product', ProductSchema);
