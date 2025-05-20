import m from "mithril";

m.render(document.body, m("h1", "Hello from Mithril + ESBuild!"))

//Компоненты:
//     App: основной контейнер
//     Questionnaire: логика опроса
//     Result: вывод подходящего тарифа


//Step(1): Questions and choices
const questions = [
    {
        question: "Do you want to use this mailbox  for business or for yourself?",
        choices: ["Business", "Personal"],
    },
    {
        question: "Do you need extra email addresses in your mailbox?",
        choices: ["Yes", "No"],
    },
    {
        question: "How many extra email addresses do you need?",
        choices: ["15", "30"],
    },
    {
        question: "Do you need custom domains? If yes, how many?",
        choices: ["3", "10", "unlimited"],
    },
    {
        question: "Do you need one calendar or more?",
        choices: ["One", "More"],
    },
    {
        question: "How much storage space do you need to save your emails?",
        choices: ["1 GB", "20 GB", "50 GB", "500 GB", "1000 GB"],
    }
]


const Questionnaire = {
    currentIndex: 0,
    answers: [],
    plan: "",
}

evaluatePlan(answers)
{
    if (answers.includes("Personal") && answers.include("Yes") && answers.include("15") && answers.include("3") && answers.include("More") && answers.include("20 GB")) {
        return "Revolutionary";
    } else if (answers.includes("Personal") && answers.include("Yes") && answers.include("30") && answers.include("10") && answers.include("More") && answers.include("500 GB")) {
        return "Legend";
    } else if (answers.includes("Business") && answers.include("Yes") && answers.include("15") && answers.include("3") && answers.include("More") && answers.include("50 GB")) {
        return "Essential";
    } else if (answers.includes("Business") && answers.include("Yes") && answers.include("30") && answers.include("10") && answers.include("More") && answers.include("500 GB")) {
        return "Advanced";
    } else if (answers.includes("Business") && answers.include("Yes") && answers.include("30") && answers.include("unlimited") && answers.include("More") && answers.include("1000 GB")) {
        return "Unlimited";
    } else {
        return "Basic"
    }
},

view()
{
    if (Questionnaire.currentIndex >= questions.length) {
        Questionnaire.plan = Questionnaire.evaluatePlan(Questionnaire.answers);
        return m("div", [
            m("h2", "Recommended plan is:"),
            m("p", Questionnaire.plan),
            m("button", {
                onClick: () => {
                    Questionnaire.currentIndex = 0;
                    Questionnaire.answers = [];
                }
            }, "Try again"),
        ]);
    }
}

const App = {
    started: false,
    view() {
        return m("div", {style: "padding: 20px; font-family: sans - serif;"}, [
            !App.started ? m("button", {
                    onclick: () => (App.started = true)
                }, "Start test")
                : m(Questionnaire)
        ]);
    }
    };


m.mount(document.body, App)






/*
const App = {
    step: 0,
    view: function () {
        return App.step == 0 && m("div", {class: "container"}, [
            m("div", {class: "container"}, [
                m("h2", "Not sure which plan is right for you?"),
                m("h1", "Take the test to find out which plan you need."),
                m("button", {
                    id: "test-start-button", onclick: () => {
                        App.step = 1;
                        m.redraw();
                    },
                }, "Start Test")
            ]),
            App.step == 1 && m("div", {class: "container"}, [
                m("p", "Do you want to use this mailbox  for business or for yourself?"),
                m("button", {
                    class: "test-continues", onclick: () => App.step = 2.1
                }, "Next Question")
            ]),
            App.step == 2.1 && m("div", {class: "container"}, [
                m("p", "Do you want to use your mail account for business or for yourself?"),
                m("button", {
                    class: "test-continues", onclick: () => App.step = 2
                }, "Next Question")
            ]),
        ])
    }
}
*/

