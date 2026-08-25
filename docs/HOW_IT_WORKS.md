# LOZHKA: как это устроено

Живой документ для понимания проекта. Его можно дополнять по мере того, как мы добавляем новые страницы, API, таблицы, серверные настройки и правила безопасности.

Обновлено: 25 августа 2026.

## 1. Общая идея

LOZHKA сейчас строится как мобильное веб-приложение для пары/семьи:

- задачи;
- календарь;
- меню;
- покупки;
- люди;
- статистика;
- личные данные;
- регистрация и вход;
- общее пространство пары через код приглашения.

Пока это не приложение из App Store, а веб-приложение, которое открывается в браузере телефона.

Текущий адрес:

```text
http://200.165.229.186/
```

## 2. Большая схема

Когда пользователь открывает сайт на телефоне, работает такая цепочка:

```text
Телефон / браузер
        |
        |  http://200.165.229.186/
        v
Сервер VPS
        |
        v
Nginx
        |
        |-- обычные файлы сайта --> /var/www/kamspace
        |
        |-- запросы /api/... -----> Backend на 127.0.0.1:4000
                                      |
                                      v
                                  Prisma
                                      |
                                      v
                                  PostgreSQL в Docker volume
```

Отдельно для просмотра БД:

```text
Браузер -> http://200.165.229.186/db-admin/ -> Nginx -> Adminer -> PostgreSQL
```

Если совсем по-простому:

1. Браузер показывает интерфейс.
2. Если нужна реальная операция, браузер отправляет запрос в `/api/...`.
3. Nginx принимает запрос и решает, куда его направить.
4. Backend обрабатывает логику.
5. Prisma переводит эту логику в запросы к базе.
6. PostgreSQL хранит данные.

## 3. Что мы сделали по этапам

### 3.1. Идея и UX

Сначала у нас были:

- идея продукта;
- UX flow;
- референсы визуального стиля;
- понимание главных разделов.

Документы лежат в `docs/`.

Ключевая логика продукта: это не просто список задач, а общее семейное пространство, где два человека видят общий день, задачи, календарь, меню, покупки и личные события.

### 3.2. Первый frontend

Мы сделали мобильный прототип в папке:

```text
app/
```

Главная точка входа:

```text
app/index.html
```

Основной управляющий файл:

```text
app/src/main.js
```

Страницы:

```text
app/src/pages/
```

Стили:

```text
app/src/styles/
```

Компоненты:

```text
app/src/components/
```

Важно: frontend сейчас без сборщика. Это значит, что мы не используем сложную систему сборки вроде Vite/Webpack. Браузер напрямую загружает `index.html`, CSS и JS-модули.

### 3.3. Разделение frontend по файлам

Сначала всё было ближе к одному файлу. Потом мы разнесли проект на нормальную структуру:

- отдельные страницы;
- отдельные CSS-файлы;
- общие компоненты;
- отдельный API-клиент.

Это важно, потому что проект растёт. Если держать всё в одном файле, через несколько страниц там будет трудно ориентироваться и опасно вносить изменения.

### 3.4. GitHub

Мы подключили GitHub-репозиторий:

```text
git@github.com:kalenovaleksandr912-creator/LOZHKA.git
```

Git хранит историю изменений.

Обычная цепочка:

```text
изменили файлы -> commit -> push -> код попал на GitHub
```

Commit - сохранённая точка истории проекта.

Push - отправка этой точки на GitHub.

### 3.5. Сервер

Потом появился VPS-сервер с публичным IP:

```text
200.165.229.186
```

На нём сейчас:

- Nginx принимает HTTP-запросы снаружи;
- frontend лежит в `/var/www/kamspace`;
- исходники проекта лежат в `/opt/kamspace`;
- backend работает внутри Docker;
- PostgreSQL работает внутри Docker;
- Adminer для просмотра БД работает внутри Docker;
- база хранится в Docker volume, чтобы данные не пропадали при пересборке контейнера.

### 3.6. Backend и база

Backend лежит в:

```text
backend/
```

Основной стек:

- Node.js;
- Fastify;
- Prisma;
- PostgreSQL.

