import m from "mithril";

//Компоненты:
//     App: основной контейнер для: или вопросы если кнопка "Start" нажата, или начать тест
//     Questionnaire: логика опроса и вывод подходящего тарифа

//Step(1): Questions and choices

// Типы
type PlanName = string;
type PlanScore = number;
type Choice = {
    option: string;
    plans: Record<PlanName, PlanScore>;       // Define a type for a choice of plans, where the keys (PlanName) are strings and the values (PlanScore) are plan objects
}

interface Question {
    question: string;
    choices: Choice[];
}

//interface - это тип которий задается в TypeScript для QuestionnaireState
interface QuestionnaireState {
    currentIndex: number;
    answers: Choice[];
    plan: string;
    hoverStates: Record<string, boolean>;   //Record<K, V> — это встроенный дженерик тип в TypeScript, который означает: "объект, у которого ключи типа K, а значения типа V". Например "button1": true.
    selectedId?: string | null;            //?-делает это свойство необязательным Это означает:Поле selectedId может: вообще отсутствовать [1. Пока пользователь ничего не выбрал], быть строкой (string)(2. Пользователь выбрал элемент), или быть null(3.Пользователь снял выбор).
    animation: boolean;
    showResultContainer: boolean;
    showQuestionContainer: boolean;
    selectedIndex: number;

    topPlans: PlanName[];

    evaluateTopPlans(answers: Choice[]): string[];    //какой план больше всего подходит? и какие планы на 2-м и 3-м месте по рейтенгу.
    moveToSelected(directionOrIndex: "prev" | "next" | number): void; //показывает результат планов в конце. возвращаемое значение: void (ничего не возвращает), может быть отдельно moveToSelected("prev"), moveToSelected("next") или moveToSelected(3). Но вместе-это проще для API(Application Programming Interface)- "набор команд/входов
   /* generateDescription(answers: Choice[], topPlans: string[]): string[];*/  //динамические результаты опроса, анализ или в тарифный план входит то что выбрано или предлажить альтернативу.
    generatePlanDescriptions: (answers: any, topPlans: PlanName[]) => Record<PlanName, string>;
}

interface AppState {
    started: boolean;
    animation: boolean;
}

// Вопросы
const questions: Question[] = [
    {
        question: "How do you intend to use this mailbox — for business or personal purposes?",
        choices: [
            {option: "For business purposes", plans: {Essential: 1, Advanced: 1, Unlimited: 1}},
            {option: "For personal use", plans: {Free: 1, Revolutionary: 1, Legend: 1}},
            {option: "I haven’t decided yet.", plans: {Free: 1}}
        ],
    },
   /* {
        question: "Would you like to add additional email addresses to this mailbox? If yes, how many do you require?",
        choices: [
            {option: "Yes, I’d like to", plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}},
            {option: "No, I don’t want to", plans: {Free: 1}}
        ],
    },*/
    {
        question: "Would you like to add additional email addresses to your mailbox? If yes, how many do you require?",
        choices: [
            {option: "1-15", plans: {Essential: 1, Revolutionary: 1}},
            {option: "16-30", plans: {Legend: 1, Unlimited: 1, Advanced: 1,}},
            {option: "No, I don’t want to", plans: {Free: 1}},
        ],
    },
   /* {
        question: "Would you like to use your own domain (e.g., yourcompany.com) with this mailbox?If yes, how many would you like to configure?",
        choices: [
            {
                option: "Yes, please",
                plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}
            },
            {option: "No, I don't need", plans: {Free: 1}}
        ],
    },*/
    {
        question: "Would you like to use your own domain (e.g., yourcompany.com) with this mailbox? If yes, how many would you like to configure?",
        choices: [
            {option: "1-3", plans: {Essential: 1, Revolutionary: 1}},
            {option: "4-10", plans: {Legend: 1, Advanced: 1}},
            {option: "Unlimited domains", plans: {Unlimited: 1}},
            {option: "No, I don't need", plans: {Free: 1}}
        ],
    },
    {
        question: "How many calendars do you plan to use?",
        choices: [
            {option: "One calendar", plans: {Free: 1}},
            {
                option: "Unlimited calendars",
                plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}
            }
        ],
    },
    {
        question: "What is your estimated email storage requirement?",
        choices: [
            {option: "1 GB", plans: {Free: 1}},
            {option: "2-20 GB", plans: {Revolutionary: 1}},
            {option: "21-50 GB", plans: {Essential: 1}},
            {option: "51-500 GB", plans: {Legend: 1, Advanced: 1}},
            {option: "501-1000 GB", plans: {Unlimited: 1}}
        ],
    }
];


