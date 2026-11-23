// Отладочная функция для проверки сохранённых выборов
function debugChoices() {
    console.log("===== ОТЛАДКА ВЫБОРОВ =====");
    console.log("listenedToIgnat:", gameChoices.listenedToIgnat);
    console.log("wentToMedics:", gameChoices.wentToMedics);
    console.log("actionAtAttack:", gameChoices.actionAtAttack);
    console.log("transportWay:", gameChoices.transportWay);
    console.log("tookSupplies:", gameChoices.tookSupplies);
    console.log("letYaroslavIn:", gameChoices.letYaroslavIn);
    console.log("goToRedRockAlone:", gameChoices.goToRedRockAlone);
    console.log("huggedGhost:", gameChoices.huggedGhost);
    console.log("==========================");
}

// ===================== МУЗЫКА ДЛЯ ПЕРСОНАЖЕЙ И МЕНЮ =====================
let backgroundMusic = null;
let isMusicPlaying = true;
let isTyping = false;
let currentTypingTimeout = null;
let currentCharacter = null;
let isMainMenuMusic = true;
let currentMusicName = "";

const characterMusic = {
    menu: "music/Menu.wav",
    valera: "music/Just another day (Valera_Ambient).mp3",
    yana: "music/The latest report (Yana_Ambient).mp3",
    ignat: "music/Military chaos (Ignat_Ambient).mp3"
};

const musicNames = {
    menu: "меню",
    valera: "Just another day",
    yana: "The latest report",
    ignat: "Military chaos"
};

function setMusic(type, character = null) {
    let newSrc = null;
    let musicName = "";
    if (type === 'menu') {
        newSrc = characterMusic.menu;
        musicName = musicNames.menu;
        isMainMenuMusic = true;
    } else if (type === 'character' && character) {
        newSrc = characterMusic[character];
        musicName = musicNames[character];
        isMainMenuMusic = false;
    }
    if (!newSrc) {
        console.warn(`⚠️ Музыка для ${type} ${character || ''} не найдена`);
        return;
    }
    if (!backgroundMusic) {
        initMusic(type, character);
        return;
    }
    const wasPlaying = isMusicPlaying;
    backgroundMusic.pause();
    backgroundMusic.src = newSrc;
    backgroundMusic.load();
    if (wasPlaying) {
        backgroundMusic.play().catch(e => console.log("Автовоспроизведение заблокировано", e));
    }
    console.log(`🎵 Музыка изменена: ${type} ${character || ''} -> ${newSrc}`);
    currentMusicName = musicName;
    showMusicNotification(musicName);
}

function initMusic(type = 'menu', character = null) {
    if (backgroundMusic) return;
    let musicUrl = characterMusic.menu;
    let musicName = musicNames.menu;
    if (type === 'character' && character) {
        musicUrl = characterMusic[character];
        musicName = musicNames[character];
    }
    musicUrl = musicUrl || "music/nightmares-gaze_88435.mp3";
    try {
        backgroundMusic = new Audio(musicUrl);
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.4;
        console.log(`✅ Музыка загружена: ${musicUrl}`);
        currentMusicName = musicName;
    } catch (e) {
        console.error("❌ Ошибка загрузки музыки:", e);
    }
}

function playMusic() {
    if (backgroundMusic && !isMusicPlaying) {
        backgroundMusic.play().catch(e => console.log("Автовоспроизведение заблокировано"));
        isMusicPlaying = true;
        updateMusicUI();
    }
}

function pauseMusic() {
    if (backgroundMusic && isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        updateMusicUI();
    }
}

function toggleMusic() {
    if (!backgroundMusic) {
        initMusic();
        if (!backgroundMusic) return;
    }
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function updateMusicUI() {
    const statusSpan = document.getElementById("musicStatus");
    const iconSpan = document.getElementById("musicIcon");
    if (statusSpan) statusSpan.innerText = isMusicPlaying ? "МУЗЫКА: ВКЛ" : "МУЗЫКА: ВЫКЛ";
    if (iconSpan) iconSpan.innerText = isMusicPlaying ? "🎵" : "🔇";
}

function autoStartMusic() {
    if (!backgroundMusic) return;
    backgroundMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicUI();
    }).catch(e => {
        isMusicPlaying = false;
        updateMusicUI();
        const playOnClick = () => {
            if (backgroundMusic && !isMusicPlaying) {
                backgroundMusic.play().then(() => {
                    isMusicPlaying = true;
                    updateMusicUI();
                }).catch(e => console.log("Ошибка:", e));
                document.removeEventListener("click", playOnClick);
            }
        };
        document.addEventListener("click", playOnClick);
    });
}

function startMenuMusic() { setMusic('menu'); if (backgroundMusic && !isMusicPlaying) playMusic(); }
function setCharacterMusic(character) { setMusic('character', character); }

// ===================== УВЕДОМЛЕНИЕ О МУЗЫКЕ (СНИЗУ СЛЕВА) =====================
let musicNotificationTimeout = null;

function showMusicNotification(text) {
    const notification = document.getElementById("musicNotification");
    if (!notification) return;
    
    if (musicNotificationTimeout) {
        clearTimeout(musicNotificationTimeout);
    }
    
    notification.textContent = `🎵 ${text}`;
    notification.classList.add("show");
    
    musicNotificationTimeout = setTimeout(() => {
        notification.classList.remove("show");
        musicNotificationTimeout = null;
    }, 2500);
}

// ===================== ЭФФЕКТ ПЕЧАТАНИЯ ТЕКСТА =====================
function typeText(element, text, speed = 30, callback) {
    if (currentTypingTimeout) clearTimeout(currentTypingTimeout);
    isTyping = true;
    let index = 0;
    element.innerHTML = "";
    function addNextLetter() {
        if (index < text.length) {
            let char = text[index];
            if (char === '\n') element.innerHTML += '<br>';
            else element.innerHTML += char;
            index++;
            currentTypingTimeout = setTimeout(addNextLetter, speed);
        } else {
            isTyping = false;
            currentTypingTimeout = null;
            if (callback) callback();
        }
    }
    addNextLetter();
}

function skipTyping(element, fullText) {
    if (currentTypingTimeout) {
        clearTimeout(currentTypingTimeout);
        isTyping = false;
        element.innerHTML = fullText.replace(/\n/g, '<br>');
    }
}

// ===================== СИСТЕМА ВЫБОРОВ (ДЛЯ ИТОГОВ) =====================
let gameChoices = {
    listenedToIgnat: undefined,
    wentToMedics: undefined,
    actionAtAttack: undefined,
    transportWay: undefined,
    tookSupplies: undefined,
    letYaroslavIn: undefined,
    goToRedRockAlone: undefined,
    huggedGhost: undefined
};

function setChoice(key, value) {
    gameChoices[key] = value;
    console.log(`📝 Выбор сохранён: ${key} = ${value}`);
}

// ===================== ИНТРО (ЗАСТАВКА) =====================
let introTimeout = null;

function showIntro(character, callback) {
    const introScreen = document.getElementById("introScreen");
    const introTitle = document.getElementById("introTitle");
    const introSubtitle = document.getElementById("introSubtitle");
    
    if (!introScreen) {
        if (callback) callback();
        return;
    }
    
    // Убираем предыдущие классы фонов
    introScreen.classList.remove("intro-bg-valera", "intro-bg-yana", "intro-bg-ignat");
    
    // Данные для каждого персонажа
    const introData = {
        valera: { 
            title: "Глава 1", 
            subtitle: "Конец старого мира",
            bgClass: "intro-bg-valera"
        },
        yana: { 
            title: "Глава 1", 
            subtitle: "Репортаж угасающих огней",
            bgClass: "intro-bg-yana"
        },
        ignat: { 
            title: "Глава 1", 
            subtitle: "Долг и хаос",
            bgClass: "intro-bg-ignat"
        }
    };
    
    const data = introData[character] || introData.valera;
    introTitle.textContent = data.title;
    introSubtitle.textContent = data.subtitle;
    
    // Добавляем класс фона
    if (data.bgClass) {
        introScreen.classList.add(data.bgClass);
    }
    
    introScreen.style.display = "flex";
    introScreen.classList.remove("intro-fade-out");
    
    setTimeout(() => {
        introScreen.classList.add("active");
    }, 50);
    
    if (introTimeout) clearTimeout(introTimeout);
    introTimeout = setTimeout(() => {
        introScreen.classList.add("intro-fade-out");
        setTimeout(() => {
            introScreen.classList.remove("active", "intro-fade-out");
            introScreen.style.display = "none";
            if (callback) callback();
        }, 1500);
    }, 3000);
}