Backend сейчас умеет:

- проверять здоровье через `/health`;
- работать с регистрацией и входом;
- отдавать/создавать задачи;
- иметь базовые API для календаря, меню, покупок, людей и статистики.

Frontend пока не все эти API использует. Часть экранов ещё показывает mock-данные. Это нормально: мы переводим приложение на настоящую БД постепенно.

## 4. Что такое frontend, backend и API

Frontend - это то, что видит человек в браузере: экраны, кнопки, карточки, темы, формы.

Backend - серверная логика: принять запрос, проверить данные, создать пользователя, сохранить задачу, вернуть ответ.

API - договор между frontend и backend. Например:

```text
POST /api/auth/request-code
```

означает: frontend просит backend выдать код для входа.

```text
GET /api/tasks
```

означает: frontend просит backend вернуть задачи текущего пространства.

## 5. Как работает вход и регистрация

Мы сделали первый простой механизм входа без пароля.

### 5.1. Пользователь вводит телефон или почту

Frontend отправляет запрос:

```text
POST /api/auth/request-code
```

Backend:

1. Проверяет контакт.
2. Создаёт код.
3. Сохраняет код в таблицу `AuthCode`.
4. Возвращает код в ответе как `debugCode`.

Важно: сейчас это прототип. Реальная SMS/email-отправка ещё не подключена, поэтому код показывается прямо в интерфейсе.

### 5.2. Пользователь вводит код

Frontend отправляет:

```text
POST /api/auth/verify-code
```

Backend:

1. Ищет свежий код в `AuthCode`.
2. Проверяет, что он не истёк и не был использован.
3. Отмечает код как подтверждённый.
4. Если пользователь уже существует, возвращает его данные.

### 5.3. Пользователь заполняет профиль

Frontend отправляет:

```text
POST /api/auth/complete
```

Backend:

1. Создаёт или обновляет `User`.
2. Создаёт или находит `Space`.
3. Создаёт связь `SpaceMember`.
4. Создаёт `Session`.
5. Возвращает frontend-у session token.

### 5.4. Что такое session token

Session token - это длинная строка, которая доказывает backend-у: "это тот же пользователь, который уже вошёл".

Frontend хранит её в `localStorage` браузера:

```text
lozhka-session
```

После этого каждый API-запрос получает заголовок:

```text
Authorization: Bearer <token>
```

Backend по токену находит запись в `Session` и понимает:

- кто пользователь;
- в каком он пространстве;
- какие данные ему можно показать.

### 5.5. Что пока упрощено

Сейчас для скорости прототипа:

- коды входа хранятся в БД открыто;
- session token хранится в БД открыто;
- SMS/email реально не отправляются;
- HTTPS ещё не подключён;
- root-доступ к серверу ещё не заменён на отдельного deploy-пользователя.

Перед настоящими пользователями это нужно усилить.

## 6. Как работает добавление задачи

Когда пользователь добавляет задачу:

1. Frontend собирает данные из формы.
2. Отправляет запрос:

```text
POST /api/tasks
```

3. Backend берёт текущего пользователя из session token.
4. Backend берёт текущее пространство пары.
5. Создаёт строку в таблице `Task`.
6. Пишет событие в `OperationLog`.
7. Frontend заново загружает список задач через:

```text
GET /api/tasks
```

Так задача уже не просто "нарисована на экране", а реально сохранена в PostgreSQL.

## 7. Как устроена база данных

Главная идея БД: почти всё принадлежит не просто пользователю, а пространству пары.

`Space` - это контейнер семьи/пары.

`User` - отдельный человек.

`SpaceMember` - связь человека и пространства.

То есть один пользователь теоретически может быть участником разных пространств, хотя в продукте мы пока думаем про одно основное пространство пары.

### 7.1. Упрощённая схема связей

```text
User
  |
  | через SpaceMember
  v
Space
  |
  |-- Task
  |-- Event
  |-- Dish
  |     |
  |     v
  |   DishIngredient
  |
  |-- MenuPlanItem
  |     |
  |     v
  |   ShoppingItem
  |
  |-- Person
  |-- ImportantDate
  |-- DailyPhotoPrompt
  |     |
  |     v
  |   DailyPhoto
  |
  v
OperationLog
```