interface PlanFeatures {
    usage: string;
    storage: string;
    emails: string;
    domains: string;
    calendars: string;
    labels?: string;
    family?: string;
}

const planDetails: Record<PlanName,PlanFeatures> = {
    Free: {
        usage: "For personal use",
        emails: "No extra email addresses",
        storage: "1 GB storage",
        domains: "No custom domains",
        labels: "3 labels",
        calendars: "📅 One calendar",
        family: "No Family option"
    },
    Revolutionary: {
        usage: "For personal use",
        emails: "15 extra email addresses",
        storage: "20 GB storage",
        domains: "3 custom domains",
        calendars: "Unlimited calendars",
        labels: "Unlimited labels",
        family: "Family option available"
    },
    Legend: {
        usage: "For personal use",
        emails: "30 extra email addresses",
        storage: "500 GB storage",
        domains: "10 custom domains",
        calendars: "Unlimited calendars",
        labels: "Unlimited labels",
        family: "Family option available"
    },
    Essential: {
        usage: "For business purposes",
        emails: "15 extra email addresses",
        storage: "50 GB storage",
        domains: "3 custom domains",
        calendars: "  Unlimited calendars",
        labels: "Unlimited labels",
    },
    Advanced: {
        usage: "For business purposes",
        emails: "30 extra addresses",
        storage: "500 GB storage",
        domains: "10 custom domains",
        calendars: "Unlimited calendars",
        labels: "Unlimited labels",
    },
    Unlimited: {
        usage: "For business purposes",
        emails: "30 extra addresses",
        storage: "1000 GB storage",
        domains: "Unlimited domains",
        calendars: "Unlimited calendars",
        labels: "Unlimited labels",
    }
};






