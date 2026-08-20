import {
    loadTrickDatabase,
    renderTrickList
} from "./tricks.js";

import {
    loadSave,
    saveProgress,
    getTrickProgress,
    exportSave,
    importSave
} from "./storage.js";
import {
    initCombos
} from "./combos.js";
import {
    initComboTest,
    startComboTest
} from "./combo-test.js";


let tricks = [];
let save;


/*
 * Start
 */

async function main() {

tricks = await loadTrickDatabase();
save = loadSave();

initCombos(
    tricks,
    save,
    saveProgress
);

    initComboTest(
    tricks,
    save,
    saveProgress
);
    const trickList =
        document.querySelector("#trick-list");

    const search =
        document.querySelector("#trick-search");


    /*
     * Navigation
     */

    setupNavigation();


    /*
     * Initial trick list
     */

    refreshList();


    /*
     * Search
     */

    search.addEventListener(
        "input",
        refreshList
    );


    /*
     * Trick events
     */

    trickList.addEventListener(
        "click",
        handleTrickClick
    );


    trickList.addEventListener(
        "input",
        handleTrickInput
    );


    /*
     * Save controls
     */

    setupSaveControls();
}


/*
 * Refresh tricks
 */

function refreshList() {

    renderTrickList(
        tricks,
        save,
        getTrickProgress
    );
}


/*
 * Navigation
 */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            "nav button[data-section]"
        );


    const sections =
        document.querySelectorAll(
            "main section[data-page]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;


                sections.forEach(section => {

                    section.hidden =
                        section.dataset.page !== target;

                });


                buttons.forEach(other => {

                    other.classList.toggle(
                        "active",
                        other === button
                    );

                });

            }
        );

    });


    /*
     * Start on Tricks
     */

    const first =
        document.querySelector(
            'nav button[data-section="tricks"]'
        );

    if (first) {
        first.classList.add("active");
    }
}


/*
 * Trick clicks
 */

function handleTrickClick(event) {

    /*
     * Checkbox
     */

    if (
        event.target.matches(
            ".trick-checkbox"
        )
    ) {

        const trickId =
            event.target.dataset.trickId;


        const progress =
            getTrickProgress(
                save,
                trickId
            );


        if (event.target.checked) {

            progress.landed =
                progress.goal;

        } else {

            progress.landed =
                0;

        }


        saveProgress(save);

        refreshList();


        reopenTrick(trickId);

        return;
    }


    /*
     * Test button
     */

    if (
        event.target.matches(
            ".test-trick"
        )
    ) {

        startTest(
            event.target
        );

        return;
    }
}


/*
 * Trick inputs
 *
 * Automatically save whenever
 * the user changes a number.
 */

function handleTrickInput(event) {

    if (
        !event.target.matches(
            ".trick-goal, .trick-landed, .trick-attempts"
        )
    ) {
        return;
    }


    const item =
        event.target.closest(
            ".trick-item"
        );


    if (!item) {
        return;
    }


    const trickId =
        item.dataset.trickId;


    const goal =
        Number.parseInt(
            item.querySelector(
                ".trick-goal"
            ).value,
            10
        );


    const landed =
        Number.parseInt(
            item.querySelector(
                ".trick-landed"
            ).value,
            10
        );


    const attempts =
        Number.parseInt(
            item.querySelector(
                ".trick-attempts"
            ).value,
            10
        );


    /*
     * Don't save invalid intermediate
     * input such as an empty field.
     */

    if (
        !Number.isInteger(goal) ||
        goal < 1
    ) {
        return;
    }


    if (
        !Number.isInteger(landed) ||
        landed < 0
    ) {
        return;
    }


    if (
        !Number.isInteger(attempts) ||
        attempts < 0
    ) {
        return;
    }


    if (landed > attempts) {
        return;
    }


    const progress =
        getTrickProgress(
            save,
            trickId
        );


    progress.goal =
        goal;

    progress.landed =
        landed;

    progress.attempts =
        attempts;


    saveProgress(save);
}


/*
 * Reopen a trick after
 * refreshing the list.
 */

function reopenTrick(trickId) {

    const item =
        document.querySelector(
            `.trick-item[data-trick-id="${trickId}"]`
        );


    if (item) {
        item.open = true;
    }
}


/*
 * Save controls
 */

function setupSaveControls() {

    const exportButton =
        document.querySelector(
            "#save-export"
        );


    const copyButton =
        document.querySelector(
            "#save-copy"
        );


    const importButton =
        document.querySelector(
            "#save-import"
        );


    const saveString =
        document.querySelector(
            "#save-string"
        );


    /*
     * Export
     */

    exportButton.addEventListener(
        "click",
        async () => {

            try {

                saveString.value =
                    await exportSave(save);

            } catch (error) {

                console.error(error);

                alert(
                    "Could not create save."
                );
            }

        }
    );


    /*
     * Copy
     */

    copyButton.addEventListener(
        "click",
        async () => {

            if (!saveString.value) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    saveString.value
                );


                copyButton.textContent =
                    "Copied";


                setTimeout(
                    () => {
                        copyButton.textContent =
                            "Copy";
                    },
                    1000
                );

            } catch (error) {

                console.error(error);

                saveString.select();

                alert(
                    "Copy failed. The save string has been selected."
                );
            }

        }
    );


    /*
     * Import
     */

    importButton.addEventListener(
        "click",
        async () => {

            const string =
                saveString.value.trim();


            if (!string) {

                alert(
                    "Paste a save string first."
                );

                return;
            }


            try {

                const imported =
                    await importSave(
                        string
                    );


                const confirmed =
                    confirm(
                        "Import this save? Your current progress will be replaced."
                    );


                if (!confirmed) {
                    return;
                }


                save =
                    imported;


                saveProgress(save);

                refreshList();


                importButton.textContent =
                    "Imported";


                setTimeout(
                    () => {
                        importButton.textContent =
                            "Import Save";
                    },
                    1000
                );


            } catch (error) {

                console.error(error);

                alert(
                    "Invalid or corrupted save string."
                );
            }

        }
    );
}