Отдельно для входа:

```text
AuthCode -> временные коды входа
Session  -> активные пользовательские сессии
```

### 7.2. Основные таблицы

`User`

Хранит людей:

- email;
- phone;
- name;
- avatarPhoto;
- partnerName;
- profileSettings;
- createdAt;
- lastLoginAt.

`Space`

Хранит общее пространство:

- name;
- inviteCode;
- partnerNameHint;
- themePreference;
- dailySummaryTime;
- notificationSettings;
- relationshipStartDate;
- weddingDate.

`SpaceMember`

Связь пользователя и пространства:

- spaceId;
- userId;
- role: `OWNER` или `MEMBER`;
- color;
- joinedAt.

`AuthCode`

Коды входа:

- contactType: email или phone;
- contact;
- code;
- expiresAt;
- verifiedAt;
- consumedAt.

`Session`

Активные входы:

- token;
- userId;
- spaceId;
- expiresAt;
- lastSeenAt.

`Task`

Задачи:

- title;
- details;
- status;
- category;
- assigneeType;
- assigneeUserId;
- deadline;
- createdById;
- completedById;
- completedAt.

`Event`

События календаря:

- title;
- date;
- time;
- createdById.

`Dish`

Блюда:

- title;
- mealType;
- ingredients.

`DishIngredient`

Ингредиенты блюда:

- dishId;
- name;
- amount.

`MenuPlanItem`

Выбор блюда на дату:

- dishId;
- date;
- mealType.

`ShoppingItem`

Покупки:

- title;
- amount;
- note;
- category: `PRODUCTS`, `HOUSEHOLD`, `HOME`, `OTHER`;
- shoppingDate;
- status;
- source.

`Person`

Люди из раздела "Люди":

- fullName;
- birthday;
- note.

`ImportantDate`

Важные даты пары:

- title;
- date;
- note.

`DailyPhotoPrompt`

Задание для фото дня:

- date;
- prompt.

`DailyPhoto`

Фотографии по заданию:

- promptId;
- userId;
- imageUrl;
- caption.

`OperationLog`

Журнал операций для статистики:

- кто сделал;
- что сделал;
- с какой сущностью;
- когда.

## 8. Как смотреть данные в БД

Есть два уровня: быстрые команды и интерактивный вход в базу.

### 8.1. Подключиться к серверу

С Windows можно зайти так:

```powershell
C:\Windows\System32\OpenSSH\ssh.exe -i C:\Users\kalen\.ssh\id_ed25519_github -o IdentitiesOnly=yes root@200.165.229.186
```

После входа полезно перейти в папку проекта:

```bash
cd /opt/kamspace
```

### 8.2. Проверить контейнеры

```bash
docker compose -f deploy/compose.prod.yaml ps
```

Ожидаем увидеть:

- `deploy-postgres-1` - база данных;
- `deploy-backend-1` - backend.

### 8.3. Войти в PostgreSQL

На текущем сервере база и пользователь называются `kamspace`.

```bash
docker exec -it deploy-postgres-1 psql -U kamspace -d kamspace
```

После этого откроется консоль БД.

Полезные команды внутри `psql`:

```sql
\dt
```

Показать таблицы.

```sql
\d "User"
```

Показать структуру таблицы `User`.

```sql
\d "Task"
```

Показать структуру таблицы `Task`.

Выйти:

```sql
\q
```

Важно: таблицы называются с большой буквы, поэтому в SQL их нужно писать в кавычках: `"User"`, `"Task"`, `"Space"`.

### 8.4. Посмотреть пользователей

```sql
select id, email, phone, name, "createdAt", "lastLoginAt"
from "User"
order by "createdAt" desc;
```

### 8.5. Посмотреть пространства

```sql
select id, name, "inviteCode", "relationshipStartDate", "createdAt"
from "Space"
order by "createdAt" desc;
```

### 8.6. Посмотреть участников пространств