// Компонент Questionnaire
const Questionnaire: m.Component<{}, QuestionnaireState> = { //m.Component<{}, QuestionnaireState> - это тип в TypeScript, описывающий компонент Mithril. У этого компонента нет входных параметров (пустой объект {}).Он использует состояние с типом QuestionnaireState. (m.Component<Attrs, State> - Attrs-Тип входных параметров (данные "снаружи"), State-Тип внутреннего состояния, которое будет доступно в компоненте(данные "внутри")).
    //Зачем нужен oninit: 1. Инициализация состояния компонента, 2. Подготовка переменных, флагов, логики до того, как компонент появится на экране. 3. Сброс или очистка данных при повторной инициализации (например, при переходах)
    // vnode.state — объект состояния, типизирован как QuestionnaireState.
    // vnode.attrs — если бы были входные параметры (но в моем случае их нет — {}).

    oninit(vnode) {
        const state = vnode.state
        state.currentIndex = 0;
        state.answers = [];
        state.hoverStates = {};
        state.animation = false;
        state.showResultContainer = true;
        state.showQuestionContainer = true;
        state.selectedIndex = 1;
        state.topPlans = [];

        //------------------------------------------------------------------------Score for every plan------------------------------//
        state.evaluateTopPlans = (answers: Choice[]): string[] => {
            // Найдём 3 тариф с наибольшим количеством баллов
            const score: Record<PlanName, PlanScore> = {
                Free: 0,
                Revolutionary: 0,
                Legend: 0,
                Essential: 0,
                Advanced: 0,
                Unlimited: 0
            };

            for (const answer of answers) {                                              //1.Проходим по каждому ответу - answers:Choice[]= [{option: "For business purposes", plans: {Essential: 1, Advanced: 1, Unlimited: 1}}]
                for (const plan in answer.plans) {                                       //2. Проходим по каждому плану в ответах - например Essential: 1
                    if (plan in score) {                                                 //3. проверяем: есть ли такое имя тарифа в объекте score.
                        score[plan as PlanName] += answer.plans[plan as PlanName];       // Добавляем баллы текущего ответа к общему счёту для этого тарифа.
                    }
                }
            }

            //-------------------------------------------------------------------Определяем кто является победителем по опросу------------------------------------------------------------//
            const sorted = Object.entries(score)                          //1.Преобразует объект в массив пар с Object.entries() как [ключ, значение]: [["Free", 3], ["Revolutionary", 2]..]
                .sort((a, b) => b[1] - a[1])  //2.Сортирует массив по убыванию очков (то есть по второму элементу в паре):  (.sort() — это встроенный метод массива в JavaScript, который сортирует элементы массива по заданному правилу. a - это например ["Free", 3] и b - может например быть ["Legend", 5])
                .map(entry => entry[0]);                           //3.Оставляет только названия планов (первый элемент в паре): ["Free", "Revolutionary" ...]
            return sorted.slice(0, 3);                                          //4.Обрезаем массив, чтобы оставить только первые 3 имени.
          //--------------------------------------------------------------------------------------------------------------------------------------------------//

            /* const result = Object.entries(score).reduce((max, curr) => curr[1] > max[1] ? curr : max);
             return result[0]; //название тарифа*/
        };

        //--------------------------------------------------------------------Final page: function to switch between "prev" and "next" or number------------------------------------------------//
        state.moveToSelected = (directionOrIndex: "prev" | "next" | number) => {
            let newIndex = vnode.state.selectedIndex;

            if (directionOrIndex === "prev") {
                newIndex = Math.max(0, newIndex - 1);
            } else if (directionOrIndex == "next") {
                newIndex = Math.min(2, newIndex + 1);
            } else {
                newIndex = directionOrIndex;
            }
            vnode.state.selectedIndex = newIndex;
        }
        //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


        //-----------------------------------------------------------Function for the description generation----------------------------------------------------------------------------------------------//

        state.generatePlanDescriptions = (answers: Choice[], topPlans: string[]) => {
            const descriptions: Record<PlanName, string> = {};

                                                                                  //1.Соберём option, что выбрал пользователь в selectedOptions например const selectedOptions = [option: "I haven’t decided yet.", option: "No, I don’t want to", option: "No, I don't need", option: "One calendar" ]
            const selectedOptions = new Set<string>();

            for (const answer of answers) {                                        // selectedOptions = [option: "I haven’t decided yet.", option: "No, I don’t want to", option: "No, I don't need", option: "One calendar"]
                selectedOptions.add(answer.option);
            }


            for (const planName of topPlans) {                                     //2. Проверяем какие тарифные планы у нас в топ 3 по опросу нп. topPlans:PlanName[] = ["Free", "Revolutionary", "Advanced"]
                if (!planDetails[planName /*as PlanName*/]) continue;              //3. Проверяем или эти топ 3 плана у нас в planDetails и если нет то продолжаем проверку.

                const included= new Set<string>();                                    //4. Создаем контейнеры для:   //included,
                const extra: string[] = [];                                                                            //extra,
                const missing: string[] = [];                                                                              //missing


                for (const answer of answers) {                                     //5. Сравним выбранное пользователем с тем, что включает тариф
                    if (answer.plans[planName] > 0) {
                        included.add(answer.option);                               //5.1. Добавляем опцию  в included если она была выбрана-> пример included = [option: "I haven’t decided yet.", option: "No, I don’t want to", option: "No, I don't need", option: "One calendar" ]
                    } else {
                        missing.push(answer.option);   //???                         //5.2. Добавляем опцию в missing если она не была выбрана -> пример missing =
                    }
                }

                // Находим всё, что включено в тариф, но пользователь об этом не просил
                const allFeatures = Object.values(planDetails[planName /*as PlanName*/]);                                 //need array from the object!
                for (const feature of allFeatures) {
                    const alreadyMentioned = [...included, ...missing].some(txt =>
                        feature.toLowerCase().includes(txt.toLowerCase())
                    );
                    if (!alreadyMentioned) {
                        extra.push(feature);
                    }
                }

                // Составим финальное описание
                let description = `📦 ${planName} is a recommended plan for you.`;

                if (included.size > 0) {
                    description += `✅ Because it includes what you selected:` + [...included].map(i => `✔ ${i}`);
                }

                if (extra.length > 0) {
                    description += `🎁  Also includes additional features:\n` + extra.map(i => `➕ ${i}`);
                }

                if (missing.length > 0) {
                    description += `⚠ This plan does not include:\n` + missing.map(i => `✖ ${i}`);
                    description += `💡 Consider looking at alternatives (${topPlans[1]} or ${topPlans[2]}), they might include these.\n`;
                }

                descriptions[planName as PlanName] = description;
            }

            return descriptions;
        };


    },


    view: function (vnode) {
        const state = vnode.state;
        const showResultContainer = state.showResultContainer;
        const showQuestionContainer = state.showQuestionContainer;

           //result to show
        if (state.currentIndex >= questions.length) {
            const topPlans = state.evaluateTopPlans(state.answers);                                                       //TOP PLANS: результат работы функции "список рекомендуемых планов"
            state.topPlans = topPlans;                                                                                            //здесь результат (topPlans) сохраняется в состояние (state) — в новое свойство topPlans. Проще говоря: Мы сохраняем список подходящих планов в объект состояния, чтобы использовать его дальше (например, показать пользователю).
            const planDescriptions = state.generatePlanDescriptions(state.answers, topPlans);                   //DESCRIPTION: результат работы функции "planDescriptions"




            //---------------------------Logic for the carousel -------------------------------------//
            const getStyle = (index: number): any => {
                const base = {
                    position: "absolute",
                    transform: "translateY(-50%)",
                    transition: "all 0.6s ease",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontSize: "20px",
                    opacity: 1,
                    zIndex: 1,
                    display: "flex",
                    justifyContent: "center",
                };

                if (index === state.selectedIndex) {
                    return {
                        ...base,
                        left: "50%",
                        transform: "translateX(-50%) translateY(0)",
                        zIndex: 10, //above div "next" and "prev"
                        width: "400px",
                        height: "620px",
                        backgroundColor: "#ecd9d9",
                        boxShadow: "-5px 1px 37px -13px #00000075",
                    };
                } else if (index === state.selectedIndex - 1) { // prev
                    return {
                        ...base,
                        left: "20%",
                        transform: "translateX(-60%) translateY(40px)",
                        opacity: 0.3,
                        /*  zIndex: 5,*/
                        width: "250px",
                        height: "600px",
                        backgroundColor: "#f8eded",
                        boxShadow: "10px 10px 5px #00000033",

                    };
                } else if (index === state.selectedIndex + 1) { //next
                    return {
                        ...base,
                        left: "80%",
                        transform: "translateX(-40%) translateY(40px)",
                        opacity: 0.3,
                        /*      zIndex: 5,*/
                        width: "250px",
                        height: "600px",
                        backgroundColor: "#f8eded",
                        boxShadow: "-21px 15px 18px 0px #00000033",
                    };
                } else {
                    return {display: "none"};
                }
            };
            //-----------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------The result page for the 3Top plans------------------------------------------------------------------------------------------------------------//

            return showResultContainer && m("div", {
                style: {
                    maxWidth: "800px",
                    padding: "10px",
                    margin: "0 auto",
                    textAlign: "center",
                    fontFamily: "sans-serif",
                    boxSizing: "border-box"
                }
            }, [
                m("h2", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, "Recommended plan is:"),
                /*m("p", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center; font-size: 25px;"
                }, /!*state.plan*!/),*/
                //----------------------------------------------------added carousel here----------------------------------------//
                m("div", {
                    style: {
                        width: "100%",
                        height: "750px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        overflow: "hidden",
                        marginTop: "20px"
                    }
                }, [
                    m("div", {
                            style: {
                                position: "relative",
                                width: "100%",
                                height: "100%"
                            },
                            oncreate: ({dom}) => {


                                //-------------------------------mouseWheel to move sliders on the result page-------------------------------------------//
                                const onWheel: EventListener = (event) => {
                                    const e = event as WheelEvent;                                  //for Typeskript to understand what is for the event
                                    event.preventDefault();                                         //preventDefault ensures the page won’t scroll down. Но браузер по умолчанию думает, что ты не будешь ничего останавливать. Поэтому он может запретить использовать preventDefault(), если ты не указал passive: false.

                                    if (e.deltaY > 0) {                                             //когда колесико миши кручу к себе - deltaY становится больше и это значит что нужно показывать "next" в моем случае
                                        state.moveToSelected("next");
                                    } else {
                                        state.moveToSelected("prev");                              //и если от себя то deltaY уменьшается и значит что нужно показывать "prev".
                                    }
                                    m.redraw();
                                };

                                dom.addEventListener("wheel", onWheel, {passive: false}); //{passive: false}-Говорю браузеру: Позволь мне использовать event.preventDefault() внутри onWheel".
                            }
                            //----------------------------------------------------------------------------------------------------------------------------//

                        },
                        //---------------------------------divs on the final pages: recommended and 2 alternatives--------------------------------------//
                        [
                            m("div", {                                                                  //right side "alternative"
                                style: getStyle(0),
                                onclick: () => state.moveToSelected(0)
                            }, [
                                m("div", {style: {width: "400px", borderRadius: "10px",}},
                                [m("p", {
                                    style: {
                                        background: "#e5a85b",
                                        position: "absolute",
                                        /*top: "1%",*/
                                        width: "100%",
                                        textAlign: "center",
                                        fontSize: "18px",
                                        margin: "0 auto",
                                        padding: "5px 0",
                                        borderRadius: "10px 10px 0 0",
                                        color: "white",
                                    }
                                }, "Alternative"),
                                    m("h3", {
                                        style: {
                                            /*background: "red", */
                                            position: "absolute",
                                            /*top: "1%",*/
                                            width: "100%",
                                            textAlign: "center",
                                            fontSize: "20px",
                                            margin: "40px auto 0 auto",
                                            padding: "5px 0",
                                            fontWeight: "normal",
                                        }
                                    }, state.topPlans?.[1] || ""),
                                m("p", {
                                    style: {
                                        marginTop: "120px",
                                        padding: "20px",
                                        fontSize: "14px",
                                        color: "#333",
                                        textAlign: "left"
                                    }
                                }, planDescriptions[state.topPlans?.[1] as PlanName])]),
                                m("a", {
                                href: "https://app.tuta.com/signup#subscription=advanced&type=business&interval=12",
                                target: "_blank",
                                style: {
                                    display: "block",
                                    textAlign: "center",
                                    color: "#ff0a0a",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    position:"absolute",
                                    padding: "10px 50px",
                                    borderRadius: "10px",
                                    backgroundColor: "#ffffff",
                                    bottom:"50px",
                                    border: "solid 2px",
                                }
                            }, "Get Started")]),



                            m("div", {                                                                     //central plan (top plan)
                                    style: getStyle(1),
                                    onclick: () => state.moveToSelected(1)
                                }, [
                                m("div", {style: {width: "400px", borderRadius: "10px",}},
                                    [m("p", {
                                        style: {
                                            background: "red",
                                            position: "absolute",
                                            /*top: "1%",*/
                                            width: "100%",
                                            textAlign: "center",
                                            fontSize: "18px",
                                            margin: "0 auto",
                                            padding: "5px 0",
                                            borderRadius: "10px 10px 0 0",
                                            color: "white",
                                        }
                                    }, "The best plan for you"),
                                        m("h3", {
                                        style: {
                                            /*background: "red", */
                                            position: "absolute",
                                            /*top: "1%",*/
                                            width: "100%",
                                            textAlign: "center",
                                            fontSize: "30px",
                                            margin: "40px auto 0 auto",
                                            padding: "5px 0",
                                            fontWeight:"normal",
                                        }
                                    }, state.topPlans?.[0] || ""), //В view центральная карточка (index === 1) рендерит state.topPlans[0] — лучший тариф.
                                m("p", {
                                    style: {
                                        marginTop: "120px",
                                        padding: "20px",
                                        fontSize: "14px",
                                        color: "#333",
                                        textAlign: "left"
                                    }
                                }, planDescriptions[state.topPlans?.[0] as PlanName])]),
                                m("a", {
                                    href: "https://app.tuta.com/signup#subscription=advanced&type=business&interval=12",
                                    target: "_blank",
                                    style: {
                                        display: "block",
                                        textAlign: "center",
                                        color: "white",
                                        textDecoration: "none",
                                        cursor: "pointer",
                                        position:"absolute",
                                        padding: "10px 50px",
                                        borderRadius: "10px",
                                        backgroundColor: "#ff0a0a",
                                        bottom:"50px",
                                    }
                                }, "Get Started")]),



                            m("div", { //left side "alternative plan"
                                style: getStyle(2),
                                onclick: () => state.moveToSelected(2)
                            }, [
                                m("div", {style: {width: "400px", borderRadius: "10px",}},
                                [m("p", {
                                    style: {
                                        background: "#e5a85b",
                                        position: "absolute",
                                        /*top: "1%",*/
                                        width: "100%",
                                        textAlign: "center",
                                        fontSize: "18px",
                                        margin: "0 auto",
                                        padding: "5px 0",
                                        borderRadius: "10px 10px 0 0",
                                        color: "white",
                                    }
                                }, "Alternative"),
                                    m("h3", {
                                        style: {
                                            /*background: "red", */
                                            position: "absolute",
                                            /*top: "1%",*/
                                            width: "100%",
                                            textAlign: "center",
                                            fontSize: "20px",
                                            margin: "40px auto 0 auto",
                                            padding: "5px 0",
                                            fontWeight: "normal",
                                        }
                                    }, state.topPlans?.[2] || ""),
                                m("p", {
                                    style: {
                                        marginTop: "120px",
                                        padding: "20px",
                                        fontSize: "14px",
                                        color: "#333",
                                        textAlign: "left"
                                    }
                                }, m.trust(planDescriptions[state.topPlans?.[2] as PlanName]))]),
                                m("a", {
                                    href: "https://app.tuta.com/signup#subscription=advanced&type=business&interval=12",
                                    target: "_blank",
                                    style: {
                                        display: "block",
                                        textAlign: "center",
                                        color: "#ff0a0a",
                                        textDecoration: "none",
                                        cursor: "pointer",
                                        position:"absolute",
                                        padding: "10px 50px",
                                        borderRadius: "10px",
                                        backgroundColor: "#ffffff",
                                        bottom:"50px",
                                        border: "solid 2px",
                                    }
                                }, "Get Started")])]),
                //-----------------------------------------------------------------------------------------------------------//
                ]),
                m("button", {
                    style: {
                        width: "200px",
                        fontWeight: "700",
                        color: "#fff",
                        padding: "10px 0",
                        background: "linear-gradient(45deg, #ff1f4f, #d2002d 100%)",
                        borderRadius: "100px",
                        margin: "0 10px",
                        cursor: "pointer",
                        fontSize: "17px",
                        textAlign: "center",
                        minWidth: "60px",
                        height: "50px",
                    },
                    onclick: () => {
                        state.currentIndex = 0;
                        state.answers = [];
                        /*  state.plan = "";*/
                        /*for(let key in score) score[key as keyof typeof score]=0;*/
                    }
                }, "Try test again"),
                m("button", {
                    style: {
                        width: "200px",
                        fontWeight: "700",
                        color: "#850122",
                        padding: "10px 0",
                        background: "linear-gradient(45deg, rgb(153, 113, 122), rgb(53, 46, 60) 100%);",
                        borderRadius: "100px",
                        margin: "0 10px",
                        cursor: "pointer",
                        fontSize: "17px",
                        textAlign: "center",
                        minWidth: "60px",
                        height: "50px",
                    },
                    onclick: () => {
                        /* "this.parentNode.style.display = 'none';"*/
                        vnode.state.showResultContainer = false;
                    }
                }, "Close"),
                             ])}


//---------------------------------------------------------------------------------------------Current questions with options-----------------------------------------------------------------------//
        const current = questions[state.currentIndex];


        return showQuestionContainer && m("div", {
            style: {
                maxWidth: "800px",
                margin: "0 auto",
                fontFamily: "sans-serif",
                opacity: state.animation ? "0" : "1",
                transition: "opacity 0.6s ease-in-out"
            }
        }, [
            m("div", [
                m("button",
                    {
                        style: {
                            fontSize: "14px",
                            color: "#000",
                            textAlign: "center",
                            backgroundColor: "#3333330d",
                            marginRight: "2%",
                            marginTop: "1%",
                            float: "right",
                            borderRadius: "50%",
                            cursor: "pointer",
                            lineHeight: "20px",
                            padding: "0px 5px"

                        },
                        onclick: () => {
                            vnode.state.showQuestionContainer = false;
                        }
                    }, "x"),
                m("h2", {
                    style: {
                        padding: "30px 30px 10px 50px",
                        margin: 0,
                        fontSize: "18px"
                    }
                }, current.question),

            ]),
            m("ul", {
                style: {
                    listStyle: "none",
                    position: "relative",
                    padding: "0"
                }
            }, [
                ...current.choices.map((choice, index) => {
                    const inputId = `choice-${state.currentIndex}-${index}`;
                    const hoverKey = `${state.currentIndex}-${index}`;
                    const isHovered = state.hoverStates[hoverKey];

                    return m("li", {
                            onmouseover: () => {
                                state.hoverStates[hoverKey] = true;
                                m.redraw();
                            },
                            onmouseout: () => {
                                state.hoverStates[hoverKey] = false;
                                m.redraw();
                            },
                            style: {
                                listStyle: "none",
                                position: "relative",
                                borderTop: "1px solid #eee",
                                backgroundColor: isHovered ? "#ffedea" : "transparent",
                                transition: "background-color 0.2s"
                            }
                        }, m("label", {
                            for: inputId,
                            style: {
                                cursor: "pointer",
                                padding: "1.5rem 2.5rem 1.5rem 5rem",
                                position: "relative",
                                width: "100%",
                                margin: "0",
                                fontSize: "16px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                lineHeight: "1.5",
                                boxSizing: "border-box"
                            }
                        }, [m("input[type=radio]", {
                            id: inputId,
                            name: `choice-${state.currentIndex}`,
                            value: choice,
                            style: {
                                cursor: "pointer",
                                display: "none"
                            },
                            onclick: () => {
                                state.selectedId = inputId;
                                state.animation = true; // старт исчезновения
                                m.redraw();

                                setTimeout(() => {
                                    state.answers.push(choice);
                                    state.currentIndex++;
                                    state.selectedId = null;
                                    state.animation = false; //появление нового вопроса
                                    m.redraw();
                                }, 500) // синхронизировано с transition: 0.5s
                            }
                        }),
                            m("", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px"
                                    }
                                },
                                m("span", {
                                        style: {
                                            width: "20px",
                                            height: "20px",
                                            border: "1px solid #bbb",
                                            borderRadius: "50%",
                                            background: state.selectedId === inputId ? "#d93951" : "transparent"
                                        }
                                    },
                                    state.selectedId === inputId ? m("span", {
                                        style: {
                                            color: "white"
                                        }
                                    }, m.trust("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"ionicon\" viewBox=\"0 0 512 512\"><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M416 128L192 384l-96-96\"/></svg>")) : ""),
                                m("span",
                                    choice.option))
                        ])
                    )
                })])]);
    },
};