// ===================== ФОНЫ ДЛЯ МЕНЮ (РОТАЦИЯ) =====================
const menuBackgrounds = [
    "images/menu/Menu.png",
    "images/menu/Menu2.jpg",
    "images/menu/Menu3.jpg"
];

let menuBgIndex = 0;
let menuBgInterval = null;

function startMenuBackgroundRotation() {
    const mainMenu = document.getElementById("mainMenu");
    if (!mainMenu) return;
    
    // Проверяем наличие файлов, если первого нет — пробуем второй и т.д.
    let foundBg = false;
    for (let i = 0; i < menuBackgrounds.length; i++) {
        const bg = menuBackgrounds[i];
        if (bg) {
            mainMenu.style.backgroundImage = `url('${bg}')`;
            menuBgIndex = i;
            foundBg = true;
            break;
        }
    }
    
    if (!foundBg) {
        console.warn("⚠️ Фоны для меню не найдены");
        return;
    }
    
    if (menuBgInterval) clearInterval(menuBgInterval);
    menuBgInterval = setInterval(() => {
        menuBgIndex = (menuBgIndex + 1) % menuBackgrounds.length;
        const nextBg = menuBackgrounds[menuBgIndex];
        if (nextBg && mainMenu) {
            mainMenu.style.backgroundImage = `url('${nextBg}')`;
        }
    }, 8000); // меняем каждые 8 секунд
}

