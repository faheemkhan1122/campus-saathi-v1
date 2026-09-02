document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SILENT STUDY MODE
    ========================== */

    const silentToggle =
        document.getElementById("silentToggle");

    const silentStatus =
        document.getElementById("silentStatus");

    let silentMode = false;

    silentToggle.addEventListener("click", () => {

        silentMode = !silentMode;

        if (silentMode) {

            document.body.classList.add("silent-active");

            silentStatus.classList.add("on");

            silentStatus.innerHTML =
                "<span></span> Silent mode is on";

            silentToggle.textContent =
                "Turn off Silent Mode";

        } else {

            document.body.classList.remove("silent-active");

            silentStatus.classList.remove("on");

            silentStatus.innerHTML =
                "<span></span> Mode is off";

            silentToggle.textContent =
                "Turn on Silent Mode";
        }

    });


    /* =========================
       BREATHING RESET
    ========================== */

    const resetBtn =
        document.getElementById("resetBtn");

    const breathingCircle =
        document.getElementById("breathingCircle");

    const breathingText =
        document.getElementById("breathingText");


    let breathingRunning = false;


    resetBtn.addEventListener("click", () => {

        if (breathingRunning) {
            return;
        }

        breathingRunning = true;

        let seconds = 60;

        resetBtn.textContent =
            "Reset in progress...";


        const cycle = () => {

            if (seconds <= 0) {

                breathingText.textContent =
                    "Done";

                breathingCircle.classList.remove(
                    "breathe-in",
                    "breathe-out"
                );

                resetBtn.textContent =
                    "Start 60-second reset";

                breathingRunning = false;

                return;
            }


            const phase =
                seconds % 8;


            if (phase >= 4) {

                breathingText.textContent =
                    "Breathe in";

                breathingCircle.classList.add(
                    "breathe-in"
                );

                breathingCircle.classList.remove(
                    "breathe-out"
                );

            } else {

                breathingText.textContent =
                    "Breathe out";

                breathingCircle.classList.add(
                    "breathe-out"
                );

                breathingCircle.classList.remove(
                    "breathe-in"
                );

            }


            seconds--;

            setTimeout(cycle, 1000);

        };


        cycle();

    });


    /* =========================
       MOOD CHECK-IN
    ========================== */

    const moodOptions =
        document.querySelectorAll(".mood-option");

    const checkinResult =
        document.getElementById("checkinResult");


    moodOptions.forEach(option => {

        option.addEventListener("click", () => {

            moodOptions.forEach(item => {
                item.classList.remove("selected");
            });

            option.classList.add("selected");

            const mood =
                option.dataset.mood;


            checkinResult.textContent =
                `Thanks for checking in. You selected "${mood}". Be kind to yourself today.`;

        });

    });


    /* =========================
       SUPPORT MODAL
    ========================== */

    const supportBtn =
        document.getElementById("supportBtn");

    const supportModal =
        document.getElementById("supportModal");

    const closeSupport =
        document.getElementById("closeSupport");

    const supportForm =
        document.getElementById("supportForm");


    supportBtn.addEventListener("click", () => {

        supportModal.classList.add("show");

    });


    closeSupport.addEventListener("click", () => {

        supportModal.classList.remove("show");

    });


    supportModal.addEventListener("click", event => {

        if (event.target === supportModal) {

            supportModal.classList.remove("show");

        }

    });


    supportForm.addEventListener("submit", event => {

        event.preventDefault();

        alert(
            "Your message has been shared anonymously in this V1 prototype."
        );

        supportForm.reset();

        supportModal.classList.remove("show");

    });

});