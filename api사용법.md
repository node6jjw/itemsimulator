회원가입 =  POST 형식 /  api/sign-up
{

"userID":"사용할아이디",
"password":"사용할비밀번호",
"password2":"사용할비밀번호(위와동일해야함)"
}
로그인 = POST 형식 /  api/login
{
    "userID":"아이디",
    "password":"비밀번호"
}
캐릭터 생성 = api/chara/create
{
    "name":"생성할캐릭터이름"
}
캐릭터 조회 = POST 형식 / api/view
{
    "userID":"사용자아이디"
}
캐릭터 삭제 = DELETE 형식 /api/delete/삭제할캐릭터id

아이템 생성 = post 형식 / api/items/create
{
    "name":"아이템이름",
    "stat":{"health":nnn,"power":nnn},
    "price":nnnn
}
아이템 수정 = PUT 형식 / api/items/update
{

"id":"n",
"name":"아이템이름",
    "stat":{"health":nnn,"power":nnn},
    "price":nnnn

}
아이템 삭제 = DELETE 형식 / api/items/DELETE/삭제할아이템id

아이템 목록 조회 = GET 형식 / api/items/list

인벤토리에 아이템 장착 POST 형식 / api/inventory/equip
{
    "itemID":n
    "inventoryID":n
}