// ===================== СЦЕНЫ ВАЛЕРЫ (все пути -> images/valera/) =====================
const valeraScenes = {
    start: {
        background: "images/valera/Begin.jpg",
        text: "Это случилось глубокой ночью, мне не спалось, что-то тревожило меня. Было чувство, что случилось что-то ужасное...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Wake" }]
    },
    Wake: {
        background: "images/valera/Begin.jpg",
        text: "Я надел носки, рубашку, штаны и пошёл на кухню попить воды",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "kitchen" }]
    },
    kitchen: {
        background: "images/valera/image.jpg",
        text: "Я зашёл на кухню, включил свет, взял стакан с водой и выпил её.",
        buttons: [
            { label: "Посмотреть в окно", nextScene: "Window" },
            { label: "Открыть холодильник", nextScene: "Fridge" }
        ]
    },
    Window: {
        background: "images/valera/Window.jpg",
        text: "За окном виднелся двор и парковка. Повсюду горели фонари, однако на улице не было и души. Постояв ещё немного и поняв, что ничего интересного там уже нет, я пошёл спать",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Afternoon" }]
    },
    Fridge: {
        background: "images/valera/Fridge.jpg",
        text: "Холодильник был полон еды, однако я не голоден. Убедившись в том что еда мне не требуется, я лёг спать",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Afternoon" }]
    },
    Afternoon: {
        background: "images/valera/Afternoon.jpg",
        text: "На следующее утро я встал как ни в чём не бывало, этот кошмар мне больше не снился, и я уже успел забыть о нём",
        buttons: [
            { label: "Послушать радио", nextScene: "Radio" },
            { label: "Посмотреть телевизор", nextScene: "TV" },
            { label: "Почитать газету", nextScene: "Newspaper" }
        ]
    },
    Radio: {
        background: "images/valera/imagee1.jpg",
        text: "Я решил включить радио, чтобы послушать новости вокруг",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AfternoonNews" }]
    },
    AfternoonNews: {
        background: "images/valera/imagee1.jpg",
        text: "Доброе утро дорогие радиослушатели в эфире радиостанция 'Александрия', мы переходим к утренним новостям",
        buttons: [
            { label: "Взглянуть на фото своей бывшей", nextScene: "Ex" },
            { label: "Продолжить слушать радио", nextScene: "News" }
        ]
    },
    Ex: {
        background: "images/valera/imagee1.jpg",
        text: "Моя бывшая, красотка, но характером стерва, интересно, где она сейчас?",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Emergency" }]
    },
    News: {
        background: "images/valera/imagee1.jpg",
        text: "С развитием пищевой промышленности мы стали свидетелями значительных изменений в нашем рационе и образе жизни. В последние десятилетия технологии производства и переработки продуктов питания достигли небывалых высот.",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Emergency" }]
    },
    Emergency: {
        background: "images/valera/imagee1.jpg",
        text: "А теперь к последним новостям: в соседнем городе участились случаи заражения людей неизвестным вирусом, правительство пока не может дать точного ответа",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Work" }]
    },
    TV: {
        background: "images/valera/TV.jpg",
        text: "Я решил включить телевизор и посмотреть новости, творящиеся вокруг",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TvNews" }]
    },
    TvNews: {
        background: "images/valera/TvNews.jpg",
        text: "Включив телевизор, я увидел новости, ничего примечательного, очередной рост акций какого-то предпринимателя, снижение цен и прочая ерунда",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Qurantine" }]
    },
    Qurantine: {
        background: "images/valera/Qurantine.jpg",
        text: "Экстренные новости: в соседнем городе появился неизвестный вирус, правительство просит сохранять граждан спокойствие и по возможности не покидать дома, город закрыт на карантин",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Work" }]
    },
    Newspaper: {
        background: "images/valera/Newspaper.jpg",
        text: "Я решил взять газету и почитать новости, чтобы узнать что творится вокруг",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "CommonNews" }]
    },
    CommonNews: {
        background: "images/valera/Newspaper.jpg",
        text: "Особо интересных новостей в газете не было, кто-то продавал дом, кто-то искал работников",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TerribleNews" }]
    },
    TerribleNews: {
        background: "images/valera/Virus.jpg",
        text: "Однако моё внимание привлёк заголовок о неизвестном вирусе. В соседнем городе вспыхнула эпидемия неизвестного вируса, правительство закрыло его на карантин",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Work" }]
    },
    Work: {
        background: "images/valera/Work.jpg",
        text: "Новости были не очень, однако я уверен, что правительство справится с этой проблемой",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Street" }]
    },
    Street: {
        background: "images/valera/Street.jpg",
        text: "Я вышел из дома и отправился на работу. Я работал в местной редакции, и здание моего издательства находилось через пару кварталов отсюда",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Workplace" }]
    },
    Workplace: {
        background: "images/valera/Redaction.jpg",
        text: "Я дошёл до места работы, однако меня окликнул какой-то человек в военной форме",
        buttons: [
            { label: "Обратить внимание на незнакомца", nextScene: "Warning", action: () => setChoice("listenedToIgnat", true) },
            { label: "Проигнорировать", nextScene: "Office", action: () => setChoice("listenedToIgnat", false) }
        ]
    },
    Warning: {
        background: "images/valera/Stranger.jpg",
        text: "Незнакомец представился Игнатом, и рассказал, что служит в войсках. Он спросил меня не видел ли я что-нибудь странное. Он выглядил нервно и говорил непонятные вещи",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Psycho" }]
    },
    Psycho: {
        background: "images/valera/Stranger.jpg",
        text: "'Ты что псих?' - спросил я его, он продолжил нести свою чушь о конце света, и о том, что в соседнем городе люди убивают друг друга",
        buttons: [
            { label: "Не слушать его и пойти в офис", nextScene: "WalkAway" },
            { label: "Спросить больше информации", nextScene: "Information" }
        ]
    },
    WalkAway: {
        background: "images/valera/Stranger.jpg",
        text: "Я пошёл в офис, Игнат всё ещё кричал, что-то вслед, однако я уже не слушал его",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Office" }]
    },
    Information: {
        background: "images/valera/Stranger.jpg",
        text: "Я решил разузнать больше о вирусе, быть может это не такой уж и бред. Игнат рассказал о том как был свидетелем, нападения сумасшедшего на заправке, и о том, что нападавший был слабо похож на человека...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Nonsense" }]
    },
    Nonsense: {
        background: "images/valera/Stranger.jpg",
        text: "Ну и бред подумал я, и пошёл в офис",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Office" }]
    },
    Office: {
        background: "images/valera/Office.jpg",
        text: "Я зашёл в офис, сел за своё рабочее место и принялся за работу. Работы предстояло много, нужно было разобрать отчёты, а также бумаги связанные с инцедентом на фабрике по производству аккумуляторов",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Accident" }]
    },
    Accident: {
        background: "images/valera/Office.jpg",
        text: "Однако мою работу прервали крики доносящиеся из коридора",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Yelling" }]
    },
    Yelling: {
        background: "images/valera/Hall.jpg",
        text: "Выйдя из коридора, я увидел жуткую картину, мой коллега по работе, бежал с ужасом на лице и весь в крови",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Blood" }]
    },
    Blood: {
        background: "images/valera/Blood.jpg",
        text: "Дмитрий так звали моего коллегу, рассказал, что на первом этаже, на охрану напал какой-то сумасшедший, охранику пришлось применить пистолет, чтобы утихомирить его, однако туда прибежало ещё несколько сумасшедших, ему удалось сбежать от них, однако они всё ещё в здании",
        buttons: [
            { label: "Вызвать полицию", nextScene: "Police" },
            { label: "Спуститься на первый этаж и посмотреть, что там происходит", nextScene: "Death" },
            { label: "Убедить покинуть остальных здание", nextScene: "Plan" }
        ]
    },
    Police: {
        background: "images/valera/Police.jpg",
        text: "Я решил позвонить в полицию, чтобы рассказать о случившимся, однако звонок не проходил...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Chaos" }]
    },
    Death: {
        background: "images/valera/Death.jpg",
        text: "Я решил спуститься на первый этаж, чтобы разведать обстановку, однако как только я спустился, я увидел толпу сумасшедших людей, к несчастью один из них заметил меня, и толпа двинулась ко мне, я не успел отреагировать и я был убит ими... \n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    Plan: {
        background: "images/valera/Plan.jpg",
        text: "Я убедил остальных покинуть здание, через запасной выход. Все сначала замялись, но убедившись, что здесь небезопасно, поддержали мою идею",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Chaos" }]
    },
    Chaos: {
        background: "images/valera/Coridor exit.jpg",
        text: "Мы вышли в коридор, и начали продвигаться к выходу, коридор был заполнен зомби, нам нужно было срочно, сбежать от них",
        buttons: [
            { label: "Поехать на лифте", nextScene: "Elevator" },
            { label: "Спуститься по лестнице", nextScene: "Stairs" }
        ]
    },
    Elevator: {
        background: "images/valera/Elevator.jpg",
        text: "Мы решили поехать на лифте, чтобы быстрее выбраться из здания",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Exit" }]
    },
    Stairs: {
        background: "images/valera/Stairs.jpg",
        text: "Мы решили спуститься по лестнице, однако по пути мы увидели зомби...",
        buttons: [
            { label: "Подняться обратно наверх", nextScene: "Death2" },
            { label: "Спуститься непривлекая внимание", nextScene: "Exit" }
        ]
    },
    Death2: {
        background: "images/valera/Death.jpg",
        text: "Мы решили не рисковать и подняться обратно наверх, однако к тому моменту лестница уже была оккупирована зомби... \n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    Exit: {
        background: "images/valera/Exit.jpg",
        text: "Мы спустились по лестнице, и направились прямиком на выход",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "StreetChaos" }]
    },
    StreetChaos: {
        background: "images/valera/StreetChaos.jpg",
        text: "Выйдя на улицу мы лицезрели настоящий хаос, люди бежали в панике, повсюду были разбитые машины, слышны звуки выстрелов",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Medics" }]
    },
    Medics: {
        background: "images/valera/Medics.jpg",
        text: "Оглянувшись неподалеку мы заметили медиков и военных, мы отправились туда в надежде, что они помогут нам",
        buttons: [
            { label: "Пойти к медикам и военным", nextScene: "ArmyBlockpost" },
            { label: "Идти дальше по шоссе", nextScene: "Death3" }
        ]
    },
    Death3: {
        background: "images/valera/Death.jpg",
        text: "Мы решили не доверять тем медикам и идти дальше по шоссе, однако далеко мы не ушли, зомби настигли нас очень быстро и не имея возможности, отбиться, мы пали... \n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    ArmyBlockpost: {
        background: "images/valera/Medics.jpg",
        text: "Мы подошли к блокпосту с военными, они отправили нас к медикам, чтобы убедиться, что нас не кусали",
        buttons: [
            { label: "Пройти медикам", nextScene: "Ambulance", action: () => setChoice("wentToMedics", "went") },
            { label: "Отказаться", nextScene: "GoAway", action: () => setChoice("wentToMedics", "refused") }
        ]
    },
    Ambulance: {
        background: "images/valera/Ambulance.jpg",
        text: "Мы прошли в машину скорой помощи, нас обследовали и никто из нас укушенным не оказался",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Outpost" }]
    },
    GoAway: {
        background: "images/valera/Outpost.jpg",
        text: "Я отказался от этого, однако мои коллеги были не в восторге от этого, и потому меня поместили в карантинную зону и убедившись, что я не заражён, меня впустили",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Outpost" }]
    },
    Outpost: {
        background: "images/valera/Outpost.jpg",
        text: "Мы разместились на блокпосте военных, проходя мимо я услышал по рации, о вводе чрезвычайного положения в городе. Всех военных призывали перегруппироваться На Красном Камне",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Broadcast" }]
    },
    Broadcast: {
        background: "images/valera/Outpost.jpg",
        text: "За последние часы, количество заражённых увеличилось в два раза, блокпосты, не успевают сдерживать натиск, мы уже потеряли контроль над Афонино и Машзаводом, всем уцелевшим солдатам, прибыть на Красный Камень...",
        buttons: [
            { label: "Слушать дальше", nextScene: "Order" },
            { label: "Вернуться к остальным", nextScene: "Return" }
        ]
    },
    Order: {
        background: "images/valera/Outpost.jpg",
        text: "Согласно приказу администрации нашего города, все граждане города, должны быть немедленно эвакуированы в безопасную зону... Не успев дослушать, раздался крик",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Attack" }]
    },
    Return: {
        background: "images/valera/Outpost.jpg",
        text: "И как только я хотел вернуться к остальным, раздался крик",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Attack" }]
    },
    Attack: {
        background: "images/valera/Attack.jpg",
        text: "На блокпост напали зомби, нужно было немедленно, принять меры",
        buttons: [
            { label: "Остаться защищать блокпост", nextScene: "Death4", action: () => setChoice("actionAtAttack", "stay") },
            { label: "Украсть карту и сбежать", nextScene: "RunAway", action: () => setChoice("actionAtAttack", "stole") },
            { label: "Помочь эвакуироваться", nextScene: "Helping", action: () => setChoice("actionAtAttack", "helped") }
        ]
    },
    Death4: {
        background: "images/valera/Death.jpg",
        text: "Я решил остаться и помочь, военным отбить атаку, однако как мы не старались, зомби было больше, уже через несколько минут, весь блокпост был разрушен... \n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    RunAway: {
        background: "images/valera/Outpost.jpg",
        text: "Я понял, что блокпост уже не спасти, и единственный способ спастись это бежать, я захватил карту, пистолет и пару обойм с собой и побежал прочь...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "City" }]
    },
    Helping: {
        background: "images/valera/Helping.jpg",
        text: "Я решил помочь остальным эвакуироваться, мы начали усаживать людей в грузовик",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "DeficultChoice" }]
    },
    DeficultChoice: {
        background: "images/valera/Helping.jpg",
        text: "Оставалось одно место, я хотел занять его, но меня окликнули, это оказалась маленькая девочка лет пяти, она осталась одна, как и место...",
        buttons: [
            { label: "Отдать последнее место", nextScene: "Evacuating" },
            { label: "Занять самому", nextScene: "ICant" }
        ]
    },
    Evacuating: {
        background: "images/valera/Evacution.jpg",
        text: "Я отдал оставшееся место девочке, а сам убедился, что грузовик готов к отправке, подал сигнал военным",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TakeIt" }]
    },
    ICant: {
        background: "images/valera/Evacution.jpg",
        text: "Я не смог заставить себя, так поступить и отдал оставшееся место девочке, а сам убедился, что грузовик готов к отправке, подал сигнал военным",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TakeIt" }]
    },
    TakeIt: {
        background: "images/valera/TakeIt.jpg",
        text: "Я дал сигнал военным и они начали покидать блокпост, они поблагодарили меня за помощь и назвали меня благородным, на последок они дали мне пистолет, несколько обойм, и карту, и сказали идти по ней",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "City" }]
    },
    City: {
        background: "images/valera/City.jpg",
        text: "Я пошёл по центральной улице, люди в панике пытались покинуть город, повсюду разъезжали машины спецслужб",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Home" }]
    },
    Home: {
        background: "images/valera/City.jpg",
        text: "Я решил вернуться домой, чтобы собрать и вещи и отправиться в путь указанный на карте",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Way" }]
    },
    Way: {
        background: "images/valera/Choice.jpg",
        text: "Мой дом находился далеко отсюда, идти по открытой улице было очень опасно, неподалёку я заметил автобус, на котором, я всегда добирался домой, но он был переполнен людьми, также неподалёку было метро, которое выглядело безопаснее...",
        buttons: [
            { label: "Поехать на автобусе", nextScene: "Bus", action: () => setChoice("transportWay", "bus") },
            { label: "Поехать на метро", nextScene: "Metro", action: () => setChoice("transportWay", "metro") },
            { label: "Пойти пешком", nextScene: "Walk", action: () => setChoice("transportWay", "walk") }
        ]
    },
    Bus: {
        background: "images/valera/Bus.jpg",
        text: "Я решил, что на автобусе будет безопаснее всего добраться до дома, он был битком, но всё же я смог протиснуться...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Ride" }]
    },
    Ride: {
        background: "images/valera/Ride.jpg",
        text: "Мы неслись на огромной скорости, была огромная давка, но в целом всё было хорошо пока, я не заметил, что один из пассажиров укушен...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Bitten" }]
    },
    Bitten: {
        background: "images/valera/Bitten.jpg",
        text: "У сидевшего спереди мужчины, был укус на руке, я понимал, что он скоро превратится, нужно было срочно что-то делать...",
        buttons: [
            { label: "Попросить водителя остановить автобус и открыть двери", nextScene: "Stop" },
            { label: "Не обращать внимание", nextScene: "Death5" },
            { label: "Выпрыгнуть из автобуса", nextScene: "Death6" }
        ]
    },
    Stop: {
        background: "images/valera/Stop.jpg",
        text: "Я попросил водителя остановить автобус, сказав, что один из пассажиров укушен, водитель не стал медлить и немедленно остановил автобус и открыл двери, как раз вовремя, ведь пассажир к этому времени уже обратился. Не желая стать его жертвой я выбежал из автобуса и побежал в сторону своего дома...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Run" }]
    },
    Run: {
        background: "images/valera/Run.jpg",
        text: "Я бежал, что есть сил, стараясь не оглядываться назад, я слышал крики людей в автобусе, и жалел, что ничем не мог помочь им... Моим утешением было, что я почти добрался до дома",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "MyYard" }]
    },
    Death5: {
        background: "images/valera/Death.jpg",
        text: "Я решил не обращать внимание на это и продолжил как ни в чём не бывало стоять, однако уже через несколько минут, я услышал крики, пассажир обратился и напал людей, я оказался в ловушке и уже совсем скоро, меня укусили... \n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    Death6: {
        background: "images/valera/Death.jpg",
        text: "Я решил действовать наверняка, взяв всю волю в кулак, я разогнался и выпрыгнул из автобуса, мне удалось выпрыгнуть, однако я переломал себе ноги, я поздно осознал своё положение, ведь одна из этих тварей уже добралась до меня... \n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    Metro: {
        background: "images/valera/Metro.jpg",
        text: "Я решил, что метрополитен будет надёжнее автобуса, поэтому я спустился туда...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Metrohall" }]
    },
    Metrohall: {
        background: "images/valera/Metrohall.jpg",
        text: "Спустившись, я обнаружил, что поезд ещё не отправился, недолго думая, я запрыгнул в вагон и мы поехали...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Train" }]
    },
    Train: {
        background: "images/valera/Train.jpg",
        text: "Внутри поезда было довольно пусто, лишь пара человек, как и я пытались спастись от этого ужаса здесь",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "CrashTrain" }]
    },
    CrashTrain: {
        background: "images/valera/Crash.jpg",
        text: "Радость длилась недолго, и уже на следующей станции мы получили свою ложку дёгтя, на путях был разбитый состав, через который было невозможно проехать...",
        buttons: [
            { label: "Попытаться самому убрать поезд", nextScene: "DumpIdea" },
            { label: "Покинуть метро и идти пешком", nextScene: "Outside" },
            { label: "Залезть в разбитый состав и осмотреться", nextScene: "InsideTrain" }
        ]
    },
    DumpIdea: {
        background: "images/valera/DumpIdea.jpg",
        text: "Я попытался убрать поезд своими руками, однако ничего не вышло, удивительно, на что я рассчитывал?",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AlmostThere" }]
    },
    Outside: {
        background: "images/valera/Outside.jpg",
        text: "Так как пути были перегорождены, мне пришлось выйти из поезда и покинуть метро...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AlmostThere" }]
    },
    InsideTrain: {
        background: "images/valera/InsideTrain.jpg",
        text: "Я решил проверить, этот разбитый поезд, в надежде, что там есть что-нибудь полезное, однако убедившись, что в этом поезде ничего нет, я отправился к выходу...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AlmostThere" }]
    },
    AlmostThere: {
        background: "images/valera/AlmostThere.jpg",
        text: "В любом случае, я решил дойти до дома пешком, благо он был уже близко",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "MyYard" }]
    },
    Walk: {
        background: "images/valera/Walk.jpg",
        text: "Я решил, что и автобус, и метро будут небезопасны, поэтому я решил доковылять до дома на своих двоих",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "StreetWalk" }]
    },
    StreetWalk: {
        background: "images/valera/StreetWalk.jpg",
        text: "Я шёл целую вечность, на улицах на удивление было тихо и пусто, но пройдя пару кварталов, я увидел фургон одиноко стоящий на улице...",
        buttons: [
            { label: "Пройти мимо", nextScene: "Walking" },
            { label: "Попробовать завести фургон", nextScene: "Trying" },
            { label: "Посмотреть, что внутри", nextScene: "InsideVan" }
        ]
    },
    Walking: {
        background: "images/valera/Walking.jpg",
        text: "Я решил не обращать внимание на фургон и идти дальше...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "MyYard" }]
    },
    Trying: {
        background: "images/valera/Trying.jpg",
        text: "Я попытался завести фургон, но он ни в какую не хотел заводится, поняв, что это бессмысленно, я решил проверить, что внутри",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "InsideVan" }]
    },
    InsideVan: {
        background: "images/valera/InsideVan.jpg",
        text: "Внутри фургона, оказалось немного припасов, несколько бутылок воды, несколько консерв, рюкзак и фонарик, я хотел их взять, но тут подумал, а вдруг они кому-то принадлежат?",
        buttons: [
            { label: "Забрать себе", nextScene: "Take", action: () => setChoice("tookSupplies", true) },
            { label: "Оставить", nextScene: "DontTake", action: () => setChoice("tookSupplies", false) }
        ]
    },
    Take: {
        background: "images/valera/Take.jpg",
        text: "Хозяев поблизости не оказалось, поэтому я решил забрать эти вещи себе, мне они очень пригодятся!",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "MyYard" }]
    },
    DontTake: {
        background: "images/valera/DontTake.jpg",
        text: "Я не стал брать вещи из фургона, у них наверняка есть хозяин, я спокойно могу обойтись без них",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "MyYard" }]
    },
    MyYard: {
        background: "images/valera/MyYard.jpg",
        text: "Я был во дворе своего дома, мне оставалось пройти совсем немного, но моё внимание привлекли крики доносящиеся из подворотни...",
        buttons: [
            { label: "Пройти мимо", nextScene: "Entrance" },
            { label: "Заглянуть в подворотню", nextScene: "Death8" }
        ]
    },
    Entrance: {
        background: "images/valera/Entrance.jpg",
        text: "Я не стал обращать внимание на крики и зашёл в свой подъезд, в подъезде было очень темно, видимо снова лампочки перегорели, я лишь надеялся не встретить на лестничной клетке одну из этих тварей...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "ApartmentEntrance" }]
    },
    Death8: {
        background: "images/valera/Death.jpg",
        text: "Я решил заглянуть в подворотню, ведь судя по крикам кому-то требовалась помощь, однако, как только я заглянул туда, на меня напали заражённые, к сожалению я не успел достать оружие и меня съели заживо...\n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
    ApartmentEntrance: {
        background: "images/valera/ApartmentEntrance.jpg",
        text: "К счастью мои молитвы были услышаны, и я дошёл до своей квартиры без происшествий...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "InsideApartment" }]
    },
    InsideApartment: {
        background: "images/valera/InsideApartment.jpg",
        text: "Я зашёл внутрь своей квартиры, она выглядела безупречно, чего не скажешь об остальном городе, мне нужно было срочно придумать план, пока вирус, не охватил весь город полностью...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Myroom" }]
    },
    Myroom: {
        background: "images/valera/InsideApartment.jpg",
        text: "Я присел на кресло и стал размышлять, Красный камень находился на другом конце города, путь туда был очень опасен, однако оставаться здесь тоже небезопасно...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Call" }]
    },
    Call: {
        background: "images/valera/Call.jpg",
        text: "Но мои размышления прервал звонок в дверь, я осторожно взглянул в глазок...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Neighboor" }]
    },
    Neighboor: {
        background: "images/valera/Neighboor.jpg",
        text: "За дверью стоял мой сосед Ярослав, он выглядел обеспокоенным и настойчиво продолжал звонить в дверь",
        buttons: [
            { label: "Впустить его", nextScene: "ImportantNews", action: () => setChoice("letYaroslavIn", "let_in_immediately") },
            { label: "Не впускать его", nextScene: "OpenMe", action: () => setChoice("letYaroslavIn", "let_in_forced") }
        ]
    },
    ImportantNews: {
        background: "images/valera/ImportantNews.jpg",
        text: "Я впустил Ярослава внутрь, он поблагодарил меня, и попросил включить телевизор...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TV2" }]
    },
    OpenMe: {
        background: "images/valera/InsideApartment.jpg",
        text: "Он продолжал стучать в дверь, и чтобы он не привлёк внимание зомби, мне пришлось впустить его...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "ImportantNews" }]
    },
    TV2: {
        background: "images/valera/TV.jpg",
        text: "Я включил телевизор и начал смотреть новости...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "BadNews" }]
    },
    BadNews: {
        background: "images/valera/BadNews.jpg",
        text: "'В связи с растущим количеством заражённых, президент страны вынужден объявить чрезвычайное положение во всей стране, большинство городов будут закрыты на карантин, гражданам запрещено покидать эти города'",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "EmergencySituation" }]
    },
    EmergencySituation: {
        background: "images/valera/BadNews.jpg",
        text: "'В городах будут действовать блокпосты, через девять дней национальная гвардия начнёт эвакуацию городов, в специальные пункты'",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AfterEmergency" }]
    },
    AfterEmergency: {
        background: "images/valera/TV.jpg",
        text: "Я выключил телевизор, и задумался, то что национальная гвардия начнёт эвакуацию города, это конечно здорово, но каковы гарантии, что вирус к этому времени не доберётся до нашего района?",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Dispute" }]
    },
    Dispute: {
        background: "images/valera/ImportantNews.jpg",
        text: "Ярослав предложил, просто дождаться военных, однако мне эта идея не очень нравилась, но нужно было что-то предпринять",
        buttons: [
            { label: "Ждать военных", nextScene: "Wait", action: () => setChoice("goToRedRockAlone", "wait_for_army") },
            { label: "Отправляться в путь", nextScene: "ToGo", action: () => setChoice("goToRedRockAlone", "alone") }
        ]
    },
    Wait: {
        background: "images/valera/TV.jpg",
        text: "Я решил послушать Ярослава, и мы начали ждать прибытия военных",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Sleep" }]
    },
    Sleep: {
        background: "images/valera/Wait.jpg",
        text: "Мы ждали на протяжении четырёх часов, за это время на улице стемнело, и я решил сдремнуть",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Dream" }]
    },
    Dream: {
        background: "images/valera/Dream.jpg",
        text: "Мне приснилось, что я нахожусь в каком-то лесу, а вдалеке стоит тёмный силуэт какой-то девушки",
        buttons: [
            { label: "Следовать за силуэтом", nextScene: "Follow" },
            { label: "Спросить кто она", nextScene: "AnswerMe" }
        ]
    },
    Follow: {
        background: "images/valera/FollowMe.jpg",
        text: "'Иди за мной любимый!' - сказал силуэт кокетливо смеясь",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Forest" }]
    },
    AnswerMe: {
        background: "images/valera/FollowMe.jpg",
        text: "'Любимый это же я, ты что, не узнал меня?' - сказал силуэт и побежал вглубь леса",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Forest" }]
    },
    Forest: {
        background: "images/valera/Forest.jpg",
        text: "Я продолжал продвигаться вглубь леса, силуэт не становился ближе, а только становился всё дальше от меня",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Find" }]
    },
    Find: {
        background: "images/valera/Find.jpg",
        text: "Наконец вдалеке я заметил хижину",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Cabin" }]
    },
    Cabin: {
        background: "images/valera/Cabin.jpg",
        text: "Я подошёл к хижине, она выглядело заброшенной, тот силуэт пропал, и теперь я не знал, что мне делать...",
        buttons: [
            { label: "Зайти внутрь", nextScene: "InsideCabin" },
            { label: "Взглянуть в окно", nextScene: "CabinWindow" }
        ]
    },
    InsideCabin: {
        background: "images/valera/InsideCabin.jpg",
        text: "Я зашёл внутрь хижины, там было очень пыльно и грязно, я совсем не понимал, где я...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Shadow" }]
    },
    CabinWindow: {
        background: "images/valera/CabinWindow.jpg",
        text: "Я взглянул в окно хижины, внутри ни души...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "InsideCabin" }]
    },
    Shadow: {
        background: "images/valera/InsideCabin.jpg",
        text: "'Любимый?' - раздался знакомый голос со спины",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Yana" }]
    },
    Yana: {
        background: "images/valera/Shadow.jpg",
        text: "Я обернулся и увидел её... Яна, моя бывшая жена... Но почему здесь?",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "ShadowPast" }]
    },
    ShadowPast: {
        background: "images/valera/Shadow.jpg",
        text: "'Ты нашёл меня любимый! Я скучала по тебе!' - Она вытянула руки",
        buttons: [
            { label: "Обнять", nextScene: "Hug", action: () => setChoice("huggedGhost", true) },
            { label: "Не поддаваться", nextScene: "Angry", action: () => setChoice("huggedGhost", false) }
        ]
    },
    Hug: {
        background: "images/valera/Hug.jpg",
        text: "Я подошёл к ней ближе и обнял её, она была тёплой и живой, совсем не похожа на заражённых",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "CantSaveMe" }]
    },
    Angry: {
        background: "images/valera/Angry.jpg",
        text: "'Ты не любишь меня?' - её голос стал более агрессивным",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "CantSaveMe" }]
    },
    CantSaveMe: {
        background: "images/valera/Goodbye.jpg",
        text: "Неожиданно её образ стал искажаться и превращаться в нечто странное, похожее на тех существ",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Goodbye" }]
    },
    Goodbye: {
        background: "images/valera/Goodbye.jpg",
        text: "'Ты не смог спасти наш брак, и не сможешь спасти меня и сейчас' - Сказало это чудовище",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "LoveAttacked" }]
    },
    LoveAttacked: {
        background: "images/valera/LoveAttacking.jpg",
        text: "'Умри!' - Она набросилась на меня и стала поедать...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "DayOneResults" }]
    },
    ToGo: {
        background: "images/valera/ApartmentEntrance.jpg",
        text: "Я решил, что оставаться небезопасно и решил отправляться в путь, Ярослав был не в восторге, и остался дома дожидаться военных...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Highway" }]
    },
    Highway: {
        background: "images/valera/Highway.jpg",
        text: "Я вышел из дома и направился на запад по шоссе",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "EmptyHighway" }]
    },
    EmptyHighway: {
        background: "images/valera/EmptyHighway.jpg",
        text: "Я шёл по карте, меня напрягало, что тут так тихо, ни людей, ни зомби...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "StrangeGuy" }]
    },
    StrangeGuy: {
        background: "images/valera/StrangeGuy.jpg",
        text: "Однако вскоре вдалеке я заметил фигуру, похожую на человека из-за тумана его было сложно разглядеть...",
        buttons: [
            { label: "Окликнуть", nextScene: "ToCallOut" },
            { label: "Наставить пистолет", nextScene: "Shoot" }
        ]
    },
    ToCallOut: {
        background: "images/valera/ToCallOut.jpg",
        text: "'Эй!' - Я окликнул его",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Infected" }]
    },
    Infected: {
        background: "images/valera/Infected.jpg",
        text: "Он обернулся, и это оказался заражённый, он тут же напал на меня благо у меня был пистолет и я тут же выстрелил в него...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Search" }]
    },
    Shoot: {
        background: "images/valera/Shoot.jpg",
        text: "Я достал и наставил на незнакомца, он обернулся и это был зомби, я тут же выстрелил в него...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Search" }]
    },
    Search: {
        background: "images/valera/Search.jpg",
        text: "Я решил проверить его карманы, в надежде, что там есть что-нибудь полезное",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Phone" }]
    },
    Phone: {
        background: "images/valera/Phone.jpg",
        text: "У него в кармане оказался сотовый телефон, я решил взять его, ведь он мог пригодиться",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "BigProblem" }]
    },
    BigProblem: {
        background: "images/valera/BigProblem.jpg",
        text: "Однако долго радоваться я не смог, на звук выстрела, уже начали сбегаться зомби, судя по всему вирус уже добрался и до моего района, я понял что оставаться здесь небезопасно и побежал отсюда прочь",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "NeedCar" }]
    },
    NeedCar: {
        background: "images/valera/EmptyHighway.jpg",
        text: "Я бежал, что есть сил, я понимал, что идти пешком в разгар зомби апокалипсиса небезопасно, поэтому, мне нужно было срочно найти машину",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Car" }]
    },
    Car: {
        background: "images/valera/Car.jpg",
        text: "К счастью неподалеку я заметил брошенный автомобиль такси, и тут же побежал к нему",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Lucky" }]
    },
    Lucky: {
        background: "images/valera/Lucky.jpg",
        text: "Внутри никого не было, ключи были оставлены в приборной панели, мне очень сильно повезло",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "InsideCar" }]
    },
    InsideCar: {
        background: "images/valera/InsideCar.jpg",
        text: "Я сел вовнутрь и завёл двигатель, в машине также было включено радио",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "RedRockBroadcast" }]
    },
    RedRockBroadcast: {
        background: "images/valera/RedRockBroadcast.jpg",
        text: "'Внимание всем выжившим!' - Раздался голос из радио",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "RedRock" }]
    },
    RedRock: {
        background: "images/valera/RedRockBroadcast.jpg",
        text: "'Говорит Красный Камень, в связи со сложившимся обстоятельствами, был отдан приказ об эвакуации, всем выжившим срочно прибыть в зону эвакуации!' - Продолжал говорить голос из радио",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Hurry" }]
    },
    Hurry: {
        background: "images/valera/RedRockBroadcast.jpg",
        text: "'Торопитесь! через восемь дней мы покинем этот город!'",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "DayOneResults" }]
    },
    DayOneResults: {
        background: "images/valera/Results.jpg",
        text: () => {
            console.log("========== DayOneResults ВЫЗВАН ==========");
            console.log("gameChoices:", JSON.stringify(gameChoices, null, 2));
            console.log("listenedToIgnat:", gameChoices.listenedToIgnat);
            console.log("wentToMedics:", gameChoices.wentToMedics);
            console.log("actionAtAttack:", gameChoices.actionAtAttack);
            console.log("transportWay:", gameChoices.transportWay);
            console.log("tookSupplies:", gameChoices.tookSupplies);
            console.log("letYaroslavIn:", gameChoices.letYaroslavIn);
            console.log("goToRedRockAlone:", gameChoices.goToRedRockAlone);
            console.log("huggedGhost:", gameChoices.huggedGhost);
            console.log("==========================================");

            let resultText = "───── ИТОГИ ПЕРВОГО ДНЯ ─────\n\n";

            if (gameChoices.listenedToIgnat !== undefined) {
                resultText += gameChoices.listenedToIgnat
                    ? "✓ Вы послушали Игната"
                    : "✗ Вы проигнорировали предупреждения Игната.";
            } else {
                resultText += "? Вы не встретили Игната (или не дошли до этой сцены).";
            }
            resultText += "\n\n";

            if (gameChoices.wentToMedics === "went") {
                resultText += "✓ Вы согласились пройти медосмотр у военных и были допущены в безопасную зону.";
            } else if (gameChoices.wentToMedics === "refused") {
                resultText += "✗ Вы отказались от медосмотра, вас поместили в карантин, но позже выпустили оттуда.";
            } else {
                resultText += "? Вы не дошли до блокпоста (или выбрали другой путь).";
            }
            resultText += "\n\n";

            if (gameChoices.actionAtAttack === "helped") {
                resultText += "✓ Вы остались, чтобы помочь эвакуировать людей.";
            } else if (gameChoices.actionAtAttack === "stole") {
                resultText += "✓ Вы забрали карту и сбежали.";
            } else {
                resultText += "? Вы не участвовали в обороне блокпоста (или выбрали другой путь).";
            }
            resultText += "\n\n";

            switch (gameChoices.transportWay) {
                case "bus": resultText += "✓ Вы добрались на автобусе."; break;
                case "metro": resultText += "✓ Вы спустились в метро."; break;
                case "walk": resultText += "✓ Вы пошли пешком."; break;
                default: resultText += "? Вы не выбрали способ добраться (или погибли в пути).";
            }
            resultText += "\n\n";

            if (gameChoices.transportWay === "walk" && gameChoices.tookSupplies !== undefined) {
                resultText += gameChoices.tookSupplies
                    ? "✓ Вы забрали припасы из фургона."
                    : "✗ Вы оставили припасы в фургоне.";
                resultText += "\n\n";
            } else if (gameChoices.transportWay === "walk" && gameChoices.tookSupplies === undefined) {
                resultText += "? Вы шли пешком, но не дошли до фургона (или не стали его осматривать).";
                resultText += "\n\n";
            }

            if (gameChoices.letYaroslavIn === "let_in_immediately") {
                resultText += "✓ Вы сразу впустили соседа Ярослава.";
            } else if (gameChoices.letYaroslavIn === "let_in_forced") {
                resultText += "⚠ Вы не хотели впускать Ярослава, но позже все равно открыли дверь.";
            } else {
                resultText += "? Вы не встретили Ярослава (или не дошли до этой сцены).";
            }
            resultText += "\n\n";

            if (gameChoices.goToRedRockAlone === "alone") {
                resultText += "✓ Вы решили не ждать помощи и отправились к Красному Камню самостоятельно.";
            } else if (gameChoices.goToRedRockAlone === "wait_for_army") {
                resultText += "⌛ Вы предпочли дождаться военных, надеясь на эвакуацию.";
            } else {
                resultText += "? Вы не приняли финального решения (или не дошли до этой сцены).";
            }
            resultText += "\n\n";

            if (gameChoices.goToRedRockAlone === "wait_for_army" && gameChoices.huggedGhost !== undefined) {
                resultText += gameChoices.huggedGhost
                    ? "✓ Вы обняли призрака."
                    : "✗ Вы отвергли призрака бывшей.";
                resultText += "\n\n";
            } else if (gameChoices.goToRedRockAlone === "alone") {
                resultText += "✗ Вы не видели сон.";
                resultText += "\n\n";
            }

            resultText += "─────────────────────\nВаш первый день в аду подошёл к концу. Что ждёт вас дальше?";
            return resultText;
        },
        buttons: [{ label: "🏁 ЗАВЕРШИТЬ ИГРУ", action: () => returnToCharacterSelect() }]
    }
};