//  Старт или продолжение
const App: m.Component<{}, AppState> = {
    oninit(vnode) {
        vnode.state.started = false;
        vnode.state.animation = false;
        Object.assign(document.body.style, {
            margin: "0",
            padding: "0",
            background: "#eee",
            /* background: "#fff2ea",*/
            fontFamily: "sans-serif",
            boxSizing: "border-box"
        });    //styles to body
    },
    view(vnode) {
        return m("div", {style: "position: relative; max-width: 800px; margin: 40px auto 0 auto; background: #fff; border-radius: 20px;"}, [
            vnode.state.started
                ? m(Questionnaire)
                : m("div", {style: "max-width: 800px; padding: 10px; margin: 0 auto; /*text-align: center;*/; display: flex; flex-direction: row; justify-content: center; align-items: center; border-box: 20px;"},
                    [m("div", {
                            style: {
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                maxWidth: "400px",
                                padding: "10px",
                                opacity: vnode.state.animation ? "0" : "1",
                                transition: "opacity 0.6s ease-in-out"
                            }
                        },
                        [m("p", {style: {fontSize: "18px",}}, "Confused about which plan to choose?"),
                            m("h2", {
                                style: {
                                    fontSize: "30px",
                                    padding: "5px 0px",
                                    margin: "auto",
                                }
                            }, "Take our 1-minute quiz to find your plan."),
                            m("p", "We’ll show you the best match based on your needs and daily activities.")]),
                        m("button", {
                            style: {
                                width: "200px",
                                fontWeight: "700",
                                color: "#fff",
                                padding: "10px 0",
                                backgroundColor: "#850122",
                                borderRadius: "100px",
                                margin: "0 auto",
                                cursor: "pointer",
                                fontSize: "17px",
                                textAlign: "center",
                                minWidth: "60px",
                                height: "50px",
                                opacity: vnode.state.animation ? "0" : "1",
                                transition: "opacity 0.6s ease-in-out"
                            },
                            onmouseover: (e: Event) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = "#be8f96";
                            },
                            onmouseout: (e: Event) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = "#850122";
                            },
                            onclick: () => {
                                vnode.state.animation = true;
                                m.redraw();

                                setTimeout(() => {
                                    vnode.state.started = true;
                                    vnode.state.animation = false; // сброс
                                    m.redraw(); // показать Questionnaire
                                }, 600); // время анимации должно совпадать с transition
                            }
                        }, "Start Now")
                    ])
        ]);
    }
};


