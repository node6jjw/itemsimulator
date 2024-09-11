import express from 'express';
import bcrypt from 'bcrypt';  
import { prisma } from '../utils/prisma/index.js'; 

const router = express.Router();
const saltRounds = 10; 

router.post('/sign-up', async (req, res, next) => {
  try {
    const { userID, password, password2 } = req.body;

    const idRegex = /^[a-z0-9]+$/;
    if (!idRegex.test(userID)) {
      return res.status(400).json({ message: 'userID는 영어 소문자와 숫자만 포함해야 합니다.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    if (password !== password2) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 사용자 존재 여부 확인
    const isExistUser = await prisma.user.findUnique({
      where: { userID }
    });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    await prisma.user.create({
      data: { userID, password: hashedPassword }
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});




export default router;
