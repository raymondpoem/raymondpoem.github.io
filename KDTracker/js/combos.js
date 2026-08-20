import {
    startComboTest
} from "./combo-test.js";


let tricks = [];
let save = null;
let saveProgress = null;

let currentCombo = {
    id: null,
    name: "",
    steps: []
};


/*
 * Initialize
 */

export function initCombos(
    trickDatabase,
    currentSave,
    saveFunction
) {
    tricks = trickDatabase;
    save = currentSave;
    saveProgress = saveFunction;

    populateTrickSelect();
    renderCombo();
    renderSavedCombos();
    setupEvents();
}


/*
 * Populate trick selector
 */

function populateTrickSelect() {

    const select =
        document.querySelector(
            "#combo-trick"
        );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    for (const trick of tricks) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            trick.id;

        option.textContent =
            trick.name;

        select.appendChild(
            option
        );
    }
}


/*
 * Events
 */

function setupEvents() {

    document
        .querySelector("#combo-add")
        ?.addEventListener(
            "click",
            addStep
        );

    document
        .querySelector("#combo-clear")
        ?.addEventListener(
            "click",
            clearCombo
        );

    document
        .querySelector("#combo-new")
        ?.addEventListener(
            "click",
            newCombo
        );

    document
        .querySelector("#combo-save")
        ?.addEventListener(
            "click",
            saveCombo
        );
}


/*
 * Add trick to combo
 */

function addStep() {

    const trickSelect =
        document.querySelector(
            "#combo-trick"
        );

    const repetitionsInput =
        document.querySelector(
            "#combo-repetitions"
        );

    const trickId =
        trickSelect.value;

    const repetitions =
        Number.parseInt(
            repetitionsInput.value,
            10
        );

    if (!trickId) {
        return;
    }

    if (
        !Number.isInteger(repetitions) ||
        repetitions < 1
    ) {
        return;
    }

    currentCombo.steps.push({
        trickId: trickId,
        repetitions: repetitions
    });

    renderCombo();
}


/*
 * Render current combo
 */

