import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js'; 
import LoginRouter from './routes/login.router.js'; 
import CharaRouter from './routes/chara.router.js'; 
import ItemRouter from './routes/item.router.js';
import InventoryRouter from './routes/inventory.router.js';
dotenv.config();
const app = express();
const PORT = 3306;

app.use(express.json());
app.use(cookieParser());
app.use('/api', UsersRouter);
app.use('/api', LoginRouter);
app.use('/api/items', ItemRouter);
app.use('/api/inventory', InventoryRouter);
app.use('/api/chara', CharaRouter); 

app.listen(PORT, () => {
  console.log(PORT, '서버가 열렸습니다');
});
