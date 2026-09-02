document.addEventListener("DOMContentLoaded", () => {

    console.log("Campus Saathi V1 loaded.");


    /* =========================================
       SIDEBAR
    ========================================== */

    const sidebar = document.querySelector(".sidebar");

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const closeButton =
        document.getElementById("mobileCloseBtn");


    /* =========================================
       OPEN MOBILE SIDEBAR
    ========================================== */

    if (menuButton && sidebar) {

        menuButton.addEventListener("click", () => {

            sidebar.classList.add("mobile-open");

        });

    }


    /* =========================================
       CLOSE MOBILE SIDEBAR
    ========================================== */

    if (closeButton && sidebar) {

        closeButton.addEventListener("click", () => {

            sidebar.classList.remove("mobile-open");

        });

    }


    /* =========================================
       CLOSE AFTER NAVIGATION
    ========================================== */

    const sidebarLinks =
        document.querySelectorAll(
            ".sidebar .nav-link"
        );


    sidebarLinks.forEach(link => {

        link.addEventListener("click", () => {

            sidebar.classList.remove("mobile-open");

        });

    });


    /* =========================================
       CURRENT PAGE
    ========================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    const navLinks =
        document.querySelectorAll(
            ".sidebar .nav-link"
        );


    navLinks.forEach(link => {

        const href =
            link.getAttribute("href");


        if (href === currentPage) {

            link.classList.add("active");

        }

    });


    /* =========================================
       ESC KEY
    ========================================== */

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            sidebar
        ) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

    });

});