/*
 * Start a testing session
 */

function startTest(button) {

    const item =
        button.closest(
            ".trick-item"
        );


    const trickId =
        item.dataset.trickId;


    const trick =
        tricks.find(
            trick => trick.id === trickId
        );


    if (!trick) {
        return;
    }


    const input =
        prompt(
            `How many attempts for ${trick.name}?`,
            "10"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number.parseInt(
            input,
            10
        );


    if (
        !Number.isInteger(amount) ||
        amount < 1
    ) {

        alert(
            "Test length must be at least 1."
        );

        return;
    }


    showTestingInterface(
        trick,
        amount
    );
}


/*
 * Testing interface
 */

function showTestingInterface(
    trick,
    amount
) {

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "test-overlay";


    const panel =
        document.createElement(
            "div"
        );

    panel.id =
        "test-panel";


    let results = [];


    /*
     * Render test
     */

    function render() {

        panel.innerHTML = "";


        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            trick.name;

        panel.appendChild(title);


        const counter =
            document.createElement(
                "p"
            );

        counter.className =
            "test-counter";

        counter.textContent =
            `Attempt ${results.length + 1} / ${amount}`;

        panel.appendChild(counter);


        /*
         * Buttons
         */

        const buttons =
            document.createElement(
                "div"
            );

        buttons.className =
            "test-buttons";


        const landed =
            document.createElement(
                "button"
            );

        landed.textContent =
            "LANDED";

        landed.className =
            "test-landed";


        landed.addEventListener(
            "click",
            () => record(true)
        );


        const missed =
            document.createElement(
                "button"
            );

        missed.textContent =
            "MISSED";

        missed.className =
            "test-missed";


        missed.addEventListener(
            "click",
            () => record(false)
        );


        buttons.appendChild(
            landed
        );

        buttons.appendChild(
            missed
        );

        panel.appendChild(
            buttons
        );


        /*
         * Current statistics
         */

        const landedCount =
            results.filter(
                Boolean
            ).length;


        const status =
            document.createElement(
                "p"
            );

        status.textContent =
            `${landedCount} landed / ${results.length} attempts`;

        panel.appendChild(
            status
        );


        /*
         * Undo
         */

        if (results.length > 0) {

            const undo =
                document.createElement(
                    "button"
                );

            undo.textContent =
                "Undo Last";


            undo.addEventListener(
                "click",
                () => {

                    results.pop();

                    render();

                }
            );


            panel.appendChild(
                undo
            );
        }


        /*
         * Cancel
         */

        const cancel =
            document.createElement(
                "button"
            );

        cancel.textContent =
            "Cancel";


        cancel.addEventListener(
            "click",
            close
        );


        panel.appendChild(
            cancel
        );
    }


    /*
     * Record result
     */

    function record(result) {

        results.push(
            result
        );


        if (
            results.length >= amount
        ) {

            finish();

            return;
        }


        render();
    }


    /*
     * Finish session
     */

    function finish() {

        const progress =
            getTrickProgress(
                save,
                trick.id
            );


        const landed =
            results.filter(
                Boolean
            ).length;


        const now =
            new Date().toISOString();


        /*
         * Update totals
         */

        progress.attempts +=
            results.length;


        progress.landed +=
            landed;


        /*
         * Session data
         */

        progress.sessions.push({

            date: now,

            results: [
                ...results
            ]

        });


        /*
         * Dates
         */

        if (
            !progress.firstAttempt
        ) {

            progress.firstAttempt =
                now;
        }


        progress.lastAttempt =
            now;


        /*
         * Automatic save
         */

        saveProgress(
            save
        );


        close();


        refreshList();


        reopenTrick(
            trick.id
        );
    }


    /*
     * Close
     */

    function close() {

        document.removeEventListener(
            "keydown",
            keyboardHandler
        );


        overlay.remove();
    }


    /*
     * Keyboard controls
     */

    function keyboardHandler(event) {

        const key =
            event.key.toLowerCase();


        if (key === "l") {

            record(true);

            return;
        }


        if (key === "m") {

            record(false);

            return;
        }


        if (
            event.key === "Backspace" &&
            results.length > 0
        ) {

            event.preventDefault();

            results.pop();

            render();

            return;
        }


        if (
            event.key === "Escape"
        ) {

            close();

            return;
        }
    }


    document.addEventListener(
        "keydown",
        keyboardHandler
    );


    overlay.appendChild(
        panel
    );

    document.body.appendChild(
        overlay
    );


    render();
}


/*
 * Run
 */

main().catch(
    error => {

        console.error(
            "KDTracker failed to start:",
            error
        );

    }
);