// ===================== СЦЕНЫ ЯНЫ (все пути -> images/yana/) =====================
const yanaScenes = {
    start: {
        background: "images/yana/Report.jpg",
        text: "Это был обычный ничем непримечательный репортаж, я освещала проблему безработицы и растущего недовольства, из-за недавнего сокращения на фабрике",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Report" }]
    },
    Report: {
        background: "images/yana/Report.jpg",
        text: "'Администрация завода сохраняет молчание касаемо массового сокращения сотрудников, в тоже время всё большое внимание приобретает слух об утечке хлора в одной из цехов этого завода'",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Done" }]
    },
    Done: {
        background: "images/yana/Date.jpg",
        text: "'И снято' - Сказал Вадим, мой оператор",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "LongDay" }]
    },
    LongDay: {
        background: "images/yana/Date.jpg",
        text: "'Ну и денёк... Неправда Ян?' - Устало говорил он",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Date" }]
    },
    Date: {
        background: "images/yana/Date.jpg",
        text: "'Может сходим в кафе? Я угощаю' - предложил он",
        buttons: [
            { label: "Согласиться", nextScene: "Cafe" },
            { label: "Отказаться", nextScene: "GoHome" }
        ]
    },
    Cafe: {
        background: "images/yana/Date.jpg",
        text: "'Ну хорошо' - Сказала ему я",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Menu" }]
    },
    Menu: {
        background: "images/yana/Menu.jpg",
        text: "В кафе было уютно и комфортно",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TvBroadcast" }]
    },
    TvBroadcast: {
        background: "images/yana/Menu.jpg",
        text: "Однако радость прервало оповещение по телевизору",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "EmergencyAlert" }]
    },
    EmergencyAlert: {
        background: "images/yana/TvBroadcast.jpg",
        text: "'В последнее время всё чаще поступают сообщения о заражении неизвестным вирусом...'",
        buttons: [
            { label: "Слушать дальше", nextScene: "InfectedCities" },
            { label: "Уйти", nextScene: "Leaving" }
        ]
    },
    InfectedCities: {
        background: "images/yana/InfectedCities.jpg",
        text: "'На экране представлен список городов, заражённых неизвестным вирусом, к сожалению число инфицированных растёт...'",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Worry" }]
    },
    Worry: {
        background: "images/yana/InfectedCities.jpg",
        text: "'Соседний Прокопьевск заражён, как думаешь вирус доберёться до нас?' - Спросила я Вадима",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "IDontKnow" }]
    },
    IDontKnow: {
        background: "images/yana/InfectedCities.jpg",
        text: "'Не знаю, будем надеется, что нет' - Ответил Вадим",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "LittleWhile" }]
    },
    LittleWhile: {
        background: "images/yana/Rain.jpg",
        text: "Мы ещё немного посидели в кафе и отправились на выход",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Rain" }]
    },
    Leaving: {
        background: "images/yana/Rain.jpg",
        text: "'Ерунда какая-то...' - Сказала я и отправилась на выход, Вадим остался в недоумении...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Rain" }]
    },
    Rain: {
        background: "images/yana/Rain.jpg",
        text: "На улице лил дождь и было тёмно",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "WaitTheSec" }]
    },
    WaitTheSec: {
        background: "images/yana/WaitTheSec.jpg",
        text: "'Постой Ян' - Окликнул меня Вадим",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "GoodbyeMiss" }]
    },
    GoodbyeMiss: {
        background: "images/yana/GoodbyeMiss.jpg",
        text: "'Я всего лишь хочу сказать, спасибо, что согласились пойти, до завтра' - Попрощался Вадим",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AloneWalk" }]
    },
    GoHome: {
        background: "images/yana/Date.jpg",
        text: "'Не спасибо, я лучше пойду домой, нужно подготовить материал к завтрашнему дню' - Ответила я",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "AloneWalk" }]
    },
    AloneWalk: {
        background: "images/yana/GoHome.jpg",
        text: "Я шла по дороге, было тёмно, но дом был близко, осталось пройти пару шагов",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "HomeSweetHome" }]
    },
    HomeSweetHome: {
        background: "images/yana/HomeSweetHome.jpg",
        text: "Наконец я пришла домой, я была уставшей и голодной",
        buttons: [
            { label: "Принять ванну", nextScene: "Bathroom" },
            { label: "Пойти на кухню и поесть", nextScene: "KitchenRoom" }
        ]
    },
    Bathroom: {
        background: "images/yana/Bathroom.jpg",
        text: "Я решила принять ванну, чтобы расслабиться после тяжёлого дня",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Bath" }]
    },
    Bath: {
        background: "images/yana/Bath.jpg",
        text: "Я набрала ванну и легла в теплую воду",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Bedroom" }]
    },
    KitchenRoom: {
        background: "images/yana/Kitchen.jpg",
        text: "Я решила пойти на кухню и поесть",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Food" }]
    },
    Food: {
        background: "images/yana/Food.jpg",
        text: "Я приготовила себе поесть, еда была вкусной и полезной",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Bedroom" }]
    },
    Bedroom: {
        background: "images/yana/Bedroom.jpg",
        text: "Время близилось к ночи, поэтому я легла спать",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "StrangeAfternoon" }]
    },
    StrangeAfternoon: {
        background: "images/yana/AfternoonBedroom.jpg",
        text: "Я проснулась рано утром, от странных звуков...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Colone" }]
    },
    Colone: {
        background: "images/yana/EmergencyCars.jpg",
        text: "Выглянув в окно, я увидела машины спецслужб, похоже они спешили на срочный вызов",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "OnlineNews" }]
    },
    OnlineNews: {
        background: "images/yana/OnlineNews.jpg",
        text: "Я не стала придавать этому особое значение и села за компьютер, мне нужно было готовиться к интервью, поэтому я стала листать новости касаемо этого",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Dress" }]
    },
    Dress: {
        background: "images/yana/Dress.jpg",
        text: "Прочитав новости я стала гладить платье, завтрашнее интервью было очень важным, и мой вид должен быть соответствующим",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "OfficeNews" }]
    },
    OfficeNews: {
        background: "images/yana/OfficeNews.jpg",
        text: "Я пришла к зданию телестанции, вот-вот там должно было состояться интервью",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Colleagues" }]
    },
    Colleagues: {
        background: "images/yana/Interview.jpg",
        text: "Внутри было куча моих коллег, все они обсуждали что-то, кто-то говорил о том, как брал интервью у местной звезды, кто-то о том как прикрыл контрабанду на прошлой неделе, в общем обычные разговры...",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Interview" }]
    },
    Interview: {
        background: "images/yana/News.jpg",
        text: "Я прошла к сцене, где вот-вот состоится интервью, и стала ждать редактора",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "What" }]
    },
    What: {
        background: "images/yana/What.jpg",
        text: "- Как шоссе 42 перекрыли? Почему? Что значит карантин? - Возмущено говорил Виктор, мой Редактор",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "HowLong" }]
    },
    HowLong: {
        background: "images/yana/What.jpg",
        text: "- И как долго продлится карантин? У нас запланировано интервью в Афонино на следующей неделе  - Продолжал Виктор",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Sorry" }]
    },
    Sorry: {
        background: "images/yana/Sorry.jpg",
        text: "- Прости похоже интервью сегодня отменяется, у них там что-то вроде утечки, всё перекрыто, возвращайся домой  - Пытаясь сохранить спокойствие сказал Виктор",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "BathroomDoors" }]
    },
    BathroomDoors: {
        background: "images/yana/BathroomDoors.jpg",
        text: "Я собралась домой, однако перед выходом я решила воспользоваться уборной",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "ToiletTime" }]
    },
    ToiletTime: {
        background: "images/yana/ToiletTime.jpg",
        text: "Уже в туалете я начала просматривать чаты",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Chats" }]
    },
    Chats: {
        background: "images/yana/Chats.jpg",
        text: "В сообщениях не было ничего особо интересного, кроме того что прислал Вадим",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Video" }]
    },
    Video: {
        background: "images/yana/Video.png",
        text: "На видео группа солдат, пытается противостоять заражённым, похоже, что дела в Прокопьевске ухудшались, военным едва удавалось сдерживать вирус",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "ToiletPaper" }]
    },
    ToiletPaper: {
        background: "images/yana/ToiletPaper.jpg",
        text: "Вирус явно прорывался, оставалось надеяться, что до нас он не дойдёт",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Sink" }]
    },
    Sink: {
        background: "images/yana/Sink.jpg",
        text: "Выйдя из кабинки и помыв руки, я услышала крики и плач",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "ScariedFriend" }]
    },
    ScariedFriend: {
        background: "images/yana/ScariedFriend.jpg",
        text: "Моя коллега по работе Василиса стояла у раковины в слезах и со странным укусом на руке",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "TalkToFriend" }]
    },
    TalkToFriend: {
        background: "images/yana/ScariedFriend.jpg",
        text: "'Что случилось? - Спросила я Василису'",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "WhatHappened" }]
    },
   WhatHappened: {
        background: "images/yana/ScariedFriend.jpg",
        text: "Василиса рассказала, что по дороге на работу, на неё напал какой-то странный человек, он повалил её на землю и пытался убить её, но ей удалось вырваться",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Corridor" }]
    },
    Corridor: {
        background: "images/yana/Corridor.jpg",
        text: "'Ну и жуть, чего только люди не творят' - Подумала я, и вышла из туалета",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "CorridorEmpty" }]
    },
    CorridorEmpty: {
        background: "images/yana/Corridor.jpg",
        text: "В коридоре было пусто и тихо, однако вдалеке виднелся силуэт напоминающий человека",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "StrangeGuy" }]
    },
    StrangeGuy: {
        background: "images/yana/StrangeGuy.jpg",
        text: "Он напоминал человека, однако что-то в нём было не то...",
        buttons: [
            { label: "Проверить кто это", nextScene: "Death" },
            { label: "Пойти к выходу", nextScene: "Exit" }
        ]
    },
    Death: {
        background: "images/yana/Death.jpg",
        text: "Как только я подошла к нему, я увидела его лицо, оно было всё в крови, и он тут же набросился на меня, к сожалению мне не удалось отбиться от него...\n\nВы мертвы!",
        buttons: [{ label: "💀 НАЧАТЬ ЗАНОВО", action: () => restartGame() }]
    },
   Exit: {
        background: "images/yana/Exit.jpg",
        text: "Я решила не испытывать судьбу и направилась к выходу",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Parking" }]
    },
    Parking: {
        background: "images/yana/Parking.jpg",
        text: "Подойдя к своему внедорожнику",
        buttons: [{ label: "ДАЛЕЕ", nextScene: "Parking" }]
    },

};

