import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const jwtSecret = process.env.JWT_SECRET;

// JWT 인증 미들웨어
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 토큰 추출

  if (token == null) return res.sendStatus(401); // 토큰이 없으면 Unauthorized

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.sendStatus(403); // 유효하지 않은 토큰이면 Forbidden

    console.log('Decoded JWT:', decoded); // 디코딩된 전체 내용을 출력
    req.user = decoded; // 디코딩된 데이터를 req.user에 저장

    next();
  });
};
// 선택적 JWT 인증 미들웨어
export const optionalAuthenticateToken = (req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 토큰 추출
  console.log('Extracted Token:', token);

  if (token == null) {
    req.user = null; // 토큰이 없으면 유저 정보 없음
    return next();
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('Token Verification Error:', err);
      req.user = null; // 유효하지 않은 토큰이면 유저 정보 없음
    } else {
      console.log('Decoded User:', user);
      req.user = user; // 유효한 토큰이면 유저 정보 저장
    }
    next();
  });
};