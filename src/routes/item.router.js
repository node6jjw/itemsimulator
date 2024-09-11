import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 아이템 생성 API
router.post('/create', async (req, res, next) => {
  try {
    const { name, stat, price, charaID } = req.body;

    // 필수 필드 확인
    if (!name || !stat || typeof price !== 'number') {
      return res.status(400).json({ message: 'name, stat, price를 모두 입력해주세요. price는 숫자형이어야 합니다.' });
    }

    // stat 필드 구조 확인
    if (typeof stat !== 'object' || !stat.health || !stat.power) {
      return res.status(400).json({ message: 'stat 필드는 객체 형태여야 하며 health와 power 값을 포함해야 합니다.' });
    }

    // 아이템 생성
    const newItem = await prisma.item.create({
      data: {
        name,
        stat: JSON.stringify(stat), // Prisma에 객체를 문자열로 저장
        price,
        chara: charaID ? { connect: { id: charaID } } : undefined // charaID가 있을 경우 연결
      }
    });

    return res.status(201).json({
      message: '아이템이 성공적으로 생성되었습니다.',
      item: newItem
    });
  } catch (error) {
    next(error);
  }
});
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 필수 필드 확인
    if (!id) {
      return res.status(400).json({ message: '삭제할 아이템의 ID를 입력해주세요.' });
    }

    // 아이템 삭제
    const deletedItem = await prisma.item.delete({
      where: { id }
    });

    return res.status(200).json({
      message: '아이템이 성공적으로 삭제되었습니다.',
      item: deletedItem
    });
  } catch (error) {
    next(error);
  }
});

// 아이템 목록 조회 API
router.get('/list', async (req, res, next) => {
  try {
    // 모든 아이템 조회
    const items = await prisma.item.findMany({
      select: {
        id: true,   
        name: true, 
        price: true   
      }
    });

    // 아이템 정보 반환
    const formattedItems = items.map(item => ({
      item_code: item.id,
      item_name: item.name,
      item_price: item.price
    }));

    return res.status(200).json(formattedItems);
  } catch (error) {
    next(error);
  }
});
// 아이템 수정 API
router.put('/update', async (req, res, next) => {
  try {
    // 요청 본문에서 id 추출
    const { id, name, stat, price } = req.body;

    // 필수 필드 확인
    if (!id) {
      return res.status(400).json({ message: '수정할 아이템의 ID를 입력해주세요.' });
    }

    if (!name && !stat && typeof price !== 'number') {
      return res.status(400).json({ message: '수정할 필드를 입력해주세요. name, stat, price 중 적어도 하나는 포함되어야 합니다.' });
    }

    if (stat && (typeof stat !== 'object' || !stat.health || !stat.power)) {
      return res.status(400).json({ message: 'stat 필드는 객체 형태여야 하며 health와 power 값을 포함해야 합니다.' });
    }

    // 아이템 수정
    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id, 10) }, // ID를 정수형으로 변환 (정수형 ID의 경우)
      data: {
        name,
        stat, // JSON 형식으로 저장되며 Prisma가 자동으로 처리
        price
      }
    });

    return res.status(200).json({
      message: '아이템이 성공적으로 수정되었습니다.',
      item: updatedItem
    });
  } catch (error) {
    next(error);
  }
});
export default router;