// ===================== СЦЕНЫ ИГНАТА (все пути -> images/ignat/) =====================
const ignatScenes = {
    start: {
        background: "images/ignat/ignat_bg.jpg",
        text: "История Игната ещё пишется. Ожидайте обновлений! Вернитесь позже или испытайте ветку Валеры.",
        buttons: [{ label: "🔙 ВЫБОР ПЕРСОНАЖА", action: () => returnToCharacterSelect() }]
    }
};

// ===================== ОСНОВНЫЕ ФУНКЦИИ =====================
function loadScene(sceneId, skipType = false) {
    if (!currentScenes) return;
    const scene = currentScenes[sceneId];
    if (!scene) return;
    currentScene = sceneId;
    const bgElement = document.getElementById("gameBg");
    if (bgElement && scene.background) bgElement.style.backgroundImage = `url('${scene.background}')`;
    const storyEl = document.getElementById("storyText");
    const buttonsContainer = document.getElementById("buttonsContainer");
    if (buttonsContainer) buttonsContainer.innerHTML = "";
    const finalText = typeof scene.text === 'function' ? scene.text() : scene.text;
    if (skipType) {
        if (storyEl) storyEl.innerHTML = finalText.replace(/\n/g, '<br>');
        showButtons(scene);
    } else {
        if (storyEl) {
            storyEl.style.cursor = "pointer";
            const clickHandler = () => {
                if (isTyping) {
                    skipTyping(storyEl, finalText);
                    storyEl.style.cursor = "default";
                    storyEl.removeEventListener("click", clickHandler);
                    showButtons(scene);
                }
            };
            storyEl.addEventListener("click", clickHandler, { once: true });
            typeText(storyEl, finalText, 35, () => {
                storyEl.style.cursor = "default";
                showButtons(scene);
            });
        }
    }
}

