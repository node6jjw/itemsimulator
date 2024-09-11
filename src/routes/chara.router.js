import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import { authenticateToken } from './authMiddleware.js';
import { optionalAuthenticateToken } from './authMiddleware.js';

const router = express.Router();

// 캐릭터 생성 API
router.post('/create', authenticateToken, async (req, res, next) => {
  try {
    const { name, health, power, money } = req.body;
    const userID = req.user?.userID; // 토큰에서 userID 가져오기

    if (!userID) {
      return res.status(401).json({ message: '사용자 인증 정보가 없습니다.' });
    }

    if (!name) {
      return res.status(400).json({ message: 'name 필드를 입력해주세요.' });
    }

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { userID: userID }
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 캐릭터 이름 중복 확인
    const existingChara = await prisma.chara.findUnique({
      where: { name }
    });

    if (existingChara) {
      return res.status(409).json({ message: '이름이 중복됩니다.' });
    }

   
    const newChara = await prisma.$transaction(async (prisma) => {
      // 캐릭터 생성
      const createdChara = await prisma.chara.create({
        data: {
          name,
          health: health || 500,
          power: power || 100,
          money: money || 10000,
          userID // userID 추가
        }
      });

      // 인벤토리 생성
      await prisma.inventory.create({
        data: {
          charaID: createdChara.id // 생성된 캐릭터의 ID를 인벤토리와 연관시킴
        }
      });

      return createdChara;
    });

    return res.status(201).json({
      message: '캐릭터와 인벤토리가 성공적으로 생성되었습니다.',
      chara: newChara
    });
  } catch (error) {
    next(error);
  }
});
//캐릭터 삭제
router.delete('/delete/:charaID', authenticateToken, async (req, res, next) => {
  try {
    const { charaID } = req.params;
    const userID = req.user?.userID; // 토큰에서 userID 가져오기

    if (!userID) {
      return res.status(401).json({ message: '사용자 인증 정보가 없습니다.' });
    }

    // 삭제하려는 캐릭터가 사용자 소유인지 확인
    const chara = await prisma.chara.findUnique({
      where: { id: Number(charaID) }
    });

    if (!chara) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }

    // 캐릭터가 현재 인증된 사용자의 것인지 확인
    if (chara.userID !== userID) {
      return res.status(403).json({ message: '해당 캐릭터를 삭제할 권한이 없습니다.' });
    }

    // 캐릭터와 관련된 인벤토리도 삭제하는 트랜잭션
    await prisma.$transaction(async (prisma) => {
      // 인벤토리 삭제
      await prisma.inventory.delete({
        where: { charaID: chara.id }
      });

      // 캐릭터 삭제
      await prisma.chara.delete({
        where: { id: chara.id }
      });
    });

    return res.status(200).json({ message: '캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
});

// 캐릭터 조회 API
router.post('/view', optionalAuthenticateToken, async (req, res, next) => {
  try {
    const { userID } = req.body; // POST 본문에서 userID 가져오기
    const { user } = req; // 미들웨어에서 설정된 user 정보 가져오기

    if (!userID) {
      return res.status(400).json({ message: 'userID 본문 파라미터가 필요합니다.' });
    }

    // 요청된 userID의 캐릭터 조회
    const characters = await prisma.chara.findMany({
      where: { userID: userID }
    });

    if (!characters || characters.length === 0) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }

    // 캐릭터 정보 중 money 제외 또는 포함
    const charactersWithDetails = characters.map(chara => {
      if (user && user.userID === userID) {
        // 로그인 유저 본인의 캐릭터라면 money 포함
        return chara;
      } else {
   
        const { money, ...rest } = chara;
        return rest;
      }
    });

    return res.status(200).json({
      characters: charactersWithDetails
    });
  } catch (error) {
    next(error);
  }
});

export default router;