```sql
select sm.id, sm."spaceId", s.name as space_name, sm."userId", u.name as user_name, sm.role, sm."joinedAt"
from "SpaceMember" sm
join "Space" s on s.id = sm."spaceId"
join "User" u on u.id = sm."userId"
order by sm."joinedAt" desc;
```

### 8.7. Посмотреть задачи

```sql
select id, title, details, status, category, "assigneeType", "assigneeUserId", deadline, "createdAt"
from "Task"
where "deletedAt" is null
order by "createdAt" desc;
```

### 8.8. Посмотреть активные сессии

Не стоит выводить сами токены. Лучше смотреть только метаданные:

```sql
select id, "userId", "spaceId", "expiresAt", "createdAt", "lastSeenAt"
from "Session"
order by "lastSeenAt" desc;
```

### 8.9. Посмотреть коды входа

Коды тоже лучше не выводить целиком. Для контроля достаточно этого:

```sql
select id, "contactType", contact, "expiresAt", "verifiedAt", "consumedAt", "createdAt"
from "AuthCode"
order by "createdAt" desc
limit 20;
```

### 8.10. Выполнить запрос одной командой без входа в psql

Например, показать последних пользователей:

```bash
docker exec deploy-postgres-1 psql -U kamspace -d kamspace -c 'select email, phone, name, "createdAt" from "User" order by "createdAt" desc limit 10;'
```

### 8.11. Простая веб-панель БД

Для визуального просмотра БД добавлен Adminer.

Адрес:

```text
http://200.165.229.186/db-admin/
```

Сначала браузер спросит логин и пароль nginx basic auth. Это первый защитный слой, чтобы панель не была открыта всему интернету.

После этого откроется форма Adminer. Для входа в БД используются такие поля:

```text
System: PostgreSQL
Server: postgres
Username: lozhka_admin
Password: смотри в /root/lozhka-db-admin-credentials.txt на сервере
Database: kamspace
```

На сервере данные для входа сохранены здесь:

```bash
cat /root/lozhka-db-admin-credentials.txt
```

Adminer - это очень простая веб-панель для базы. Через неё можно:

- смотреть таблицы;
- смотреть строки;
- фильтровать данные;
- редактировать строки;
- выполнять SQL-запросы.

Важно: это настоящая база. Если удалить строку в Adminer, она удалится из приложения. Пока лучше использовать панель в режиме "посмотреть/понять", а ручные правки делать осторожно.

## 9. Как устроен деплой

Деплой сейчас ручной, но уже понятный.

Локально мы работаем в:

```text
C:\Users\kalen\Desktop\KAM_Space
```

На сервере проект лежит в:

```text
/opt/kamspace
```

Публичные файлы сайта лежат в:

```text
/var/www/kamspace
```

Типовая логика деплоя:

1. Локально меняем код.
2. Проверяем синтаксис.
3. Делаем commit.
4. Делаем push на GitHub.
5. Упаковываем frontend и backend.
6. Загружаем архивы на сервер.
7. Frontend распаковываем в `/var/www/kamspace`.
8. Backend/deploy распаковываем в `/opt/kamspace`.
9. Пересобираем Docker Compose.
10. Проверяем `/health`.

Backend слушает только локально:

```text
127.0.0.1:4000
```

Снаружи к нему ходят не напрямую, а через Nginx:

```text
http://200.165.229.186/api/...
```

Это хорошо: backend не торчит наружу отдельным портом.

## 10. Зачем нужен Docker

Docker - это способ упаковать программу и её окружение в контейнер.

Контейнер можно представить как отдельную техническую коробку:

- внутри своя версия Node.js;
- свои зависимости;
- своя команда запуска;
- предсказуемое поведение на сервере.

У нас сейчас два контейнера:

- backend;
- PostgreSQL.
- Adminer.

Docker Compose - это файл-инструкция, который говорит: "запусти вот эти контейнеры вместе, с такими переменными и такими связями".

Файл:

```text
deploy/compose.prod.yaml
```

PostgreSQL хранит данные не внутри одноразового контейнера, а в volume:

```text
postgres-data
```

Volume - это постоянное хранилище Docker. Контейнер можно пересоздать, а данные останутся.

## 11. Что такое Prisma