function renderCombo() {

    const list =
        document.querySelector(
            "#combo-list"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";


    currentCombo.steps.forEach(
        (step, index) => {

            const trick =
                tricks.find(
                    trick =>
                        trick.id ===
                        step.trickId
                );

            if (!trick) {
                return;
            }


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "combo-step";


            /*
             * Number
             */

            const number =
                document.createElement(
                    "span"
                );

            number.className =
                "combo-step-number";

            number.textContent =
                `${index + 1}.`;


            /*
             * Name
             */

            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "combo-step-name";

            name.textContent =
                trick.name;


            /*
             * Repetitions
             */

            const repetitions =
                document.createElement(
                    "input"
                );

            repetitions.type =
                "number";

            repetitions.min =
                "1";

            repetitions.step =
                "1";

            repetitions.value =
                step.repetitions;

            repetitions.className =
                "combo-step-repetitions";


            repetitions.addEventListener(
                "change",
                () => {

                    const value =
                        Number.parseInt(
                            repetitions.value,
                            10
                        );

                    if (
                        Number.isInteger(value) &&
                        value >= 1
                    ) {

                        step.repetitions =
                            value;

                    } else {

                        repetitions.value =
                            step.repetitions;
                    }
                }
            );


            /*
             * Move up
             */

            const up =
                document.createElement(
                    "button"
                );

            up.type =
                "button";

            up.textContent =
                "↑";

            up.title =
                "Move up";


            up.addEventListener(
                "click",
                () => {

                    if (index === 0) {
                        return;
                    }

                    const previous =
                        currentCombo.steps[
                            index - 1
                        ];

                    currentCombo.steps[
                        index - 1
                    ] =
                        currentCombo.steps[
                            index
                        ];

                    currentCombo.steps[index] =
                        previous;

                    renderCombo();
                }
            );


            /*
             * Move down
             */

            const down =
                document.createElement(
                    "button"
                );

            down.type =
                "button";

            down.textContent =
                "↓";

            down.title =
                "Move down";


            down.addEventListener(
                "click",
                () => {

                    if (
                        index >=
                        currentCombo.steps.length - 1
                    ) {
                        return;
                    }

                    const next =
                        currentCombo.steps[
                            index + 1
                        ];

                    currentCombo.steps[
                        index + 1
                    ] =
                        currentCombo.steps[
                            index
                        ];

                    currentCombo.steps[index] =
                        next;

                    renderCombo();
                }
            );


            /*
             * Remove
             */

            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.textContent =
                "×";

            remove.title =
                "Remove";


            remove.addEventListener(
                "click",
                () => {

                    currentCombo.steps.splice(
                        index,
                        1
                    );

                    renderCombo();
                }
            );


            row.appendChild(
                number
            );

            row.appendChild(
                name
            );

            row.appendChild(
                repetitions
            );

            row.appendChild(
                up
            );

            row.appendChild(
                down
            );

            row.appendChild(
                remove
            );

            list.appendChild(
                row
            );
        }
    );


    updateComboName();
}


/*
 * Keep name field synchronized
 */

function updateComboName() {

    const input =
        document.querySelector(
            "#combo-name"
        );

    if (!input) {
        return;
    }

    input.value =
        currentCombo.name;
}


/*
 * Clear current combo
 */

function clearCombo() {

    currentCombo.steps = [];

    renderCombo();
}


/*
 * New combo
 */

function newCombo() {

    currentCombo = {
        id: null,
        name: "",
        steps: []
    };

    renderCombo();
}


/*
 * Save combo
 */

function saveCombo() {

    const nameInput =
        document.querySelector(
            "#combo-name"
        );

    const name =
        nameInput.value.trim();


    if (!name) {

        alert(
            "Enter a combo name."
        );

        return;
    }


    if (
        currentCombo.steps.length === 0
    ) {

        alert(
            "Add at least one trick."
        );

        return;
    }


    /*
     * Create ID for new combo
     */

    if (!currentCombo.id) {

        currentCombo.id =
            createComboId(
                name
            );
    }


    currentCombo.name =
        name;


    /*
     * Preserve statistics
     */

    const existing =
        save.combos[
            currentCombo.id
        ];


    if (existing) {

        currentCombo.attempts =
            existing.attempts || 0;

        currentCombo.landed =
            existing.landed || 0;

        currentCombo.lastAttempt =
            existing.lastAttempt || null;

        currentCombo.sessions =
            existing.sessions || [];

    } else {

        currentCombo.attempts =
            0;

        currentCombo.landed =
            0;

        currentCombo.lastAttempt =
            null;

        currentCombo.sessions =
            [];
    }


    save.combos[
        currentCombo.id
    ] =
        structuredClone(
            currentCombo
        );


    saveProgress(
        save
    );


    renderSavedCombos();
}


/*
 * Render saved combos
 */

function renderSavedCombos() {

    const list =
        document.querySelector(
            "#saved-combo-list"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";


    const combos =
        Object.values(
            save.combos
        );


    if (combos.length === 0) {

        const empty =
            document.createElement(
                "p"
            );

        empty.textContent =
            "No saved combos.";

        list.appendChild(
            empty
        );

        return;
    }


    combos.forEach(
        combo => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "saved-combo";


            /*
             * Name
             */

            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "saved-combo-name";

            name.textContent =
                combo.name;


            /*
             * Edit
             */

            const load =
                document.createElement(
                    "button"
                );

            load.type =
                "button";

            load.textContent =
                "Edit";


            load.addEventListener(
                "click",
                () => {

                    currentCombo =
                        structuredClone(
                            combo
                        );

                    renderCombo();

                }
            );


            /*
             * Practice
             */

            const practice =
                document.createElement(
                    "button"
                );

            practice.type =
                "button";

            practice.textContent =
                "Practice";


            practice.addEventListener(
                "click",
                () => {

                    startComboTest(
                        combo.id
                    );

                }
            );


            /*
             * Delete
             */

            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.textContent =
                "Delete";


            remove.addEventListener(
                "click",
                () => {

                    const confirmed =
                        confirm(
                            `Delete "${combo.name}"?`
                        );

                    if (!confirmed) {
                        return;
                    }


                    delete save.combos[
                        combo.id
                    ];


                    saveProgress(
                        save
                    );


                    if (
                        currentCombo.id ===
                        combo.id
                    ) {

                        newCombo();

                    }


                    renderSavedCombos();

                }
            );


            /*
             * Add everything to row
             */

            row.appendChild(
                name
            );

            row.appendChild(
                load
            );

            row.appendChild(
                practice
            );

            row.appendChild(
                remove
            );


            list.appendChild(
                row
            );
        }
    );
}


/*
 * Create combo ID
 */

function createComboId(
    name
) {

    const base =
        name
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );


    return (
        base ||
        "combo"
    ) +
        "-" +
        Date.now().toString(36);
}