function showButtons(scene) {
    const buttonsContainer = document.getElementById("buttonsContainer");
    if (buttonsContainer) {
        buttonsContainer.innerHTML = "";
        scene.buttons.forEach(btn => {
            const button = document.createElement("button");
            button.className = "choice-btn";
            button.innerHTML = btn.label;
            button.onclick = () => {
                if (btn.action) btn.action();
                if (btn.nextScene) loadScene(btn.nextScene);
            };
            buttonsContainer.appendChild(button);
        });
    }
}

function startGame(character) {
    currentCharacter = character;
    if (character === 'valera') currentScenes = valeraScenes;
    else if (character === 'yana') currentScenes = yanaScenes;
    else if (character === 'ignat') currentScenes = ignatScenes;
    else return;
    
    setCharacterMusic(character);
    document.getElementById("characterSelect").style.display = "none";
    
    showIntro(character, () => {
        document.getElementById("gameScreen").classList.add("visible");
        const bgElement = document.getElementById("gameBg");
        if (bgElement && currentScenes.start.background) {
            bgElement.style.backgroundImage = `url('${currentScenes.start.background}')`;
        }
        loadScene("start");
    });
}

function returnToCharacterSelect() {
    document.getElementById("gameScreen").classList.remove("visible");
    document.getElementById("gameBg").style.backgroundImage = "";
    document.getElementById("characterSelect").style.display = "flex";
    currentCharacter = null;
    currentScenes = null;
    setCharacterMusic('valera');
}