Prisma - это слой между backend-кодом и PostgreSQL.

Вместо того чтобы везде писать сырой SQL, backend пишет примерно: "создай пользователя", "найди задачу", "обнови сессию".

Prisma смотрит на файл схемы:

```text
backend/prisma/schema.prisma
```

И понимает:

- какие таблицы есть;
- какие поля у таблиц;
- какие связи между таблицами;
- какие ограничения есть.

Команда:

```bash
npx prisma db push
```

применяет схему к базе.

В проде backend-контейнер сейчас при старте выполняет:

```bash
npx prisma db push && node src/server.js
```

Это удобно для прототипа. Позже лучше перейти на полноценные миграции, чтобы изменения БД были более контролируемыми.

## 12. Что такое Nginx

Nginx - это входная дверь сервера.

Он делает две вещи:

1. Отдаёт файлы frontend-а.
2. Перенаправляет `/api/...` на backend.

Текущий nginx-конфиг в репозитории:

```text
deploy/nginx/lozhka.conf
```

На сервере активный конфиг:

```text
/etc/nginx/sites-enabled/kamspace
```

## 13. Где что лежит

Локально:

```text
C:\Users\kalen\Desktop\KAM_Space
```

Frontend:

```text
app/
```

Backend:

```text
backend/
```

Prisma schema:

```text
backend/prisma/schema.prisma
```

Docker prod:

```text
deploy/compose.prod.yaml
```

Nginx config:

```text
deploy/nginx/lozhka.conf
```

Документация:

```text
docs/
```

На сервере:

```text
/opt/kamspace
/var/www/kamspace
/etc/nginx/sites-enabled/kamspace
```

## 14. Что уже настоящее, а что ещё прототип

Настоящее уже сейчас:

- сервер есть;
- сайт открывается с телефона;
- GitHub подключён;
- backend работает;
- PostgreSQL работает;
- простая веб-панель БД работает через Adminer;
- регистрация/вход сохраняются в БД;
- session token запоминает пользователя;
- задачи сохраняются через backend;
- профиль и уведомления могут сохраняться на сервере.

Ещё прототип:

- многие экраны всё ещё используют mock-данные;
- SMS/email реально не отправляются;
- нет HTTPS;
- нет автоматического CI/CD;
- нет production-уровня безопасности токенов;
- фото профиля пока хранится как строка в БД, а не как отдельный файл в хранилище.

## 15. Что нужно сделать дальше

Ближайший разумный план:

1. Довести auth-flow визуально по твоим ощущениям.
2. Перевести покупки на реальный backend.
3. Перевести меню на реальный backend.
4. Перевести календарь на реальный backend.
5. Перевести людей и статистику на реальные данные.
6. Добавить резервные копии PostgreSQL.
7. Подключить домен.
8. Подключить HTTPS.
9. Подключить настоящую отправку кода через email или SMS.
10. Заменить открытое хранение кодов/токенов на хешированное.

## 16. Маленький словарь

VPS - арендованный виртуальный сервер. Наш проект живёт на таком сервере.

Frontend - интерфейс, который видит пользователь.

Backend - серверная логика, которая работает с данными.

API - набор адресов, по которым frontend общается с backend.

Nginx - веб-сервер и маршрутизатор запросов.

Docker - упаковка приложения в контейнеры.

Docker Compose - инструкция, как запускать несколько контейнеров вместе.

Container - изолированный процесс с нужным окружением.

Volume - постоянное хранилище Docker.

PostgreSQL - база данных.

Adminer - простая веб-панель для просмотра и редактирования PostgreSQL.

Prisma - слой, который связывает backend-код и PostgreSQL.

Schema - описание таблиц, полей и связей в базе.

Migration - контролируемое изменение структуры БД.

Session - запись о том, что пользователь вошёл.

Token - строка-ключ, по которой backend узнаёт пользователя.

localStorage - хранилище в браузере пользователя.

Commit - сохранённая точка истории в Git.

Push - отправка commit-ов на GitHub.

SSH - защищённый вход на сервер.

Smoke-test - короткая проверка, что ключевой сценарий работает.
