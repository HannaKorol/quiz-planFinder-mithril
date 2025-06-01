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
    //// Define a type for a choice of
// plans, where the keys (PlanName) are strings
// and the values (PlanScore) are plan objects
    plans: Record<PlanName, PlanScore>;
}

interface Question {
    question: string;
    choices: Choice[];
}


interface QuestionnaireState {
    currentIndex: number;
    answers: Choice[];
    plan: string;
    hoverStates: Record<string, boolean>;
    selectedId?: string | null;
    animation: boolean;
    showResultContainer: boolean;
    showQuestionContainer: boolean;
    selectedIndex: number;

    moveToSelected(directionOrIndex: "prev" | "next" | number): void;

    evaluateTopPlans(answers: Choice[]): string[];

    topPlans: string [];

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
            {option: "I’m not sure yet", plans: {Free: 1}}
        ],
    },
    {
        question: "Would you like to add additional email addresses to this mailbox?",
        choices: [
            {option: "Yes", plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}},
            {option: "No", plans: {Free: 1}}
        ],
    },
    {
        question: "If applicable, how many additional email addresses do you require?",
        choices: [
            {option: "1-15", plans: {Essential: 1, Revolutionary: 1}},
            {option: "16-30", plans: {Legend: 1, Unlimited: 1, Advanced: 1,}},
            {option: "No need", plans: {Free: 1}},
        ],
    },
    {
        question: "Would you like to use your own domain (e.g., yourcompany.com) with this mailbox?",
        choices: [
            {
                option: "Yes",
                plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}
            },
            {option: "No", plans: {Free: 1}}
        ],
    },
    {
        question: "If applicable, how many custom domains would you like to configure?",
        choices: [
            {option: "1-3", plans: {Essential: 1, Revolutionary: 1}},
            {option: "4-10", plans: {Legend: 1, Advanced: 1}},
            {option: "unlimited", plans: {Unlimited: 1}}
        ],
    },
    {
        question: "How many calendars do you plan to use?",
        choices: [
            {option: "One", plans: {Free: 1}},
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


// Компонент Questionnaire
const Questionnaire: m.Component<{}, QuestionnaireState> = {
    //Зачем нужен oninit: 1. Инициализация состояния компонента, 2. Подготовка переменных, флагов, логики до того, как компонент появится на экране. 3. Сброс или очистка данных при повторной инициализации (например, при переходах)
    oninit(vnode) {
        vnode.state.currentIndex = 0;
        vnode.state.answers = [];
        /*vnode.state.plan = "";*/
        vnode.state.hoverStates = {};
        vnode.state.animation = false;
        vnode.state.showResultContainer = true;
        vnode.state.showQuestionContainer = true;
        vnode.state.selectedIndex = 1; //for the final page "slider movement"
        vnode.state.topPlans = [];

        //Final page: slider
        vnode.state.moveToSelected = (directionOrIndex: "prev" | "next" | number) => {
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

//Which plan receive the highest rate based on the user´s answers:
        vnode.state.evaluateTopPlans = (answers: Choice[]): string[] => {
            // Найдём тариф с наибольшим количеством баллов
            const score: Record<PlanName, PlanScore> = {
                Free: 0,
                Revolutionary: 0,
                Legend: 0,
                Essential: 0,
                Advanced: 0,
                Unlimited: 0
            };

            for (const answer of answers) {
                for (const plan in answer.plans) {
                    if (Object.prototype.hasOwnProperty.call(score, plan)) {
                        score[plan as PlanName] += answer.plans[plan as PlanName];
                    }
                }
            }

            const sorted = Object.entries(score)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);

            return sorted.slice(0, 3);


            /* const result = Object.entries(score).reduce((max, curr) => curr[1] > max[1] ? curr : max);
             return result[0]; //название тарифа*/
        };
    },

    view: function (vnode) {
        const state = vnode.state;
        const showResultContainer = state.showResultContainer;
        const showQuestionContainer = state.showQuestionContainer;
        /*
                const showQuestionContainer = vnode.state.showQuestionContainer;
        */
//result to show
        if (state.currentIndex >= questions.length) {
            /*
                        state.plan = state.evaluatePlan(state.answers);
            */
            const topPlans = state.evaluateTopPlans(state.answers);
            state.topPlans = topPlans;

            //Logic for the carusel -------------------------------------
            const getStyle = (index: number): any => {
                const base = {
                    position: "absolute",
                    /*      top: "50%",*/
                    transform: "translateY(-50%)",
                    transition: "all 0.6s ease",
                    padding: "50px",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontSize: "20px",
                    opacity: 1,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                };

                if (index === state.selectedIndex) {
                    return {
                        ...base,
                        left: "50%",
                        transform: "translateX(-50%) translateY(0)",
                        zIndex: 10, //above div "next" and "prev"
                        width: "300px",
                        height: "570px",
                        backgroundColor: "#ffcccc",
                        boxShadow: "-5px 1px 37px -13px #00000075",
                    };
                } else if (index === state.selectedIndex - 1) { // prev
                    return {
                        ...base,
                        left: "20%",
                        transform: "translateX(-50%) translateY(40px)",
                        opacity: 0.7,
                        /*  zIndex: 5,*/
                        width: "200px",
                        height: "550px",
                        backgroundColor: "#f8eded",
                        boxShadow: "10px 10px 5px #00000033",

                    };
                } else if (index === state.selectedIndex + 1) { //next
                    return {
                        ...base,
                        left: "80%",
                        transform: "translateX(-50%) translateY(40px)",
                        opacity: 0.7,
                        /*      zIndex: 5,*/
                        width: "200px",
                        height: "550px",
                        backgroundColor: "#f8eded",
                        boxShadow: "-21px 15px 18px 0px #00000033",
                    };
                } else {
                    return {display: "none"};
                }
            };
            //-------------------------------------------------------------

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


                //added carousel here----------------------------------------
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

                            //mouseWheel to move sliders on the result page
                            const onWheel: EventListener = (event) => {
                                const e = event as WheelEvent;
                                event.preventDefault();

                                if (e.deltaY > 0) {
                                    state.moveToSelected("next");
                                } else {
                                    state.moveToSelected("prev");
                                }
                                m.redraw();
                            };

                            dom.addEventListener("wheel", onWheel, {passive: false});
                        }
                    }, [
                        m("div", {
                            style: getStyle(0),
                            onclick: () => state.moveToSelected(0)
                        }, state.topPlans?.[1] || ""),
                        m("div", {
                            style: getStyle(1),
                            onclick: () => state.moveToSelected(1)
                        }, state.topPlans?.[0] || ""),
                        m("div", {
                            style: getStyle(2),
                            onclick: () => state.moveToSelected(2)
                        }, state.topPlans?.[2] || ""),
                    ]),
                ]),
                m("button", {
                    style: {
                        width: "200px",
                        fontWeight: "700",
                        color: "#fff",
                        padding: "10px 0",
                        background: "linear-gradient(45deg, #ff1f4f, #d2002d 100%",
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
                }, "Try again"),
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
            ])
                ;
        }

// Current questions with options
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
    }
    ,

};


//  Старт или продолжение
const App: m.Component<{}, AppState> = {
    oninit(vnode) {
        vnode.state.started = false;
        vnode.state.animation = false;


        //styles to body
        Object.assign(document.body.style, {
            margin: "0",
            padding: "0",
            background: "#eee",
            /* background: "#fff2ea",*/
            fontFamily: "sans-serif",
            boxSizing: "border-box"
        });
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