// Точка входа
m.mount(document.body, App);

/*


const businessPlans = ["Essential", "Advanced", "Unlimited"]
const privatePlans = ["Free", "Revolutionary", "Legend"]
const betterDescription = []


for (const answer of answers) {
    if(answer.option == "I haven’t decided yet." && topPlans.some(i => privatePlans.includes(i))) {betterDescription+= "For personal use"
    } else if (
        answer.option == "I haven’t decided yet." && topPlans.some(i => businessPlans.includes(i))) {
        betterDescription+= "For business use"
    } else if (answer.option == "1-15") {betterDescription += "15 extra email addresses"}
    else if(answer.option == "16-30") {
        betterDescription += "30 extra email addresses"
    } else if (answer.option == "No, I don’t want to" && )
}


*/






/*
const businessPlans = ["Essential", "Advanced", "Unlimited"]
const privatePlans = ["Free", "Revolutionary", "Legend"]
const betterDescription = []

switch(answer.option) {
    case "I haven’t decided yet." && topPlans.some(i => privatePlans.includes(i)):
        betterDescription += "For personal use";
        break;

    case "I haven’t decided yet." && topPlans.some(i => businessPlans.includes(i)):
        betterDescription += "For business use";
        break;

    case "1-15" :
        betterDescription += "15 extra email addresses";
        break;

    case "16-30":
        betterDescription += "30 extra email addresses"
        break;


}
*/


