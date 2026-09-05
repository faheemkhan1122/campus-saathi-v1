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
/* =========================================
   USER NAME & PROFILE
========================================= */

const savedName = localStorage.getItem("userName");

const greetingName =
    document.getElementById("userGreetingName");

const profileName =
    document.getElementById("userProfileName");

const userAvatar =
    document.getElementById("userAvatar");


if (savedName) {

    // Greeting
    if (greetingName) {
        greetingName.textContent = savedName;
    }

    // Profile name
    if (profileName) {
        profileName.textContent = savedName;
    }

    // Avatar initials
    if (userAvatar) {

        const initials = savedName
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

        userAvatar.textContent = initials;
    }

}
