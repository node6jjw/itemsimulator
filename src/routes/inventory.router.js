import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// 인벤토리에 아이템 장착 API
router.post('/equip', authenticateToken, async (req, res, next) => {
  try {
    const { itemID, inventoryID } = req.body;
    const userID = req.user?.userID; // 토큰에서 userID 가져오기

    if (!userID) {
      return res.status(401).json({ message: '사용자 인증 정보가 없습니다.' });
    }

    if (!itemID || !inventoryID) {
      return res.status(400).json({ message: 'itemID와 inventoryID를 모두 입력해주세요.' });
    }

    // 아이템과 인벤토리 존재 여부 확인
    const item = await prisma.item.findUnique({
      where: { id: itemID }
    });

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryID }
    });

    if (!item) {
      return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
    }

    if (!inventory) {
      return res.status(404).json({ message: '인벤토리를 찾을 수 없습니다.' });
    }

    // 아이템을 인벤토리에 추가
    await prisma.inventory.update({
      where: { id: inventoryID },
      data: {
        items: {
          connect: { id: itemID }
        }
      }
    });

    // 캐릭터 조회
    const chara = await prisma.chara.findUnique({
      where: { id: inventory.charaID }
    });

    if (!chara) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }

    // 아이템의 stat 값을 캐릭터의 스탯에 적용
    const itemStat = JSON.parse(item.stat);

    await prisma.chara.update({
      where: { id: chara.id },
      data: {
        health: chara.health + (itemStat.health || 0),
        power: chara.power + (itemStat.power || 0)
      }
    });

    return res.status(200).json({
      message: '아이템이 인벤토리에 장착되었습니다.',
      item: item,
      chara: {
        id: chara.id,
        health: chara.health + (itemStat.health || 0),
        power: chara.power + (itemStat.power || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;