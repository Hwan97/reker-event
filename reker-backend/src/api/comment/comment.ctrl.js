import Comment from '../../models/comment';
import mongoose from 'mongoose';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const { ObjectId } = mongoose.Types;

// export const getcommentById = async (ctx, next) => {
//   const { id } = ctx.params;
//   if (!ObjectId.isValid(id)) {
//     ctx.status = 400; // Bad Request
//     return;
//   }
//   try {
//     const comment = await comment.findById(id);
//     // 포스트가 존재하지 않을 때
//     if (!comment) {
//       ctx.status = 404; // Not Found
//       return;
//     }
//     ctx.state.comment = comment;
//     return next();
//   } catch (e) {
//     ctx.throw(500, e);
//   }
// };

export const checkOwnComment = (ctx, next) => {
  const { user, comment } = ctx.state;
  if (comment.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};


export const write = async ctx => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    body: Joi.string().required(),
    // tags: Joi.array()
    //   .items(Joi.string())
    //   .required(), // 문자열로 이루어진 배열
  });

  // 검증 후, 검증 실패시 에러처리
  const result = Joi.validate(ctx.request.body, schema);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  const { body,  } = ctx.request.body;
  const comment = new Comment({
    body,
    user: ctx.state.user,
  });
  try {
    await comment.save();
    ctx.body = comment;
  } catch (e) {
    ctx.throw(500, e);
  }
};


/*
  GET /api/comment/:id
*/
export const read = async ctx => {

  ctx.body = ctx.state.comment;  
  
};

export const list = async ctx => {  
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }
  try {
  const comment = await Comment.find()
      .sort({ _id: -1 })
      .limit(8)
      .skip((page - 1) * 8)
      .lean()
      .exec();
      const commentCount = await Comment.countDocuments().exec();
      ctx.set('Last-Page', Math.ceil(commentCount / 6));
      ctx.body = comment.map(comment => ({
        ...comment,
        body: removeHtmlAndShorten(comment.body),
      }));
    } catch (e) {
      ctx.throw(500, e);
    }
};




/*
  DELETE /api/comment/:id
*/
export const remove = async ctx => {
  const { id } = ctx.params;
  try {
    await Comment.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content (성공은 했지만 응답할 데이터는 없음)
  } catch (e) {
    ctx.throw(500, e);
  }
};

// /*
//   PATCH /api/comment/:id
//   {
//     title: '수정',
//     body: '수정 내용',
//     tags: ['수정', '태그']
//   }
// */
export const update = async ctx => {
  const { id } = ctx.params;
  // write 에서 사용한 schema 와 비슷한데, required() 가 없습니다.
  const schema = Joi.object().keys({
    body: Joi.string()
  });

  // 검증 후, 검증 실패시 에러처리
  const result = Joi.validate(ctx.request.body, schema);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  const nextData = { ...ctx.request.body }; // 객체를 복사하고
  // body 값이 주어졌으면 HTML 필터링
  if (nextData.body) {
    nextData.body = sanitizeHtml(nextData.body);
  }
  try {
    const comment = await Comment.findByIdAndUpdate(id, nextData, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
      // false 일 때에는 업데이트 되기 전의 데이터를 반환합니다.
    }).exec();
    if (!comment) {
      ctx.status = 404;
      return;
    }
    ctx.body = comment;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// html 을 없애고 내용이 너무 길으면 200자로 제한시키는 함수
const removeHtmlAndShorten = body => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < 200 ? filtered : `${filtered.slice(0, 200)}...`;
};