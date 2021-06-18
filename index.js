const express = require('express')
const app = express()
const PORT = 5050

app.use(express.json())

const { existsSync, writeFileSync, readFileSync, truncate, truncateSync } = require('fs')

app.listen(PORT, () => {
    if (!existsSync('db-users.json')) {
    writeFileSync('db-users.json', JSON.stringify([]));
    console.log('Файл не сущетсвует');
}    else {
    console.log('Файл найден!')
}
console.log('App Started');
});

function registerUser(req, res) {
    const user = req.body;
    console.log('Данные которые пришли с клиента', user)

    const users = JSON.parse(readFileSync('db-users.json', 'utf-8'));
    console.log('Пользователи с JSON файла: ',users)

    //ищем пользователя в файле пользователей
    const userExists = users.find(oneUser => oneUser.email === user.email);

    //если он есть, то одаем ошибку на клиент
    if (userExists) {
        return res.status(400).json("Пользователь уже зарегистрирован");
    }
//Если его нет, то сохраняем
    users.unshift(user)
    //Удаляем старый файл без этого пользователя
    truncateSync('db-users.json');

    //Создаем новый файл с этим пользователем
    writeFileSync('db-users.json', JSON.stringify(users));

    res.status(201).json("Пользователь успешно зарегистрировался");
}


function loginUser(req, res) {
    const telo = req.body
    const users = JSON.parse(readFileSync('db-users.json', 'utf-8'));
    for (let i = 0; i < users.length; i++) {
        if (telo.email === users[i].email) {
            return res.status(201).json("Вы успешно авторизованы!")
        }
    }
    return res.status(400).json("Вы должны пройти регистрацию")
}


function unregisterUser(req, res) {
    const telo = req.body
    const users = JSON.parse(readFileSync('db-users.json', 'utf-8'));
    const findUser = users.find(
        (item) => item.email === telo.email);
    if (!findUser) {
        return res.status(400).json("Вы пытаетесь удалить не существующего пользователя");
    }
    res.status(201).json("Успешно удаленно")
}

app.delete("/unregister", unregisterUser)
app.post('/register', registerUser)
app.post('/login', loginUser)