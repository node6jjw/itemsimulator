import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET; // .env 파일에서 JWT 시크릿키 가져오기
const tokenExpiry = '1h'; // JWT 토큰 만료 시간
router.post('/login', async (req, res, next) => {
  try {
    const { userID, password } = req.body;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { userID }
    });

    if (!user) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
    }

    // 비밀번호 비교 (plainPassword와 hashedPassword 비교)
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userID: user.userID }, jwtSecret, { expiresIn: tokenExpiry });

    // JWT를 쿠키에 저장하여 클라이언트에게 전달
    res.cookie('token', token, {
      httpOnly: true, // 클라이언트 측 스크립트로부터 접근 불가
      secure: process.env.NODE_ENV === 'production', // 프로덕션에서는 HTTPS 사용
      maxAge: 60 * 60 * 1000 // 1시간
    });

    console.log('Generated JWT:', token); // 토큰이 제대로 생성됐는지 확인

    return res.status(200).json({
      message: '로그인 성공'
    });
  } catch (error) {
    next(error);
  }
});
export default router;