function restartGame() {
    if (currentCharacter && currentScenes) {
        const bgElement = document.getElementById("gameBg");
        if (bgElement && currentScenes.start.background) bgElement.style.backgroundImage = `url('${currentScenes.start.background}')`;
        loadScene("start");
    } else {
        returnToCharacterSelect();
    }
}

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
document.addEventListener("DOMContentLoaded", () => {
    initMusic('valera');
    setTimeout(() => autoStartMusic(), 100);
    
    // ЗАПУСКАЕМ РОТАЦИЮ ФОНОВ В МЕНЮ
    startMenuBackgroundRotation();
    
    setTimeout(() => {
        showMusicNotification("меню");
    }, 500);
    
    const startGameBtn = document.getElementById("startGameBtn");
    if (startGameBtn) {
        startGameBtn.addEventListener("click", () => {
            document.getElementById("mainMenu").style.display = "none";
            document.getElementById("characterSelect").style.display = "flex";
        });
    }
    
    const selectBtns = document.querySelectorAll(".select-char-btn");
    selectBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".character-card");
            if (card) {
                const character = card.getAttribute("data-character");
                startGame(character);
            }
        });
    });
    
    const cards = document.querySelectorAll(".character-card");
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains("select-char-btn")) return;
            const character = card.getAttribute("data-character");
            startGame(character);
        });
    });
    
    const audioCtrl = document.getElementById("musicPlayer");
    if (audioCtrl) audioCtrl.addEventListener("click", toggleMusic);
    
    console.log("💀 9 ДНЕЙ - игра загружена. Нажмите 'Начать игру' для выбора персонажа.");
});